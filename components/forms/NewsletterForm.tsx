"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { newsletterSchema } from "@/lib/validation";

// Footer email capture → /api/leads with type: "newsletter".
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    const parsed = newsletterSchema.safeParse({
      type: "newsletter",
      email,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json().catch(() => null);
      // Only a truly persisted lead counts as success — never confirm
      // "you're on the list" when the API degraded (persisted: false).
      if (!res.ok || !result?.persisted) throw new Error("Request failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-gold">
        <Icon name="check_circle" className="text-[18px]" /> Thanks — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor="newsletter-email" className="text-sm text-muted">
        Get updates and free guides
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[44px] w-full rounded-input border border-hairline bg-surface px-4 py-2.5 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="flex min-h-[44px] items-center justify-center rounded-input bg-cta-gradient px-4 text-canvas shadow-glow-btn disabled:opacity-60 focus-gold"
        >
          <Icon name={status === "loading" ? "hourglass_empty" : "arrow_forward"} />
        </button>
      </div>
      {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
    </form>
  );
}
