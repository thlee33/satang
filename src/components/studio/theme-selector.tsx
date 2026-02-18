"use client";

import { useDesignThemes } from "@/hooks/use-design-themes";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, Settings } from "lucide-react";
import Link from "next/link";

interface ThemeSelectorProps {
  selectedThemeId: string | null;
  onSelect: (themeId: string | null) => void;
}

export function ThemeSelector({
  selectedThemeId,
  onSelect,
}: ThemeSelectorProps) {
  const { data: themes, isLoading } = useDesignThemes();

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
      </div>

      {/* Link to settings if no themes */}
      {!isLoading && (!themes || themes.length === 0) && (
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 mt-2 text-xs text-brand hover:underline"
        >
          <Settings className="w-3 h-3" />
          설정에서 테마 만들기
        </Link>
      )}
    </div>
  );
}
