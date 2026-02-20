"use client";

import { useState } from "react";
import { useDesignThemes } from "@/hooks/use-design-themes";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, Plus } from "lucide-react";
import { ThemeEditorDialog } from "@/components/settings/theme-editor-dialog";

interface ThemeSelectorProps {
  selectedThemeId: string | null;
  onSelect: (themeId: string | null) => void;
}

export function ThemeSelector({
  selectedThemeId,
  onSelect,
}: ThemeSelectorProps) {
  const { data: themes, isLoading } = useDesignThemes();
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="overflow-hidden">
      <label className="text-[13px] font-medium text-text-secondary block mb-2">
        디자인 테마
      </label>
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
        {/* Auto option */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex-shrink-0 w-[100px] h-[68px] rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
            selectedThemeId === null
              ? "border-brand bg-brand-faint"
              : "border-border-default hover:bg-gray-50"
          )}
        >
          <Sparkles
            className={cn(
              "w-4 h-4",
              selectedThemeId === null ? "text-brand" : "text-text-tertiary"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              selectedThemeId === null ? "text-brand" : "text-text-secondary"
            )}
          >
            자동
          </span>
        </button>

        {/* Theme cards */}
        {isLoading ? (
          <div className="flex-shrink-0 w-[100px] h-[68px] rounded-lg border border-border-default bg-gray-50 animate-pulse" />
        ) : (
          themes?.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={cn(
                "flex-shrink-0 w-[100px] h-[68px] rounded-lg border-2 transition-all cursor-pointer overflow-hidden relative",
                selectedThemeId === theme.id
                  ? "border-brand"
                  : "border-border-default hover:border-gray-300"
              )}
            >
              {theme.thumbnail_url ? (
                <>
                  <img
                    src={theme.thumbnail_url}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-0.5">
                    <span className="text-[10px] text-white font-medium truncate block">
                      {theme.name}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-2 gap-1 bg-gray-50">
                  <Palette
                    className={cn(
                      "w-4 h-4",
                      selectedThemeId === theme.id
                        ? "text-brand"
                        : "text-text-tertiary"
                    )}
                  />
                  <span className="text-[10px] font-medium text-text-primary truncate w-full text-center">
                    {theme.name}
                  </span>
                </div>
              )}
            </button>
          ))
        )}

        {/* Add theme button */}
        {!isLoading && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex-shrink-0 w-[100px] h-[68px] rounded-lg border-2 border-dashed border-border-default hover:border-brand hover:bg-brand-faint transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4 text-text-tertiary" />
            <span className="text-[10px] font-medium text-text-tertiary">
              테마 추가
            </span>
          </button>
        )}
      </div>

      <ThemeEditorDialog
        open={showEditor}
        onClose={() => setShowEditor(false)}
      />
    </div>
  );
}
