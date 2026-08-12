"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/auth/AuthShell";

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-cta-gradient px-8 py-3 text-xs font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold";

// Separate admin console sign-in. Same Supabase auth, but branded for staff and
// gated to the admin role — a student/tutor who signs in here is refused and
// signed back out, then pointed at the main portal login.
export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const supabase = createClient();
    const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr || !signIn.user) {
      setError("The email or password you entered is incorrect.");
      setLoading(false);
      return;
    }
    // Confirm this account is actually an admin; otherwise refuse and sign out.
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", signIn.user.id).single();
    if (prof?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access. Use the portal login instead.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Admin Console</p>
        <h1 className="mt-2 text-h3 font-bold text-ink">Staff Sign in</h1>
        <p className="mt-2 text-muted">Manage students, tutors, courses and batches</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-muted">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@deeslanguagelounge.com"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-muted">Password</label>
            <Link href="/forgot-password" className="text-sm text-gold transition-colors hover:text-gold-light focus-gold">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={inputClass}
          />
        </div>

        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}

        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Student or tutor?{" "}
        <Link href="/login" className="font-medium text-gold transition-colors hover:text-gold-light focus-gold">
          Go to the portal login
        </Link>
      </p>
    </AuthShell>
  );
}
