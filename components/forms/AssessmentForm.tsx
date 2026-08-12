"use client";

import { useState } from "react";
import { Label, TextInput, TextArea, Select, FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { assessmentSchema, LANGUAGES, GOALS } from "@/lib/validation";
import { whatsappLink, hasWhatsapp } from "@/lib/whatsapp";

// Map hero picker values → the human labels the form/select expects.
const LANG_FROM_PARAM: Record<string, (typeof LANGUAGES)[number]> = {
  french: "French",
  spanish: "Spanish",
  german: "German",
  ielts: "IELTS English",
};
const GOAL_FROM_PARAM: Record<string, (typeof GOALS)[number]> = {
  "canada-pr": "Canada PR",
  "study-abroad": "Study abroad",
  career: "Career",
  travel: "Travel",
};

type Errors = Partial<Record<string, string>>;

export function AssessmentForm({
  prefillLang,
  prefillGoal,
  prefillBatch,
  sourcePage = "/book-assessment",
}: {
  prefillLang?: string;
  prefillGoal?: string;
  prefillBatch?: string;
  sourcePage?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | undefined>();

  const defaultLang = prefillLang ? LANG_FROM_PARAM[prefillLang] : undefined;
  const defaultGoal = prefillGoal ? GOAL_FROM_PARAM[prefillGoal] : undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(undefined);
    const form = new FormData(e.currentTarget);

    const payload = {
      type: "assessment" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: `${String(form.get("countryCode") ?? "")} ${String(form.get("phone") ?? "")}`.trim(),
      language: String(form.get("language") ?? ""),
      goal: String(form.get("goal") ?? ""),
      preferredTime: String(form.get("preferredTime") ?? ""),
      message:
        String(form.get("message") ?? "") +
        (prefillBatch ? `\n\n[Interested in batch: ${prefillBatch}]` : ""),
      sourcePage,
    };

    const parsed = assessmentSchema.safeParse(payload);
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
      // Only a truly persisted lead counts as success — never show "Request
      // received" when the API degraded (ok: true, persisted: false).
      if (!res.ok || !result?.persisted) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
      setServerError("Something went wrong. Please try again or message us on WhatsApp.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-card border border-gold/40 bg-surface p-8 text-center shadow-glow-card">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Icon name="check_circle" className="text-4xl" filled />
        </span>
        <h2 className="mb-2 text-2xl font-bold text-ink">Request received</h2>
        <p className="mb-6 text-muted">
          Thanks — we&apos;ll be in touch shortly to schedule your free 30-minute assessment.
        </p>
        {hasWhatsapp() ? (
          <a
            href={whatsappLink({ context: "my free level assessment" })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-[#25D366] px-8 py-3 font-semibold text-white transition-transform hover:scale-105 focus-gold"
          >
            <Icon name="chat" /> Continue on WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="name" required>Full name</Label>
        <TextInput id="name" name="name" autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} />
        <FieldError id="err-name" message={errors.name} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" required>Email</Label>
          <TextInput id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" aria-invalid={!!errors.email} />
          <FieldError id="err-email" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="phone" required>Phone</Label>
          <div className="flex gap-2">
            <TextInput id="countryCode" name="countryCode" defaultValue="+91" className="w-20 shrink-0 text-center" aria-label="Country code" />
            <TextInput id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" aria-invalid={!!errors.phone} />
          </div>
          <FieldError id="err-phone" message={errors.phone} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="language" required>Language interest</Label>
          <Select id="language" name="language" defaultValue={defaultLang ?? ""} aria-invalid={!!errors.language}>
            <option value="" disabled>Select a language</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
          <FieldError id="err-language" message={errors.language} />
        </div>
        <div>
          <Label htmlFor="goal" required>Goal</Label>
          <Select id="goal" name="goal" defaultValue={defaultGoal ?? ""} aria-invalid={!!errors.goal}>
            <option value="" disabled>Select a goal</option>
            {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <FieldError id="err-goal" message={errors.goal} />
        </div>
      </div>

      <div>
        <Label htmlFor="preferredTime">Preferred time</Label>
        <TextInput id="preferredTime" name="preferredTime" placeholder="e.g. Weekday evenings EST" />
      </div>

      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <TextArea id="message" name="message" placeholder="Anything you'd like us to know?" />
      </div>

      {prefillBatch ? (
        <p className="rounded-input border border-hairline bg-surface px-4 py-3 text-sm text-muted">
          <Icon name="event_available" className="mr-1 align-middle text-gold" />
          Reserving your place is assessment-first — we&apos;ll discuss <span className="text-ink">{prefillBatch}</span> on your call.
        </p>
      ) : null}

      {serverError ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{serverError}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-cta-gradient px-10 py-4 text-sm font-semibold uppercase tracking-widest text-canvas shadow-glow-btn transition-all hover:scale-[1.01] hover:shadow-glow-btn-hover disabled:opacity-60 focus-gold"
      >
        {status === "loading" ? "Sending…" : "Book my free level assessment"}
      </button>
    </form>
  );
}
