"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download, ChevronLeft, ChevronRight, RotateCcw, Check, X, FileDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { StudioOutput } from "@/lib/supabase/types";

const TEXT_BASED_TYPES = ["mind_map", "report", "flashcard", "quiz"];

interface ContentViewerProps {
  output: StudioOutput;
  onClose: () => void;
}

// Mind map branch type
interface MindMapBranch {
  topic: string;
  children?: MindMapBranch[];
}

const DEPTH_COLORS = [
  "bg-brand",
  "bg-blue-500",
  "bg-violet-400",
  "bg-gray-400",
];

function MindMapTree({ branches, depth = 0 }: { branches: MindMapBranch[]; depth?: number }) {
  return (
    <ul className={`${depth === 0 ? "" : "ml-6 border-l-2 border-gray-100 pl-4"} space-y-2`}>
      {branches.map((branch, i) => (
        <li key={i}>
          <div className="flex items-start gap-2.5">
            <span className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]}`} />
            <span className={`text-[14px] leading-relaxed ${depth === 0 ? "font-semibold text-text-primary" : depth === 1 ? "font-medium text-text-primary" : "text-text-secondary"}`}>
              {branch.topic}
            </span>
          </div>
          {branch.children && branch.children.length > 0 && (
            <MindMapTree branches={branch.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

function MindMapContent({ output }: { output: StudioOutput }) {
  const content = output.content as { mindmap?: { central?: string; branches?: MindMapBranch[]; rawText?: string } };
  const mindmap = content?.mindmap;

  if (!mindmap) return <p className="text-sm text-text-muted">콘텐츠가 없습니다.</p>;

  if (mindmap.rawText && (!mindmap.branches || mindmap.branches.length === 0)) {
    return (
      <div className="prose prose-sm max-w-none p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{mindmap.rawText}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <span className="inline-block px-6 py-2.5 bg-brand text-white rounded-full text-[15px] font-bold shadow-sm">
          {mindmap.central || "마인드맵"}
        </span>
      </div>
      {mindmap.branches && <MindMapTree branches={mindmap.branches} />}
    </div>
  );
}

function ReportContent({ output }: { output: StudioOutput }) {
  const content = output.content as { markdown?: string };
  const markdown = content?.markdown;

  if (!markdown) return <p className="text-sm text-text-muted">콘텐츠가 없습니다.</p>;

  return (
    <div className="py-6 px-4 w-full max-w-3xl mx-auto">
      <div id="report-content" className="bg-white rounded-xl shadow-sm border border-gray-100 px-8 py-6">
        <div className="prose prose-neutral prose-sm max-w-none prose-headings:text-text-primary prose-headings:font-bold prose-h1:text-xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-4 prose-h2:text-lg prose-h2:mt-6 prose-h3:text-base prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-text-primary prose-table:text-sm prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-gray-200 prose-code:text-brand prose-code:bg-brand-faint prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-li:my-0.5 prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand/30 prose-blockquote:bg-brand-faint/50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function FlashcardContent({ output }: { output: StudioOutput }) {
  const content = output.content as { cards?: { question: string; answer: string }[] };
  const cards = content?.cards || [];
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setCurrentCard(0);
    setFlipped(false);
  }, [output.id]);

  if (cards.length === 0) return <p className="text-sm text-text-muted">콘텐츠가 없습니다.</p>;

  const card = cards[currentCard];

  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center flex-1">
      {/* Card counter dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentCard(i); setFlipped(false); }}
            className={`rounded-full transition-all cursor-pointer ${
              i === currentCard ? "w-6 h-2 bg-brand" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <button
        onClick={() => setFlipped(!flipped)}
        className={`w-full max-w-lg min-h-[240px] rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm ${
          flipped
            ? "bg-brand/5 border-2 border-brand/20"
            : "bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        <span className={`text-[11px] font-semibold uppercase tracking-wider mb-4 ${
          flipped ? "text-brand" : "text-text-muted"
        }`}>
          {flipped ? "Answer" : "Question"}
        </span>
        <p className={`text-center leading-relaxed ${
          flipped
            ? "text-brand text-[15px] font-medium"
            : "text-text-primary text-base font-semibold"
        }`}>
          {flipped ? card.answer : card.question}
        </p>
        <span className="text-[11px] text-text-muted mt-6">
          클릭하여 {flipped ? "질문" : "답변"} 보기
        </span>
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={() => { setCurrentCard((c) => Math.max(0, c - 1)); setFlipped(false); }}
          disabled={currentCard === 0}
          className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-text-secondary px-3">
          {currentCard + 1} / {cards.length}
        </span>
        <button
          onClick={() => { setCurrentCard((c) => Math.min(cards.length - 1, c + 1)); setFlipped(false); }}
          disabled={currentCard === cards.length - 1}
          className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function QuizContent({ output }: { output: StudioOutput }) {
  const content = output.content as { questions?: QuizQuestion[] };
  const questions = content?.questions || [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setAnswers({});
    setShowResults(false);
  }, [output.id]);

  if (questions.length === 0) return <p className="text-sm text-text-muted">콘텐츠가 없습니다.</p>;

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, ai]) => questions[Number(qi)]?.correctIndex === ai
  ).length;

  return (
    <div className="py-6 px-4 max-w-2xl mx-auto w-full">
      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-text-muted whitespace-nowrap">
          {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const userAnswer = answers[qi];
          const answered = userAnswer !== undefined;
          const isCorrect = answered && userAnswer === q.correctIndex;

          return (
            <div
              key={qi}
              className={`bg-white rounded-xl shadow-sm border transition-all ${
                showResults && answered
                  ? isCorrect ? "border-green-200" : "border-red-200"
                  : answered ? "border-brand/30" : "border-gray-100"
              }`}
            >
              {/* Question header */}
              <div className="px-5 pt-4 pb-3 flex items-start gap-3">
                <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  showResults && answered
                    ? isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    : "bg-brand/10 text-brand"
                }`}>
                  {qi + 1}
                </span>
                <p className="text-[14px] font-semibold text-text-primary leading-relaxed pt-0.5">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="px-5 pb-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = userAnswer === oi;
                  const isCorrectOption = q.correctIndex === oi;

                  let containerStyle = "border-gray-100 hover:border-gray-300 hover:bg-gray-50 cursor-pointer";
                  let indicatorStyle = "border-gray-300 text-gray-400 bg-white";

                  if (showResults && answered) {
                    if (isCorrectOption) {
                      containerStyle = "border-green-200 bg-green-50";
                      indicatorStyle = "border-green-500 bg-green-500 text-white";
                    } else if (isSelected && !isCorrectOption) {
                      containerStyle = "border-red-200 bg-red-50";
                      indicatorStyle = "border-red-500 bg-red-500 text-white";
                    } else {
                      containerStyle = "border-gray-100 opacity-60";
                    }
                  } else if (isSelected) {
                    containerStyle = "border-brand bg-brand/5";
                    indicatorStyle = "border-brand bg-brand text-white";
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (!showResults) setAnswers((prev) => ({ ...prev, [qi]: oi }));
                      }}
                      disabled={showResults}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-[13px] transition-all flex items-center gap-3 ${containerStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0 transition-all ${indicatorStyle}`}>
                        {showResults && isCorrectOption ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : showResults && isSelected && !isCorrectOption ? (
                          <X className="w-3.5 h-3.5" />
                        ) : (
                          String.fromCharCode(65 + oi)
                        )}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResults && answered && q.explanation && (
                <div className="mx-5 mb-4 px-3.5 py-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-xs font-medium text-text-muted mb-1">해설</p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer action */}
      <div className="mt-8 flex justify-center">
        {!showResults ? (
          <Button
            onClick={() => setShowResults(true)}
            disabled={answeredCount < questions.length}
            className="bg-brand hover:bg-brand-hover px-10 h-11 text-sm font-medium rounded-xl shadow-sm"
          >
            {answeredCount < questions.length
              ? `${answeredCount}/${questions.length} 답변 완료`
              : "결과 확인"}
          </Button>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-8 py-6 text-center w-full max-w-xs">
            <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold ${
              correctCount / questions.length >= 0.7
                ? "bg-green-100 text-green-700"
                : correctCount / questions.length >= 0.4
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}>
              {Math.round((correctCount / questions.length) * 100)}
            </div>
            <p className="text-lg font-bold text-text-primary">
              {correctCount}/{questions.length} 정답
            </p>
            <p className="text-sm text-text-muted mt-0.5">
              정답률 {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <Button
              variant="outline"
              onClick={() => { setAnswers({}); setShowResults(false); }}
              className="mt-4 rounded-lg"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              다시 풀기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentViewer({ output, onClose }: ContentViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = output.image_urls || [];

  const isSlides = output.type === "slide_deck" && images.length > 1;
  const isGenerating = output.generation_status === "generating";
  const isTextBased = TEXT_BASED_TYPES.includes(output.type);
  const isReport = output.type === "report";

  const progress = (output.content as Record<string, unknown>)?.progress as
    { completed?: number; total?: number; phase?: string; failed?: number } | undefined;

  const handleDownload = async () => {
    if (images.length === 0) return;
    const url = images[isSlides ? currentSlide : 0];
    const link = document.createElement("a");
    link.href = url;
    link.download = `${output.title}-${currentSlide + 1}.png`;
    link.click();
  };

  const handleExportPdf = useCallback(() => {
    const element = document.getElementById("report-content");
    if (!element) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = element.innerHTML;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${output.title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; line-height: 1.7; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; margin: 32px 0 16px; }
  h2 { font-size: 18px; font-weight: 700; margin: 28px 0 12px; }
  h3 { font-size: 15px; font-weight: 600; margin: 24px 0 8px; }
  p { margin: 8px 0; color: #333; }
  strong { color: #1a1a1a; }
  ul, ol { margin: 8px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th { background: #f5f5f5; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #ddd; }
  td { padding: 8px 12px; border: 1px solid #ddd; }
  code { background: #f5f3ff; color: #6D28D9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #6D28D9; background: #faf5ff; margin: 16px 0; padding: 12px 16px; border-radius: 0 8px 8px 0; }
  @media print { body { padding: 0; } }
</style></head><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }, [output.title]);

  // Clamp currentSlide to valid range for available images
  const safeSlide = Math.min(currentSlide, Math.max(0, images.length - 1));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[min(1200px,calc(100vw-4rem))] max-h-[calc(100vh-4rem)] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-2.5 border-b border-border-default space-y-0">
          <DialogTitle className="text-sm font-semibold text-text-primary truncate">
            {output.title}
          </DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            {!isTextBased && images.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                다운로드
              </Button>
            )}
            {isReport && output.generation_status === "completed" && (
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                <FileDown className="w-4 h-4 mr-1" />
                PDF 다운로드
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className={`relative flex flex-col ${isTextBased ? "min-h-[300px] max-h-[75vh] overflow-y-auto bg-gray-50/50" : "items-center justify-center min-h-[400px] bg-gray-50"} p-4`}>
          {isTextBased ? (
            output.generation_status === "failed" ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm text-error mb-2">생성에 실패했습니다.</p>
                  <p className="text-xs text-text-muted">{output.error_message}</p>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-text-secondary">생성 중...</p>
              </div>
            ) : output.type === "mind_map" ? (
              <MindMapContent output={output} />
            ) : output.type === "report" ? (
              <ReportContent output={output} />
            ) : output.type === "flashcard" ? (
              <FlashcardContent output={output} />
            ) : output.type === "quiz" ? (
              <QuizContent output={output} />
            ) : (
              <p className="text-sm text-text-muted">콘텐츠가 없습니다.</p>
            )
          ) : isGenerating ? (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Progress section */}
              <div className="text-center w-full max-w-xs mx-auto">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-text-primary mb-1">
                  {progress?.phase || "준비 중"}...
                </p>
                {progress && progress.total ? (
                  <>
                    <p className="text-sm text-text-secondary mb-3">
                      {progress.completed || 0}/{progress.total} 슬라이드 생성 완료
                    </p>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(((progress.completed || 0) / progress.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {Math.round(((progress.completed || 0) / progress.total) * 100)}%
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">생성 중...</p>
                )}
              </div>

              {/* Show completed slides preview during generation */}
              {images.length > 0 && (
                <div className="relative w-full mt-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[safeSlide]}
                    alt={`슬라이드 ${safeSlide + 1}`}
                    className="max-w-full max-h-[40vh] object-contain rounded-lg"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                        disabled={safeSlide === 0}
                        className="absolute left-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide((prev) => Math.min(images.length - 1, prev + 1))}
                        disabled={safeSlide === images.length - 1}
                        className="absolute right-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : output.generation_status === "failed" ? (
            <div className="text-center">
              <p className="text-sm text-error mb-2">생성에 실패했습니다.</p>
              <p className="text-xs text-text-muted">{output.error_message}</p>
            </div>
          ) : images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[isSlides ? currentSlide : 0]}
                alt={output.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />

              {/* Slide Navigation */}
              {isSlides && (
                <>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSlide === 0}
                    className="absolute left-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) =>
                        Math.min(images.length - 1, prev + 1)
                      )
                    }
                    disabled={currentSlide === images.length - 1}
                    className="absolute right-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-text-muted">
              콘텐츠가 없습니다.
            </p>
          )}
        </div>

        {/* Slide Indicators */}
        {((isSlides && !isGenerating) || (isGenerating && images.length > 1)) && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border-default">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  i === (isGenerating ? safeSlide : currentSlide) ? "bg-brand" : "bg-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-text-muted ml-2">
              {(isGenerating ? safeSlide : currentSlide) + 1} / {images.length}
              {isGenerating && progress?.total ? ` (총 ${progress.total}장)` : ""}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
