import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("[PDF] === 요청 시작 ===");

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[PDF] 인증 실패");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrls, title } = await request.json();
    console.log(`[PDF] 이미지 ${imageUrls?.length ?? 0}장, 제목: "${title}"`);

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 }
      );
    }

    console.log(`[PDF] 첫 번째 URL: ${(imageUrls as string[])[0]?.substring(0, 120)}...`);

    // 모든 이미지를 병렬로 다운로드
    const fetchStart = Date.now();
    const imageResults = await Promise.allSettled(
      (imageUrls as string[]).map(async (url: string, idx: number) => {
        const t0 = Date.now();
        const res = await fetch(url);
        const fetchElapsed = Date.now() - t0;

        if (!res.ok) {
          console.error(`[PDF] 이미지 ${idx + 1} fetch 실패: status=${res.status}, ${fetchElapsed}ms`);
          throw new Error(`Failed: ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        console.log(`[PDF] 이미지 ${idx + 1} fetch 성공: ${(arrayBuffer.byteLength / 1024).toFixed(0)}KB, ${fetchElapsed}ms`);

        const contentType = res.headers.get("content-type") || "";
        const isJpeg =
          contentType.includes("jpeg") ||
          contentType.includes("jpg") ||
          (bytes[0] === 0xff && bytes[1] === 0xd8);
        const isPng =
          contentType.includes("png") ||
          (bytes[0] === 0x89 && bytes[1] === 0x50);

        return { bytes, isJpeg, isPng };
      })
    );
    console.log(`[PDF] 전체 이미지 fetch 완료: ${Date.now() - fetchStart}ms`);

    const pdfDoc = await PDFDocument.create();
    let successCount = 0;
    let failCount = 0;

    // 순서를 유지하면서 PDF에 삽입
    for (let idx = 0; idx < imageResults.length; idx++) {
      const result = imageResults[idx];
      if (result.status !== "fulfilled") {
        failCount++;
        continue;
      }

      const { bytes, isJpeg, isPng } = result.value;

      let image;
      try {
        if (isPng) {
          image = await pdfDoc.embedPng(bytes);
        } else if (isJpeg) {
          image = await pdfDoc.embedJpg(bytes);
        } else {
          try {
            image = await pdfDoc.embedJpg(bytes);
          } catch {
            image = await pdfDoc.embedPng(bytes);
          }
        }
      } catch (embedErr) {
        failCount++;
        console.error(`[PDF] 이미지 ${idx + 1} embed 실패:`, embedErr);
        continue;
      }

      // Scale image to fit A4 landscape (842 x 595 points)
      const pageWidth = 842;
      const pageHeight = 595;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const imgAspect = image.width / image.height;
      const pageAspect = pageWidth / pageHeight;

      let drawWidth: number;
      let drawHeight: number;

      if (imgAspect > pageAspect) {
        drawWidth = pageWidth;
        drawHeight = pageWidth / imgAspect;
      } else {
        drawHeight = pageHeight;
        drawWidth = pageHeight * imgAspect;
      }

      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
      successCount++;
    }

    console.log(`[PDF] 이미지 처리 완료: 성공=${successCount}, 실패=${failCount}, 총 소요=${Date.now() - startTime}ms`);

    const saveStart = Date.now();
    const pdfBytes = await pdfDoc.save();
    console.log(`[PDF] PDF 저장 완료: ${(pdfBytes.byteLength / 1024).toFixed(0)}KB, ${Date.now() - saveStart}ms`);

    const filename = encodeURIComponent(title || "slides") + ".pdf";
    console.log(`[PDF] === 응답 전송 (총 ${Date.now() - startTime}ms) ===`);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`[PDF] === 에러 발생 (${Date.now() - startTime}ms) ===`, error);
    return NextResponse.json(
      { error: "PDF 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
