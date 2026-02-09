import { NextResponse, after } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";

const LANGUAGE_NAMES: Record<string, string> = {
  ko: "한국어", en: "English", ja: "日本語", zh: "中文",
  es: "Español", fr: "Français", de: "Deutsch",
};

const DETAIL_LABELS: Record<string, string> = {
  concise: "핵심만 간결하게 정리한",
  standard: "적절한 수준으로 정리한",
  detailed: "세부 내용까지 포함한 포괄적인",
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notebookId, language, detailLevel, prompt } = await request.json();
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
        type: "report",
        title: `보고서 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { language, detailLevel, prompt },
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

        const reportPrompt = `다음 소스 내용을 기반으로 ${LANGUAGE_NAMES[language] || "한국어"}로 ${DETAIL_LABELS[detailLevel] || "적절한 수준으로 정리한"} 보고서를 마크다운 형식으로 작성해주세요.

소스 내용:
${sourceTexts.slice(0, 20000)}

${prompt ? `추가 지시사항: ${prompt}` : ""}

보고서 형식:
- 제목 (# 헤딩)
- 요약 (## 요약)
- 본문 섹션들 (## 각 섹션 헤딩)
- 결론 (## 결론)
- 마크다운 문법을 사용하여 표, 목록, 강조 등을 포함해주세요.`;

        const markdown = await generateText(reportPrompt);

        await adminClient
          .from("studio_outputs")
          .update({ content: { markdown }, generation_status: "completed" })
          .eq("id", outputId);
      } catch (error) {
        console.error(`[Report ${outputId}] 생성 실패:`, error);
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
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
