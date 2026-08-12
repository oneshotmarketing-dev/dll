import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

const BATCH_STATUSES = ["open", "running", "closed", "full", "completed"];

// Admin-only: update a batch's status. Marking a batch 'completed' flips all its
// still-active enrollments to 'completed' in the same call — the one-batch-per-
// student rule depends on this (completed enrollments free the student to enrol
// elsewhere). Reopening (completed → running/open) reactivates them.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!BATCH_STATUSES.includes(status)) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const { error: bErr } = await svc.from("batches").update({ status }).eq("id", params.id);
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 400 });

  if (status === "completed") {
    await svc.from("enrollments").update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("batch_id", params.id).eq("status", "active");
  } else if (status === "open" || status === "running") {
    // Reopen: bring completed enrollments of this batch back to active.
    await svc.from("enrollments").update({ status: "active", completed_at: null })
      .eq("batch_id", params.id).eq("status", "completed");
  }

  return NextResponse.json({ ok: true });
}
