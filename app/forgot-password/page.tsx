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

// Request a Supabase password-reset email. The email link routes through
// /auth/callback (to establish a recovery session) then to /reset-password.
// Copy is always generic so we never reveal whether an account exists.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    // Ignore the result deliberately: show the same confirmation either way.
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell>
      {!sent ? (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-h3 font-bold text-ink">Reset your password</h1>
            <p className="mt-2 text-muted">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card"
          >
            <div>
              <label htmlFor="fp-email" className="mb-2 block text-sm text-muted">
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </div>

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      ) : (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-glow-card">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Icon name="check_circle" className="text-4xl" filled />
          </span>
          <h1 className="text-h3 font-bold text-ink">Check your email</h1>
          <p className="mt-2 text-muted">
            If an account exists for this address, a password reset link has been sent.
          </p>
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
