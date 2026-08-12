import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getMeetingRecordings, downloadRecordingStream, deleteMeetingRecordings } from "@/lib/zoom";

export const runtime = "nodejs";
export const maxDuration = 300;

// How many recordings to move per invocation (bounds function time — each can be
// ~1GB). At 1 teacher this is never contended; the cron runs every couple mins.
const BATCH = 2;
// A claim older than this is considered crashed and is retried.
const STALE_MS = 15 * 60 * 1000;

// Vercel Cron worker: pull Zoom cloud recordings into the private Supabase
// 'recordings' bucket, then trash them on Zoom to free the 5GB quota. Claims rows
// via recordings.transfer_started_at so overlapping runs don't double-process and
// crashed transfers auto-retry. Protected by CRON_SECRET (Vercel sends it as the
// Authorization bearer).
export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const staleIso = new Date(Date.now() - STALE_MS).toISOString();
  const { data: candidates } = await svc
    .from("recordings")
    .select("id,session_id,zoom_recording_id")
    .eq("status", "processing")
    .not("zoom_recording_id", "is", null)
    .or(`transfer_started_at.is.null,transfer_started_at.lt.${staleIso}`)
    .limit(BATCH);

  const results: { id: string; outcome: string }[] = [];
  for (const row of candidates ?? []) {
    // Atomically claim so a concurrent run can't grab the same row.
    const { data: claimed } = await svc
      .from("recordings")
      .update({ transfer_started_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "processing")
      .or(`transfer_started_at.is.null,transfer_started_at.lt.${staleIso}`)
      .select("id")
      .maybeSingle();
    if (!claimed) {
      results.push({ id: row.id, outcome: "skipped_race" });
      continue;
    }

    try {
      const outcome = await transfer(svc, row.id, row.session_id, row.zoom_recording_id as string);
      results.push({ id: row.id, outcome });
    } catch (e) {
      // Transient (download/upload) failure: leave status 'processing' so the
      // stale sweep retries; record the reason for admins.
      await svc.from("recordings").update({ error: (e as Error).message.slice(0, 500) }).eq("id", row.id);
      results.push({ id: row.id, outcome: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

async function transfer(
  svc: NonNullable<ReturnType<typeof getServiceClient>>,
  recordingId: string,
  sessionId: string,
  meetingUuid: string,
): Promise<string> {
  const rec = await getMeetingRecordings(meetingUuid);
  // Pick the best MP4 (speaker+screen view preferred), else any MP4.
  const files = rec?.recording_files ?? [];
  const mp4 =
    files.find((f) => f.file_type === "MP4" && f.recording_type === "shared_screen_with_speaker_view") ??
    files.find((f) => f.file_type === "MP4");

  if (!rec || !mp4) {
    await svc
      .from("recordings")
      .update({ status: "unavailable", error: "no_mp4_recording" })
      .eq("id", recordingId);
    return "unavailable";
  }

  // Stream Zoom → Supabase Storage without buffering the whole file in memory.
  const path = `${sessionId}/${mp4.id}.mp4`;
  const zoomRes = await downloadRecordingStream(mp4.download_url);

  const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/recordings/${path}`;
  const upInit: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
    },
    body: zoomRes.body as unknown as BodyInit,
    duplex: "half",
  };
  const upRes = await fetch(uploadUrl, upInit);
  if (!upRes.ok) throw new Error(`supabase_upload_${upRes.status}: ${(await upRes.text()).slice(0, 200)}`);

  await svc
    .from("recordings")
    .update({
      status: "ready",
      storage_path: path,
      duration: rec.duration ?? null,
      synced_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", recordingId);

  // Free Zoom's 5GB quota. Non-fatal — a failed delete just leaves it in Zoom.
  await deleteMeetingRecordings(meetingUuid).catch(() => {});
  return "ready";
}
