import { site } from "@/content/site";
import { whatsappLink } from "./whatsapp";

/**
 * The single place that turns ctaMode + page/section context into a
 * destination. Every CTA in the site goes through resolveCta(), so switching
 * 'form' ↔ 'whatsapp' is genuinely the one-line change in content/site.ts.
 */

export interface CtaContext {
  /** Human-readable context for the WhatsApp prefilled message. */
  context?: string;
  /** Full verbatim WhatsApp prefill message (overrides context in wa mode). */
  waMessage?: string;
  /** Language prefill for the form (/book-assessment?lang=). */
  lang?: string;
  /** Batch prefill for the form (/book-assessment?batch=). */
  batch?: string;
  /** Goal prefill for the form (/book-assessment?goal=). */
  goal?: string;
}

export interface ResolvedCta {
  href: string;
  external: boolean;
}

export function resolveCta(ctx: CtaContext = {}): ResolvedCta {
  if (site.ctaMode === "whatsapp") {
    return { href: whatsappLink({ message: ctx.waMessage, context: ctx.context }), external: true };
  }

  // 'form' mode → /book-assessment with optional prefill params.
  const params = new URLSearchParams();
  if (ctx.lang) params.set("lang", ctx.lang);
  if (ctx.batch) params.set("batch", ctx.batch);
  if (ctx.goal) params.set("goal", ctx.goal);
  const qs = params.toString();
  return { href: qs ? `${site.bookingPath}?${qs}` : site.bookingPath, external: false };
}
