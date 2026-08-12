"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { Icon } from "@/components/ui/Icon";

const AFTER_RESET_URL = "/dashboard";

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-cta-gradient px-8 py-3 text-xs font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold";

// Landing page for the password-reset email link. /auth/callback has already
// exchanged the code for a recovery session, so here the user just sets a new
// password (supabase.auth.updateUser).
export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setError(undefined);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  return (
    <AuthShell>
      {checking ? (
        <p className="text-center text-muted">Loading…</p>
      ) : done ? (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-glow-card">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Icon name="check_circle" className="text-4xl" filled />
          </span>
          <h1 className="text-h3 font-bold text-ink">Password updated</h1>
          <p className="mt-2 text-muted">You can now sign in with your new password.</p>
          <button
            type="button"
            onClick={() => router.push(AFTER_RESET_URL)}
            className={`mt-6 ${buttonClass}`}
          >
            Continue
          </button>
        </div>
      ) : hasSession ? (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-h3 font-bold text-ink">Set a new password</h1>
            <p className="mt-2 text-muted">Choose a new password for your account</p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card"
          >
            <div>
              <label htmlFor="rp-password" className="mb-2 block text-sm text-muted">
                New password
              </label>
              <input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="rp-confirm" className="mb-2 block text-sm text-muted">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className={inputClass}
              />
            </div>

            {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </>
      ) : (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-glow-card">
          <h1 className="text-h3 font-bold text-ink">Reset link invalid or expired</h1>
          <p className="mt-2 text-muted">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link href="/forgot-password" className={`mt-6 ${buttonClass}`}>
            Request a new link
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-muted transition-colors hover:text-gold focus-gold">
          ← Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
