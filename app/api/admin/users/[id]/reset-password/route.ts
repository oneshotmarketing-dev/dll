import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";
import { tempPassword } from "@/lib/tempPassword";

// Admin-only: regenerate a readable temp password (same code path as create),
// force a first-login change, and return the new password once for WhatsApp DM.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const password = tempPassword();
  const { error } = await svc.auth.admin.updateUserById(params.id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await svc.from("profiles").update({ must_change_password: true }).eq("id", params.id);

  return NextResponse.json({ ok: true, tempPassword: password });
}
