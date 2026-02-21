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

    const { notebookId, language, prompt } = await request.json();
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
        type: "mind_map",
        title: `마인드맵 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { language, prompt },
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

        const mindmapPrompt = `다음 소스 내용을 기반으로 ${LANGUAGE_NAMES[language] || "한국어"}로 마인드맵을 생성해주세요.

소스 내용:
${sourceTexts.slice(0, 20000)}

${prompt ? `추가 지시사항: ${prompt}` : ""}

[중요 지시사항]
- 'topic'의 텍스트는 시각적인 마인드맵 노드에 들어가야 하므로 **반드시 1~3단어 이내의 아주 짧고 명확한 키워드** 위주로 추출하세요.
- 긴 문장은 절대 사용하지 마세요. (예: "머신러닝의 학습 방법" -> "머신러닝", "학습 방법")
- 중심주제(central)는 문서 전체를 아우르는 가장 중요한 1단어~2단어로 작성하세요.

다음 JSON 형식으로 응답해주세요 (코드블록 없이 순수 JSON만):
{
  "central": "중심 주제 (짧은 단어)",
  "branches": [
    {
      "topic": "가지 주제 (짧은 단어)",
      "children": [
        { "topic": "하위 주제 (짧은 단어)", "children": [] }
      ]
    }
  ]
}`;

        const result = await generateText(mindmapPrompt);

        let mindmapData;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          mindmapData = JSON.parse(jsonMatch?.[0] || result);
        } catch {
          mindmapData = { central: "마인드맵", branches: [], rawText: result };
        }

        await adminClient
          .from("studio_outputs")
          .update({ content: { mindmap: mindmapData }, generation_status: "completed" })
          .eq("id", outputId);
      } catch (error) {
        console.error(`[MindMap ${outputId}] 생성 실패:`, error);
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
    console.error("MindMap API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
