"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { Icon } from "@/components/ui/Icon";

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-cta-gradient px-8 py-3 text-xs font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold";

// Change password from the profile dropdown. Supabase updates the logged-in
// user's password directly (no current-password re-entry needed for an active
// session).
export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
    const { error: upErr } = await createClient().auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  return (
    <AuthShell>
      {done ? (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-glow-card">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Icon name="check_circle" className="text-4xl" filled />
          </span>
          <h1 className="text-h3 font-bold text-ink">Password changed</h1>
          <p className="mt-2 text-muted">Your new password is saved.</p>
          <Link href="/student" className={`mt-6 ${buttonClass}`}>
            Back to portal
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-h3 font-bold text-ink">Change password</h1>
            <p className="mt-2 text-muted">Set a new password for your account</p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card"
          >
            <div>
              <label htmlFor="cp-password" className="mb-2 block text-sm text-muted">
                New password
              </label>
              <input
                id="cp-password"
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
              <label htmlFor="cp-confirm" className="mb-2 block text-sm text-muted">
                Confirm new password
              </label>
              <input
                id="cp-confirm"
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
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/student" className="text-muted transition-colors hover:text-gold focus-gold">
              ← Back to portal
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
