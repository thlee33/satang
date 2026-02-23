import { NextResponse, after } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";
import { buildSourceTexts } from "@/lib/utils/source-text";

const LANGUAGE_NAMES: Record<string, string> = {
  ko: "한국어", en: "English", ja: "日本語", zh: "中文",
  es: "Español", fr: "Français", de: "Deutsch",
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notebookId, language, questionCount, prompt } = await request.json();
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
        type: "quiz",
        title: `퀴즈 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { language, questionCount, prompt },
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
        const sourceTexts = buildSourceTexts(sources);

        const quizPrompt = `다음 소스 내용을 기반으로 ${LANGUAGE_NAMES[language] || "한국어"}로 ${questionCount || 10}개의 객관식 문제를 생성해주세요.

소스 내용:
${sourceTexts}

${prompt ? `추가 지시사항: ${prompt}` : ""}

다음 JSON 형식으로 응답해주세요 (코드블록 없이 순수 JSON만):
[
  {
    "question": "문제 내용",
    "options": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
    "correctIndex": 0,
    "explanation": "정답 해설"
  }
]`;

        const result = await generateText(quizPrompt);

        let questions;
        try {
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          questions = JSON.parse(jsonMatch?.[0] || result);
        } catch {
          questions = [{ question: "파싱 실패", options: [], correctIndex: 0, explanation: result }];
        }

        await adminClient
          .from("studio_outputs")
          .update({ content: { questions }, generation_status: "completed" })
          .eq("id", outputId);
      } catch (error) {
        console.error(`[Quiz ${outputId}] 생성 실패:`, error);
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
    console.error("Quiz API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
