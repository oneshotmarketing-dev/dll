// Builds wa.me deep-links with a prefilled, context-aware message.
// The number is env-driven (NEXT_PUBLIC_WHATSAPP_NUMBER, digits only).

const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/** Digits only, no "+", spaces or dashes — as wa.me requires. */
export function whatsappNumber(): string {
  return RAW_NUMBER.replace(/\D/g, "");
}

export function hasWhatsapp(): boolean {
  return whatsappNumber().length > 0;
}

export interface WhatsAppContext {
  /** A full, verbatim prefilled message. Takes precedence over `context`. */
  message?: string;
  /** e.g. "French" or a section name — used to build a default message. */
  context?: string;
}

export function whatsappLink(ctx: WhatsAppContext = {}): string {
  const number = whatsappNumber();
  const base =
    ctx.message ??
    (ctx.context
      ? `Hi! I'd like to know more about ${ctx.context}.`
      : "Hi! I'd like to know more about your language courses.");
  const text = encodeURIComponent(base);
  // If the number is unset, fall back to wa.me without a number (opens app to pick).
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
