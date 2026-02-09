import { NextResponse, after } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/ai/gemini";

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(Buffer.from(buffer));
    return data.text;
  } catch {
    throw new Error("PDF 텍스트 추출 실패");
  }
}

async function extractTextFromUrl(url: string): Promise<{ title: string; text: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "BonBon/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("URL 접근 실패");
  }

  const html = await response.text();

  // Simple HTML to text extraction
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || url;

  // Remove script, style, and extract text
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500000);

  return { title, text };
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

    const body = await request.json();

    // Handle URL source creation
    if (body.type === "url" && body.url) {
      const { title, text } = await extractTextFromUrl(body.url);

      const { data: source, error } = await supabase
        .from("sources")
        .insert({
          notebook_id: body.notebookId,
          user_id: user.id,
          type: "url",
          title,
          original_url: body.url,
          extracted_text: text,
          processing_status: "completed",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "소스 생성 실패" }, { status: 500 });
      }

      // Generate summary asynchronously
      after(async () => {
        try {
          const serviceClient = await createServiceRoleClient();
          const summary = await generateSummary(text);
          await serviceClient
            .from("sources")
            .update({ summary })
            .eq("id", source.id);
        } catch {
          // Summary generation is optional
        }
      });

      return NextResponse.json(source);
    }

    // Handle processing of existing source
    if (body.sourceId) {
      const serviceClient = await createServiceRoleClient();

      // Update status to processing
      await serviceClient
        .from("sources")
        .update({ processing_status: "processing" })
        .eq("id", body.sourceId);

      const { data: source } = await serviceClient
        .from("sources")
        .select("*")
        .eq("id", body.sourceId)
        .single();

      if (!source) {
        return NextResponse.json(
          { error: "소스를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      try {
        let extractedText = "";

        if (source.type === "pdf" && source.file_path) {
          // Download file from storage
          const { data: fileData } = await serviceClient.storage
            .from("sources")
            .download(source.file_path);

          if (fileData) {
            const buffer = await fileData.arrayBuffer();
            extractedText = await extractTextFromPdf(buffer);
          }
        } else if (source.type === "text" && source.file_path) {
          // Download text-based files (.md, .txt, .csv) from storage
          const { data: fileData } = await serviceClient.storage
            .from("sources")
            .download(source.file_path);

          if (fileData) {
            extractedText = await fileData.text();
          }
        } else if (source.type === "text") {
          extractedText = source.extracted_text || "";
        }

        // Mark as completed immediately after text extraction
        await serviceClient
          .from("sources")
          .update({
            extracted_text: extractedText || source.extracted_text,
            processing_status: "completed",
          })
          .eq("id", body.sourceId);

        // Generate summary asynchronously
        const sourceId = body.sourceId;
        if (extractedText) {
          after(async () => {
            try {
              const summary = await generateSummary(extractedText);
              const adminClient = await createServiceRoleClient();
              await adminClient
                .from("sources")
                .update({ summary })
                .eq("id", sourceId);
            } catch {
              // Summary generation is optional
            }
          });
        }

        return NextResponse.json({ status: "completed" });
      } catch (error) {
        await serviceClient
          .from("sources")
          .update({
            processing_status: "failed",
          })
          .eq("id", body.sourceId);

        return NextResponse.json(
          { error: "처리 실패" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
