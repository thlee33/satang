import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PptxGenJS from "pptxgenjs";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrls, title } = await request.json();

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 }
      );
    }

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 16:9 (13.33 x 7.5 inches)
    pptx.title = title || "Slides";

    for (const url of imageUrls as string[]) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const contentType = res.headers.get("content-type") || "";

        const isPng =
          contentType.includes("png") ||
          (bytes[0] === 0x89 && bytes[1] === 0x50);
        const ext = isPng ? "png" : "jpeg";

        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUri = `data:image/${ext};base64,${base64}`;

        const slide = pptx.addSlide();
        slide.addImage({
          data: dataUri,
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      } catch {
        continue; // Skip failed images
      }
    }

    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    const filename = encodeURIComponent(title || "slides") + ".pptx";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PPTX generation error:", error);
    return NextResponse.json(
      { error: "PPTX 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
