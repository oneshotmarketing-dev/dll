import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { getServiceClient } from "@/lib/supabase";

// POST /api/leads — validates with Zod (server side) then inserts into Supabase.
// Handles assessment / newsletter / contact via the discriminated union.
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Map camelCase input → snake_case columns. Fields absent on a given lead
  // type simply stay undefined (→ null).
  const row = {
    type: data.type,
    name: "name" in data ? data.name : null,
    email: data.email,
    phone: "phone" in data ? data.phone || null : null,
    language: "language" in data ? data.language : null,
    goal: "goal" in data ? data.goal : null,
    preferred_time: "preferredTime" in data ? data.preferredTime || null : null,
    message: "message" in data ? data.message || null : null,
    source_page: data.sourcePage ?? null,
    utm_source: "utmSource" in data ? data.utmSource ?? null : null,
    utm_medium: "utmMedium" in data ? data.utmMedium ?? null : null,
    utm_campaign: "utmCampaign" in data ? data.utmCampaign ?? null : null,
  };

  const supabase = getServiceClient();

  // Graceful degradation: if Supabase isn't configured (local dev), don't 500 —
  // log and return ok so the UI success state (and WhatsApp fallback) still works.
  if (!supabase) {
    console.warn("[leads] Supabase not configured — lead not persisted:", row);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("leads").insert(row);
  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "Could not save your details." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
