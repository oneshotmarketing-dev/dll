"use client";

import { useState } from "react";
import { Label, TextInput, TextArea, FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { contactSchema } from "@/lib/validation";

type Errors = Partial<Record<string, string>>;

// Contact enquiry → /api/leads with type: "contact".
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);
    const form = new FormData(e.currentTarget);

    const payload = {
      type: "contact" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
      sourcePage: "/contact",
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json().catch(() => null);
      // Only a truly persisted lead counts as success — never show "Thanks"
      // when the API degraded (ok: true, persisted: false) and the lead was lost.
      if (!res.ok || !result?.persisted) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-card border border-gold/40 bg-surface p-6 text-gold">
        <Icon name="check_circle" filled /> Thanks — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="c-name" required>Name</Label>
        <TextInput id="c-name" name="name" autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} />
        <FieldError id="c-err-name" message={errors.name} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-email" required>Email</Label>
          <TextInput id="c-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" aria-invalid={!!errors.email} />
          <FieldError id="c-err-email" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="c-phone">Phone</Label>
          <TextInput id="c-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Optional" />
          <FieldError id="c-err-phone" message={errors.phone} />
        </div>
      </div>
      <div>
        <Label htmlFor="c-message" required>Message</Label>
        <TextArea id="c-message" name="message" placeholder="How can we help?" aria-invalid={!!errors.message} />
        <FieldError id="c-err-message" message={errors.message} />
      </div>

      {serverError ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{serverError}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-cta-gradient px-10 py-4 text-sm font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:scale-[1.01] disabled:opacity-60 focus-gold sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
