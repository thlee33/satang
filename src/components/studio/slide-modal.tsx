"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Presentation, Check, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useGenerateSlides } from "@/hooks/use-studio";
import { ThemeSelector } from "@/components/studio/theme-selector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const FORMATS = [
  {
    value: "detailed",
    label: "자세한 자료",
    description:
      "전체 텍스트의 세부정보가 가득한 포괄적인 자료로, 이메일로 보내거나 단독으로 읽기에 적합합니다.",
  },
  {
    value: "presenter",
    label: "발표자 슬라이드",
    description:
      "발표하는 동안 도움이 될 핵심 내용을 담은 간결하고 시각적인 슬라이드입니다.",
  },
];

const PAGE_NUMBER_POSITIONS = [
  { value: "top-right", label: "우측 상단" },
  { value: "bottom-center", label: "중앙 하단" },
  { value: "bottom-right", label: "우측 하단" },
] as const;

interface SlideModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
}

export function SlideModal({ open, onClose, notebookId }: SlideModalProps) {
  const [format, setFormat] = useState("detailed");
  const [language, setLanguage] = useState("ko");
  const [slideCount, setSlideCount] = useState(12);
  const [designThemeId, setDesignThemeId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [includeCover, setIncludeCover] = useState(true);
  const [includeBridge, setIncludeBridge] = useState(true);
  const [includePageNumber, setIncludePageNumber] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState<string>("bottom-right");

  const generate = useGenerateSlides();

  const handleGenerate = async () => {
    try {
      await generate.mutateAsync({
        notebookId,
        format,
        language,
        prompt,
        slideCount,
        designThemeId: designThemeId || undefined,
        includeCover,
        includeBridge: slideCount >= 10 ? includeBridge : false,
        includePageNumber,
        pageNumberPosition: includePageNumber ? pageNumberPosition : undefined,
      });
      toast.success("슬라이드 생성이 시작되었습니다.");
      onClose();
      setPrompt("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "슬라이드 생성 실패"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-5 border-b border-border-default bg-gray-50/50 block">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
            <Presentation className="w-5 h-5 text-brand" />
            새 슬라이드 만들기
          </DialogTitle>
          <p className="text-[13px] text-text-tertiary mt-1.5 ml-[28px]">
            원하는 주제와 스타일을 입력하면 AI가 슬라이드를 자동 생성합니다.
          </p>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto">
          {/* Left Column: Core Input */}
          <div className="flex-1 p-6 space-y-5 flex flex-col min-w-0">
            {/* Prompt */}
            <div className="flex flex-col shrink-0">
              <label className="text-[14px] font-semibold text-text-primary block mb-2.5">
                어떤 내용의 슬라이드를 만들까요?
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='간략한 개요를 추가하거나 청중, 스타일, 강조할 점에 대한 가이드를 제공해주세요.&#13;&#10;예: "스타트업 창업자를 위한 10장짜리 피치덱 만들어줘. 대담하고 전문적인 느낌으로."'
                className="h-[120px] resize-none text-[14px] leading-relaxed p-4 bg-white border border-border-default hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all rounded-xl shadow-sm text-text-primary"
              />
            </div>

            {/* Design Theme */}
            <div className="flex-1 flex flex-col min-h-0 pt-2">
              <ThemeSelector
                selectedThemeId={designThemeId}
                onSelect={setDesignThemeId}
              />
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="w-full md:w-[340px] shrink-0 p-6 bg-gray-50/40 border-l border-border-default flex flex-col gap-6 overflow-y-auto">

            {/* Format */}
            <div>
              <label className="text-[13px] font-bold text-text-secondary block mb-3">
                문서 형식
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all cursor-pointer",
                      format === f.value
                        ? "border-brand bg-brand-faint shadow-sm shadow-brand/10"
                        : "border-border-default bg-white hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[13px] font-bold",
                        format === f.value ? "text-brand" : "text-text-primary"
                      )}>
                        {f.label}
                      </span>
                      {format === f.value && (
                        <Check className="w-[14px] h-[14px] text-brand ml-auto" />
                      )}
                    </div>
                    <p className="text-[12px] text-text-tertiary leading-snug">
                      {f.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count & Language Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">

              {/* Language */}
              <div className="col-span-2">
                <label className="text-[13px] font-bold text-text-secondary block mb-2">
                  언어 선택
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 appearance-none rounded-xl border border-border-default pl-3 pr-10 text-[13px] font-medium bg-white text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all cursor-pointer shadow-sm shadow-black/5 hover:border-brand/40"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                </div>
              </div>

              {/* Slide Count */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[13px] font-bold text-text-secondary">
                    슬라이드 분량
                  </label>
                  <span className="text-[13px] font-bold text-brand bg-brand-faint px-2 py-0.5 rounded-md">{slideCount}장</span>
                </div>
                <div className="px-2">
                  <Slider
                    value={[slideCount]}
                    onValueChange={([v]) => setSlideCount(v)}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 px-0.5">
                    <span className="text-[11px] font-medium text-text-muted">1</span>
                    <span className="text-[11px] font-medium text-text-muted">50</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Generation Options */}
            <div>
              <label className="text-[13px] font-bold text-text-secondary block mb-3">
                슬라이드 구성
              </label>
              <div className="space-y-4 bg-white p-4 rounded-xl border border-border-default shadow-sm shadow-black/5">

                {/* Cover */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">표지 슬라이드</span>
                  <button
                    type="button"
                    onClick={() => setIncludeCover(!includeCover)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                      includeCover ? "bg-brand" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        includeCover ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </label>

                {/* Bridge */}
                <label className={cn("flex items-center justify-between", slideCount >= 10 ? "cursor-pointer group" : "opacity-40 cursor-not-allowed")}>
                  <div className="flex flex-col">
                    <span className={cn("text-[13px] font-medium", slideCount >= 10 ? "text-text-secondary group-hover:text-text-primary transition-colors" : "text-text-tertiary")}>
                      중간 브릿지
                    </span>
                    {slideCount < 10 && (
                      <span className="text-[11px] text-brand font-medium mt-0.5">10장 이상 권장</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={slideCount < 10}
                    onClick={() => setIncludeBridge(!includeBridge)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                      includeBridge && slideCount >= 10 ? "bg-brand" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        includeBridge && slideCount >= 10 ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </label>

                {/* Page Number */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">페이지 번호</span>
                    <button
                      type="button"
                      onClick={() => setIncludePageNumber(!includePageNumber)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                        includePageNumber ? "bg-brand" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          includePageNumber ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </label>

                  {/* Page Number Position */}
                  {includePageNumber && (
                    <div className="flex gap-1.5 pt-2 border-t border-border-default/50">
                      {PAGE_NUMBER_POSITIONS.map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => setPageNumberPosition(pos.value)}
                          className={cn(
                            "flex-1 relative h-8 rounded-lg border text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center",
                            pageNumberPosition === pos.value
                              ? "border-brand bg-brand-faint text-brand ring-1 ring-brand/30"
                              : "border-border-default bg-gray-50 text-text-tertiary hover:bg-gray-100 hover:text-text-secondary"
                          )}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Submit Footer */}
        <div className="px-6 py-4 border-t border-border-default bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="text-[13px] text-text-tertiary hidden md:block">
            <span className="font-semibold text-text-secondary">💡 TIP:</span> 구체적인 내용과 목적을 적을수록 더 정확한 슬라이드가 만들어집니다.
          </div>
          <div className="flex justify-end gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary hover:bg-gray-200/50"
            >
              취소
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generate.isPending || !prompt.trim()}
              className="bg-brand hover:bg-brand-hover text-white px-7 shadow-md shadow-brand/20 transition-all font-semibold"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  생성 중...
                </>
              ) : (
                "슬라이드 생성하기"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
