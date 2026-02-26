"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DesignThemeRow } from "@/lib/supabase/types";

export function useDesignThemes() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["design-themes"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("design_themes")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DesignThemeRow[];
    },
  });
}

export function useCreateDesignTheme() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      prompt: string;
      thumbnail_url?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("design_themes")
        .insert({ ...params, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as DesignThemeRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-themes"] });
    },
  });
}

export function useUpdateDesignTheme() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name?: string;
      prompt?: string;
      thumbnail_url?: string | null;
    }) => {
      const { id, ...updates } = params;
      const { data, error } = await supabase
        .from("design_themes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DesignThemeRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-themes"] });
    },
  });
}

export function useDeleteDesignTheme() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("design_themes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-themes"] });
    },
  });
}

export function useGenerateThemePreview() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/studio/theme-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "미리보기 생성 실패");
      }

      const data = await response.json();
      return data.thumbnailUrl as string;
    },
  });
}

export function useAnalyzeThemeImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/studio/theme-analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "이미지 분석 실패");
      }

      const data = await response.json();
      return data.prompt as string;
    },
  });
}
