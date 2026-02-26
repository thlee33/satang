import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "이미지를 업로드해주세요." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType,
              },
            },
            {
              text: `이 이미지의 시각적 디자인 스타일을 분석하여, 프레젠테이션 슬라이드 디자인 프롬프트를 한국어로 작성해주세요.

다음 요소를 포함해주세요:
- 주요 색상 (hex 코드 포함)
- 전체적인 분위기/무드
- 타이포그래피 스타일
- 레이아웃 특성
- 디자인 패턴이나 장식 요소

프롬프트만 작성하고 다른 설명은 하지 마세요. 슬라이드 디자인에 바로 적용할 수 있는 구체적인 지시사항으로 작성해주세요.`,
            },
          ],
        },
      ],
    });

    const prompt = response.text?.trim() || "";

    if (!prompt) {
      return NextResponse.json(
        { error: "이미지 분석에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Theme analyze error:", error);
    return NextResponse.json(
      { error: "이미지 분석 실패" },
      { status: 500 }
    );
  }
}
