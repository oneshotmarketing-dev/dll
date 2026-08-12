"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { whatsappLink } from "@/lib/whatsapp";

// Where a successful sign-in lands. Single source of truth; the /dashboard
// route does not exist in this repo yet, which is expected.
const AFTER_SIGN_IN_URL = "/dashboard";

const inputClass =
  "min-h-[48px] w-full rounded-input border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const buttonClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-cta-gradient px-8 py-3 text-xs font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold";

// Student login (Supabase Auth, email + password). Accounts are admin-created;
// there is no signup here.
export default function LoginPage() {
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
    const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !signIn.user) {
      // Generic message — never reveal whether the email exists.
      setError("The email or password you entered is incorrect.");
      setLoading(false);
      return;
    }
    // Admins have a dedicated console login — refuse them on the portal login and
    // sign them back out so an admin account can't be used here. Students and
    // tutors both belong on this page (the portal layout routes tutors to /tutor).
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", signIn.user.id).single();
    if (prof?.role === "admin") {
      await supabase.auth.signOut();
      setError("Admins sign in from the admin login page.");
      setLoading(false);
      return;
    }
    router.push(AFTER_SIGN_IN_URL);
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <h1 className="text-h3 font-bold text-ink">Student Login</h1>
        <p className="mt-2 text-muted">Access your classes, recordings and materials</p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5 rounded-card border border-hairline bg-surface p-8 shadow-glow-card"
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-muted">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-gold transition-colors hover:text-gold-light focus-gold"
            >
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
        New student?{" "}
        <a
          href={whatsappLink({ context: "enrolling as a new student" })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gold transition-colors hover:text-gold-light focus-gold"
        >
          Message us on WhatsApp to enroll
        </a>
      </p>
    </AuthShell>
  );
}
