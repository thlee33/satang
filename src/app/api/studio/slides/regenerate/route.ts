import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { editSlideImage, generateSlideImage, type SlideType, type DesignTheme } from "@/lib/ai/nano-banana";

async function fetchUserThemePrompt(
  adminClient: Awaited<ReturnType<typeof createServiceRoleClient>>,
  designThemeId?: string,
): Promise<string | undefined> {
  if (!designThemeId) return undefined;
  const { data } = await adminClient
    .from("design_themes")
    .select("prompt")
    .eq("id", designThemeId)
    .single();
  return data?.prompt ?? undefined;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { outputId, slideIndex, prompt } = await request.json();

    if (!outputId || slideIndex === undefined) {
      return NextResponse.json(
        { error: "outputId와 slideIndex가 필요합니다." },
        { status: 400 }
      );
    }

    // Fetch existing output
    const { data: output, error: fetchError } = await supabase
      .from("studio_outputs")
      .select("*")
      .eq("id", outputId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !output) {
      return NextResponse.json(
        { error: "출력물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const content = output.content as {
      slides: Array<{ type?: string; title: string; subtitle?: string; content: string }>;
      designTheme?: DesignTheme;
    };
    const settings = output.settings as Record<string, string>;
    const slides = content?.slides;

    if (!slides || slideIndex < 0 || slideIndex >= slides.length) {
      return NextResponse.json(
        { error: "유효하지 않은 슬라이드 인덱스입니다." },
        { status: 400 }
      );
    }

    const slide = slides[slideIndex];
    const topic = slides[0]?.title || "프레젠테이션";
    const designTheme = content.designTheme || (output.content as Record<string, unknown>)?.designTheme as DesignTheme | undefined;

    // 사용자 디자인 테마 프롬프트 조회
    const adminClient = await createServiceRoleClient();
    const userThemePrompt = await fetchUserThemePrompt(adminClient, settings.designThemeId);

    // 기존 이미지를 다운로드하여 편집 참조로 사용
    const existingImageUrl = (output.image_urls as string[])?.[slideIndex];
    let result: { imageData: string; mimeType: string };

    if (existingImageUrl) {
      try {
        const imgRes = await fetch(existingImageUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get("content-type") || "image/png";
          const base64 = Buffer.from(arrayBuffer).toString("base64");

          result = await editSlideImage({
            existingImageBase64: base64,
            existingImageMimeType: contentType,
            slideNumber: slideIndex + 1,
            totalSlides: slides.length,
            topic,
            slideTitle: slide.title,
            slideContent: slide.content,
            slideType: (slide.type || "content") as SlideType,
            subtitle: slide.subtitle,
            designTheme,
            userThemePrompt,
            language: settings.language || "ko",
            format: settings.format || "detailed",
            editPrompt: prompt,
          });
        } else {
          throw new Error("이미지 다운로드 실패");
        }
      } catch {
        // Fallback: 기존 이미지 참조 실패 시 새로 생성
        const originalPrompt = settings.prompt || "";
        const regenPrompt = [originalPrompt, prompt].filter(Boolean).join("\n");
        result = await generateSlideImage({
          slideNumber: slideIndex + 1,
          totalSlides: slides.length,
          topic,
          slideTitle: slide.title,
          slideContent: slide.content,
          slideType: (slide.type || "content") as SlideType,
          subtitle: slide.subtitle,
          designTheme,
          userThemePrompt,
          language: settings.language || "ko",
          format: settings.format || "detailed",
          userPrompt: regenPrompt,
        });
      }
    } else {
      // 기존 이미지 없음: 새로 생성
      const originalPrompt = settings.prompt || "";
      const regenPrompt = [originalPrompt, prompt].filter(Boolean).join("\n");
      result = await generateSlideImage({
        slideNumber: slideIndex + 1,
        totalSlides: slides.length,
        topic,
        slideTitle: slide.title,
        slideContent: slide.content,
        slideType: (slide.type || "content") as SlideType,
        subtitle: slide.subtitle,
        designTheme,
        userThemePrompt,
        language: settings.language || "ko",
        format: settings.format || "detailed",
        userPrompt: regenPrompt,
      });
    }

    // Upload new image
    const ext = result.mimeType.includes("png") ? "png" : "jpg";
    const filePath = `${user.id}/outputs/${outputId}-slide-${slideIndex + 1}-${Date.now()}.${ext}`;
    const imageBuffer = Buffer.from(result.imageData, "base64");

    await adminClient.storage
      .from("studio")
      .upload(filePath, imageBuffer, { contentType: result.mimeType });

    const {
      data: { publicUrl },
    } = adminClient.storage.from("studio").getPublicUrl(filePath);

    // Update image_urls array
    const imageUrls = [...(output.image_urls as string[])];
    imageUrls[slideIndex] = publicUrl;

    await adminClient
      .from("studio_outputs")
      .update({ image_urls: imageUrls })
      .eq("id", outputId);

    return NextResponse.json({ imageUrl: publicUrl, slideIndex });
  } catch (error) {
    console.error("Slide regeneration error:", error);
    return NextResponse.json(
      { error: "슬라이드 재생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
