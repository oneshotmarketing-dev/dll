import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Uploads the student's profile photo to the private 'avatars' bucket and
// records the path on their profile. Service role handles the write (bucket has
// no public policies); the caller must be the authenticated user.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await svc.storage.from("avatars").upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await svc.from("profiles").update({ avatar_url: path }).eq("id", user.id);
  return NextResponse.json({ ok: true });
}
