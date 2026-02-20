import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId } = await request.json();

    if (!notebookId) {
      return NextResponse.json(
        { error: "노트북 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 소스 텍스트 조회
    const { data: sources, error } = await supabase
      .from("sources")
      .select("extracted_text")
      .eq("notebook_id", notebookId)
      .eq("processing_status", "completed")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: "소스가 없습니다." },
        { status: 400 }
      );
    }

    // 각 소스 앞 500자, 총 3000자 제한 (제목 생성엔 충분)
    let totalText = "";
    for (const source of sources) {
      if (!source.extracted_text) continue;
      const chunk = source.extracted_text.slice(0, 500);
      if (totalText.length + chunk.length > 3000) {
        totalText += chunk.slice(0, 3000 - totalText.length);
        break;
      }
      totalText += chunk + "\n\n";
    }

    if (!totalText.trim()) {
      return NextResponse.json(
        { error: "소스에 텍스트가 없습니다." },
        { status: 400 }
      );
    }

    const title = await generateText(
      `다음 텍스트의 핵심 주제를 담은 한국어 제목을 하나만 출력하세요. 25자 이내, 따옴표/설명 없이 제목만.\n\n${totalText}`,
      { maxOutputTokens: 700 }
    );

    const cleanTitle = title.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ title: cleanTitle });
  } catch (error) {
    console.error("제목 추천 오류:", error);
    return NextResponse.json(
      { error: "제목 추천에 실패했습니다." },
      { status: 500 }
    );
  }
}
