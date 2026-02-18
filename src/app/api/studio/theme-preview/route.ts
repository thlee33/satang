import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "디자인 프롬프트를 입력해주세요." },
        { status: 400 }
      );
    }

    const imagePrompt = `Create a single professional presentation slide as a sample/preview.
This is a COVER slide for a presentation titled "디자인 테마 미리보기" (Design Theme Preview).

The slide should showcase the following design theme:
${prompt}

Layout:
- Title "디자인 테마 미리보기" displayed prominently in the center
- Subtitle "Sample Slide" below the title
- The design should clearly demonstrate the specified theme's colors, mood, and style
- 16:9 aspect ratio, professional presentation slide
- Make the design visually striking to serve as a theme thumbnail`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      config: {
        responseModalities: ["IMAGE"],
        imageGenerationConfig: {
          aspectRatio: "16:9",
        },
      } as Record<string, unknown>,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: Record<string, unknown>) => p.inlineData);

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: "미리보기 이미지 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const imageData = imagePart.inlineData.data as string;
    const mimeType = imagePart.inlineData.mimeType as string;

    // Upload to storage
    const adminClient = await createServiceRoleClient();
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filePath = `${user.id}/themes/preview-${Date.now()}.${ext}`;
    const imageBuffer = Buffer.from(imageData, "base64");

    await adminClient.storage
      .from("studio")
      .upload(filePath, imageBuffer, { contentType: mimeType });

    const {
      data: { publicUrl },
    } = adminClient.storage.from("studio").getPublicUrl(filePath);

    return NextResponse.json({ thumbnailUrl: publicUrl });
  } catch (error) {
    console.error("Theme preview error:", error);
    return NextResponse.json(
      { error: "미리보기 생성 실패" },
      { status: 500 }
    );
  }
}
