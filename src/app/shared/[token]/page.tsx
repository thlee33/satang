import { createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SharedNotebookClient } from "./shared-client";

export default async function SharedNotebookPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServiceRoleClient();

  const { data: notebook } = await supabase
    .from("notebooks")
    .select("*")
    .eq("share_token", token)
    .eq("is_shared", true)
    .single();

  if (!notebook) redirect("/");

  const { data: sources } = await supabase
    .from("sources")
    .select("id, title, type, processing_status, summary")
    .eq("notebook_id", notebook.id)
    .eq("processing_status", "completed")
    .order("sort_order", { ascending: true });

  const { data: outputs } = await supabase
    .from("studio_outputs")
    .select("*")
    .eq("notebook_id", notebook.id)
    .eq("generation_status", "completed")
    .order("created_at", { ascending: false });

  return (
    <SharedNotebookClient
      notebook={notebook}
      sources={sources || []}
      outputs={outputs || []}
    />
  );
}
