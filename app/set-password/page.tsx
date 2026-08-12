"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/auth/AuthShell";

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-cta-gradient px-8 py-3 text-xs font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold";

// Forced first-login password change. Reached when profiles.must_change_password
// is true (the (portal) layout redirects here). No skip; clears the flag on success.
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setError(undefined);
    setLoading(true);
    const supabase = createClient();
    const { data, error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", data.user.id);
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <h1 className="text-h3 font-bold text-ink">Set your password</h1>
        <p className="mt-2 text-muted">Choose a password to finish setting up your account</p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card"
      >
        <div>
          <label htmlFor="sp-password" className="mb-2 block text-sm text-muted">
            New password
          </label>
          <input
            id="sp-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sp-confirm" className="mb-2 block text-sm text-muted">
            Confirm password
          </label>
          <input
            id="sp-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className={inputClass}
          />
        </div>

        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}

        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Saving…" : "Set password & continue"}
        </button>
      </form>
    </AuthShell>
  );
}
