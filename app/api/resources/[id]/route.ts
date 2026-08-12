import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Signed URL for a course material the student may access (RLS-enforced). PDFs
// and audio download (?download=1); videos stream inline for the watch-only
// modal. The 'resources' bucket is private, so URLs are minted server-side.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: res } = await supabase
    .from("resources")
    .select("storage_path,url,type")
    .eq("id", params.id)
    .single();

  if (!res) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (res.type === "link" && res.url) return NextResponse.json({ url: res.url });
  if (!res.storage_path) return NextResponse.json({ error: "not_available" }, { status: 404 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const download = new URL(req.url).searchParams.get("download") === "1";
  const { data, error } = await svc.storage
    .from("resources")
    .createSignedUrl(res.storage_path, 60 * 60 * 2, download ? { download: true } : undefined);

  if (error || !data?.signedUrl) return NextResponse.json({ error: "not_available" }, { status: 404 });
  return NextResponse.json({ url: data.signedUrl });
}
