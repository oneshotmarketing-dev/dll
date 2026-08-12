import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Returns a short-lived signed URL for a recording the student is allowed to
// watch. Access is enforced by RLS (the authed query only returns a row the
// student can see); the signed URL itself is minted with the service role since
// the 'recordings' bucket is private with no public policies.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: rec } = await supabase
    .from("recordings")
    .select("storage_path,status")
    .eq("id", params.id)
    .single();

  if (!rec || rec.status !== "ready" || !rec.storage_path) {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const { data, error } = await svc.storage.from("recordings").createSignedUrl(rec.storage_path, 60 * 60 * 2);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
