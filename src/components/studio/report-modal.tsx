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
import { Loader2, FileText } from "lucide-react";
import { useGenerateReport } from "@/hooks/use-studio";
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

const DETAIL_LEVELS = [
  { value: "concise", label: "간결하게" },
  { value: "standard", label: "표준" },
  { value: "detailed", label: "상세" },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
}

export function ReportModal({ open, onClose, notebookId }: ReportModalProps) {
  const [language, setLanguage] = useState("ko");
  const [detailLevel, setDetailLevel] = useState("standard");
  const [prompt, setPrompt] = useState("");

  const generate = useGenerateReport();

  const handleGenerate = async () => {
    try {
      await generate.mutateAsync({ notebookId, language, detailLevel, prompt });
      toast.success("보고서 생성이 시작되었습니다.");
      onClose();
      setPrompt("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "보고서 생성 실패");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="w-5 h-5" />
            보고서 맞춤설정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              언어 선택
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-9 rounded-lg border border-border-default px-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              세부정보 수준
            </label>
            <div className="flex gap-2">
              {DETAIL_LEVELS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDetailLevel(d.value)}
                  className={cn(
                    "flex-1 h-9 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                    detailLevel === d.value
                      ? "bg-gray-100 border-text-primary text-text-primary"
                      : "border-border-default text-text-tertiary hover:bg-gray-50"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              추가 지시사항
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="보고서의 초점이나 형식에 대한 안내를 입력하세요..."
              className="min-h-[80px] max-h-[30vh] resize-y"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="bg-brand hover:bg-brand-hover px-6"
            >
              {generate.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />생성 중...</>
              ) : "생성"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
