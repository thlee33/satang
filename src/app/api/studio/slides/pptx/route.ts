import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PptxGenJS from "pptxgenjs";

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("[PPTX] === 요청 시작 ===");

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[PPTX] 인증 실패");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrls, title } = await request.json();
    console.log(`[PPTX] 이미지 ${imageUrls?.length ?? 0}장, 제목: "${title}"`);

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 }
      );
    }

    // 첫 번째 URL 샘플 로그
    console.log(`[PPTX] 첫 번째 URL: ${(imageUrls as string[])[0]?.substring(0, 120)}...`);

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 16:9 (13.33 x 7.5 inches)
    pptx.title = title || "Slides";

    // 모든 이미지를 병렬로 다운로드
    const fetchStart = Date.now();
    const imageResults = await Promise.allSettled(
      (imageUrls as string[]).map(async (url, idx) => {
        const t0 = Date.now();
        const res = await fetch(url);
        const elapsed = Date.now() - t0;
        if (!res.ok) {
          console.error(`[PPTX] 이미지 ${idx + 1} fetch 실패: status=${res.status}, ${elapsed}ms, url=${url.substring(0, 100)}`);
          throw new Error(`Failed: ${res.status}`);
        }
        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const contentType = res.headers.get("content-type") || "";
        const isPng =
          contentType.includes("png") ||
          (bytes[0] === 0x89 && bytes[1] === 0x50);
        const ext = isPng ? "png" : "jpeg";
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        console.log(`[PPTX] 이미지 ${idx + 1} fetch 성공: ${ext}, ${(arrayBuffer.byteLength / 1024).toFixed(0)}KB, ${elapsed}ms`);
        return `data:image/${ext};base64,${base64}`;
      })
    );
    console.log(`[PPTX] 전체 이미지 fetch 완료: ${Date.now() - fetchStart}ms`);

    const fulfilled = imageResults.filter(r => r.status === "fulfilled").length;
    const rejected = imageResults.filter(r => r.status === "rejected").length;
    console.log(`[PPTX] 성공: ${fulfilled}, 실패: ${rejected} / 총 ${imageResults.length}`);

    if (rejected > 0) {
      imageResults.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`[PPTX] 이미지 ${i + 1} 에러: ${r.reason}`);
        }
      });
    }

    for (const result of imageResults) {
      if (result.status !== "fulfilled") continue;
      const slide = pptx.addSlide();
      slide.addImage({
        data: result.value,
        x: 0,
        y: 0,
        w: "100%",
        h: "100%",
      });
    }

    const writeStart = Date.now();
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    console.log(`[PPTX] 파일 생성 완료: ${(buffer.byteLength / 1024).toFixed(0)}KB, ${Date.now() - writeStart}ms`);

    const filename = encodeURIComponent(title || "slides") + ".pptx";
    console.log(`[PPTX] === 응답 전송 (총 ${Date.now() - startTime}ms) ===`);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`[PPTX] === 에러 발생 (${Date.now() - startTime}ms) ===`, error);
    return NextResponse.json(
      { error: "PPTX 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
