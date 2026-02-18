"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  useCreateDesignTheme,
  useUpdateDesignTheme,
} from "@/hooks/use-design-themes";
import type { DesignThemeRow } from "@/lib/supabase/types";
import { toast } from "sonner";

interface ThemeEditorDialogProps {
  open: boolean;
  onClose: () => void;
  theme?: DesignThemeRow | null;
}

export function ThemeEditorDialog({
  open,
  onClose,
  theme,
}: ThemeEditorDialogProps) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");

  const createTheme = useCreateDesignTheme();
  const updateTheme = useUpdateDesignTheme();

  const isEditing = !!theme;
  const isPending = createTheme.isPending || updateTheme.isPending;

  useEffect(() => {
    if (theme) {
      setName(theme.name);
      setPrompt(theme.prompt);
    } else {
      setName("");
      setPrompt("");
    }
  }, [theme, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("테마 이름을 입력해주세요.");
      return;
    }
    if (!prompt.trim()) {
      toast.error("디자인 프롬프트를 입력해주세요.");
      return;
    }

    try {
      if (isEditing) {
        await updateTheme.mutateAsync({
          id: theme.id,
          name: name.trim(),
          prompt: prompt.trim(),
        });
        toast.success("테마가 수정되었습니다.");
      } else {
        await createTheme.mutateAsync({
          name: name.trim(),
          prompt: prompt.trim(),
        });
        toast.success("테마가 생성되었습니다.");
      }
      onClose();
    } catch {
      toast.error(isEditing ? "테마 수정 실패" : "테마 생성 실패");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "테마 수정" : "새 디자인 테마"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Theme Name */}
          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              테마 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 비즈니스 블루"
              className="w-full h-9 rounded-lg border border-border-default px-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
            />
          </div>

          {/* Design Prompt */}
          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              디자인 프롬프트
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`색상, 분위기, 스타일 등 원하는 디자인을 자유롭게 설명하세요.\n\n예시:\n파란색(#4F46E5) 계열의 전문적이고 모던한 느낌\n미니멀한 레이아웃에 굵은 타이포그래피\n깔끔한 아이콘과 충분한 여백 사용`}
              className="min-h-[140px] max-h-[40vh] resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-brand hover:bg-brand-hover"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : isEditing ? (
                "수정"
              ) : (
                "생성"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
