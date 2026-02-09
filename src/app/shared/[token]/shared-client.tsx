"use client";

import { useState } from "react";
import {
  BookOpen, FileText, Globe, FileImage, Headphones,
  Brain, BarChart3, Presentation, CreditCard, HelpCircle,
} from "lucide-react";
import { ContentViewer } from "@/components/studio/content-viewer";
import type { Notebook, Source, StudioOutput } from "@/lib/supabase/types";

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  text: <FileText className="w-4 h-4 text-blue-500" />,
  url: <Globe className="w-4 h-4 text-green-500" />,
  image: <FileImage className="w-4 h-4 text-purple-500" />,
  audio: <Headphones className="w-4 h-4 text-amber-500" />,
};

const OUTPUT_ICONS: Record<string, React.ReactNode> = {
  infographic: <BarChart3 className="w-4 h-4 text-amber-600" />,
  slide_deck: <Presentation className="w-4 h-4 text-amber-600" />,
  mind_map: <Brain className="w-4 h-4 text-rose-600" />,
  report: <FileText className="w-4 h-4 text-rose-600" />,
  flashcard: <CreditCard className="w-4 h-4 text-emerald-600" />,
  quiz: <HelpCircle className="w-4 h-4 text-emerald-600" />,
};

interface SharedNotebookClientProps {
  notebook: Notebook;
  sources: Pick<Source, "id" | "title" | "type" | "processing_status" | "summary">[];
  outputs: StudioOutput[];
}

export function SharedNotebookClient({
  notebook,
  sources,
  outputs,
}: SharedNotebookClientProps) {
  const [viewingOutput, setViewingOutput] = useState<StudioOutput | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b border-border-default bg-white flex items-center px-4 gap-3">
        <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-text-primary">Satang</span>
        <span className="text-text-muted mx-2">|</span>
        <span className="text-lg">{notebook.emoji}</span>
        <span className="text-sm font-medium text-text-primary truncate">
          {notebook.title}
        </span>
        <span className="ml-auto text-xs text-text-muted bg-gray-100 px-2 py-1 rounded">
          읽기 전용
        </span>
      </header>

      <main className="max-w-[960px] mx-auto px-6 py-8">
        {/* Sources */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            소스 ({sources.length}개)
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm text-text-muted">소스가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-start gap-3 p-3 border border-border-default rounded-lg"
                >
                  {SOURCE_ICONS[source.type] || (
                    <FileText className="w-4 h-4 text-text-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {source.title}
                    </p>
                    {source.summary && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {source.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Studio Outputs */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            생성된 콘텐츠 ({outputs.length}개)
          </h2>
          {outputs.length === 0 ? (
            <p className="text-sm text-text-muted">생성된 콘텐츠가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {outputs.map((output) => (
                <button
                  key={output.id}
                  onClick={() => setViewingOutput(output)}
                  className="text-left p-4 border border-border-default rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {OUTPUT_ICONS[output.type] || (
                      <FileText className="w-4 h-4 text-text-muted" />
                    )}
                    <span className="text-xs text-text-muted uppercase">
                      {output.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">
                    {output.title}
                  </p>
                  {output.image_urls?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={output.image_urls[0]}
                      alt={output.title}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {viewingOutput && (
        <ContentViewer
          output={viewingOutput}
          onClose={() => setViewingOutput(null)}
        />
      )}
    </div>
  );
}
