import { NextResponse, after } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";

const LANGUAGE_NAMES: Record<string, string> = {
  ko: "한국어", en: "English", ja: "日本語", zh: "中文",
  es: "Español", fr: "Français", de: "Deutsch",
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notebookId, language, cardCount, prompt } = await request.json();
    if (!notebookId) return NextResponse.json({ error: "노트북 ID가 필요합니다." }, { status: 400 });

    const { data: sources } = await supabase
      .from("sources")
      .select("id, title, extracted_text")
      .eq("notebook_id", notebookId)
      .eq("is_enabled", true)
      .eq("processing_status", "completed");

    if (!sources || sources.length === 0) {
      return NextResponse.json({ error: "활성화된 소스가 없습니다." }, { status: 400 });
    }

    const { data: output, error: insertError } = await supabase
      .from("studio_outputs")
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        type: "flashcard",
        title: `플래시카드 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { language, cardCount, prompt },
        generation_status: "generating",
        source_ids: sources.map((s) => s.id),
      })
      .select()
      .single();

    if (insertError || !output) {
      return NextResponse.json({ error: "출력 레코드 생성 실패" }, { status: 500 });
    }

    const adminClient = await createServiceRoleClient();
    const outputId = output.id;

    after(async () => {
      try {
        const sourceTexts = sources
          .map((s) => `[${s.title}]\n${(s.extracted_text || "").slice(0, 5000)}`)
          .join("\n\n");

        const flashcardPrompt = `다음 소스 내용을 기반으로 ${LANGUAGE_NAMES[language] || "한국어"}로 ${cardCount || 10}개의 플래시카드를 생성해주세요.

소스 내용:
${sourceTexts.slice(0, 20000)}

${prompt ? `추가 지시사항: ${prompt}` : ""}

다음 JSON 형식으로 응답해주세요 (코드블록 없이 순수 JSON만):
[
  { "question": "질문 내용", "answer": "답변 내용" }
]`;

        const result = await generateText(flashcardPrompt);

        let cards;
        try {
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          cards = JSON.parse(jsonMatch?.[0] || result);
        } catch {
          cards = [{ question: "파싱 실패", answer: result }];
        }

        await adminClient
          .from("studio_outputs")
          .update({ content: { cards }, generation_status: "completed" })
          .eq("id", outputId);
      } catch (error) {
        console.error(`[Flashcard ${outputId}] 생성 실패:`, error);
        await adminClient
          .from("studio_outputs")
          .update({
            generation_status: "failed",
            error_message: error instanceof Error ? error.message : "생성 실패",
          })
          .eq("id", outputId);
      }
    });

    return NextResponse.json({ id: output.id, status: "generating" });
  } catch (error) {
    console.error("Flashcard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
