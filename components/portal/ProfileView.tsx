"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabaseClient";
import { PhoneInput, isValidPhone } from "@/components/admin/PhoneInput";

function tzList(): string[] {
  const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
  return sv ? sv("timeZone") : ["America/Toronto", "America/New_York", "Asia/Kolkata", "Europe/London", "UTC"];
}

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const labelClass = "mb-2 block text-[10px] font-bold uppercase tracking-widest text-gold";

export function ProfileView({
  studentId,
  fullName,
  email,
  phone,
  timezone,
  avatarUrl,
  batchLine,
}: {
  studentId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  batchLine: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(fullName ?? "");
  const [phoneVal, setPhoneVal] = useState(phone ?? "");
  const [tz, setTz] = useState(timezone ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phoneVal)) {
      setError("Enter a valid phone number.");
      return;
    }
    setError(undefined);
    setStatus("saving");
    const { error: upErr } = await createClient()
      .from("profiles")
      .update({ full_name: name.trim() || null, phone: phoneVal || null, timezone: tz || null })
      .eq("id", studentId);
    if (upErr) {
      setStatus("error");
      setError(upErr.message);
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    await fetch("/api/avatar", { method: "POST", body: fd });
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Profile &amp; Settings</h1>
        <p className="mt-1 text-muted">Manage your account and preferences</p>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Profile card */}
        <div className="space-y-6 rounded-card border border-hairline bg-surface p-6 shadow-glow-card md:p-8">
          <div className="flex items-center gap-6">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-canvas text-xl font-bold text-gold">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (name || email || "S").trim().charAt(0).toUpperCase()
              )}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-input border border-hairline px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted transition-colors hover:border-gold hover:text-gold focus-gold disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
          </div>

          <div>
            <label htmlFor="pf-name" className={labelClass}>Full name</label>
            <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="pf-email" className={labelClass}>Email</label>
            <div className="flex items-center gap-2 rounded-input border border-hairline bg-canvas px-4 opacity-70">
              <input id="pf-email" value={email ?? ""} disabled className="min-h-[48px] w-full bg-transparent text-ink outline-none" />
              <Icon name="lock" className="text-sm text-muted" />
            </div>
            <p className="mt-1 text-[11px] text-muted">Email is managed by your account sign-in.</p>
          </div>

          <div>
            <label className={labelClass}>WhatsApp number</label>
            <PhoneInput value={phoneVal} onChange={setPhoneVal} className="min-h-[48px]" />
            <p className="mt-1 text-[11px] text-muted">Used by your trainer to reach you.</p>
          </div>

          {batchLine ? (
            <div className="flex items-center gap-2 border-t border-hairline pt-6 text-muted">
              <Icon name="school" className="text-sm text-gold" />
              <span className="text-[11px] uppercase tracking-wider">{batchLine}</span>
            </div>
          ) : null}
        </div>

        {/* Timezone card */}
        <div className="space-y-3 rounded-card border border-hairline bg-surface p-6 shadow-glow-card md:p-8">
          <label htmlFor="pf-tz" className={labelClass}>Your timezone</label>
          <select id="pf-tz" value={tz} onChange={(e) => setTz(e.target.value)} className={inputClass}>
            <option value="">Select a timezone</option>
            {tzList().map((z) => (
              <option key={z} value={z}>{z.replace(/_/g, " ")}</option>
            ))}
          </select>
          <p className="text-[11px] text-muted">All class times across the portal are shown in this timezone.</p>
        </div>

        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}

        <div className="flex items-center justify-end gap-6">
          {status === "saved" ? <span className="text-sm text-gold">Saved ✓</span> : null}
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-pill bg-cta-gradient px-10 py-4 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn transition-transform hover:scale-[1.02] disabled:opacity-60 focus-gold"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
