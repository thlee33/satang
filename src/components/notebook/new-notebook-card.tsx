"use client";

import { Plus } from "lucide-react";

interface NewNotebookCardProps {
  onClick: () => void;
}

export function NewNotebookCard({ onClick }: NewNotebookCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center h-[160px] p-5 rounded-[24px] border-2 border-dashed border-border-hover/60 bg-white hover:bg-brand-faint hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Decorative hover glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100 pointer-events-none" />

      <div className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-border-default group-hover:scale-110 group-hover:shadow-md transition-all duration-500 mb-3 group-hover:border-brand/30">
        <Plus className="w-6 h-6 text-text-tertiary group-hover:text-brand transition-colors duration-300" />
      </div>

      <span className="relative text-[16px] font-bold text-text-secondary group-hover:text-brand transition-colors duration-300">
        새노트 만들기
      </span>
      <span className="relative text-[12px] font-medium text-text-muted mt-1.5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
        새로운 지식을 탐구하세요
      </span>
    </button>
  );
}
