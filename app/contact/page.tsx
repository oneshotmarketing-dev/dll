import type { Metadata } from "next";
import { AccentTitle } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/forms/ContactForm";
import { buildMetadata } from "@/content/seo";
import { contact } from "@/content/contact";
import { whatsappLink, hasWhatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata("contact");

export default function ContactPage() {
  return (
    <main>
      <section className="mx-auto max-w-container px-5 py-20 md:px-16 md:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: details */}
          <div className="space-y-8">
            <AccentTitle
              as="h1"
              heading={contact.heading}
              accentStyle="gradient"
              className="text-[clamp(2.5rem,7vw,4rem)] leading-[1.05]"
            />
            <p className="max-w-md text-lg text-muted">{contact.subhead}</p>

            <ul className="space-y-5">
              {contact.details.map((d) => (
                <li key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input bg-gold/10 text-gold">
                    <Icon name={d.icon} />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-widest text-muted">{d.label}</p>
                    {d.href ? (
                      <a href={d.href} className="text-ink hover:text-gold focus-gold">{d.value}</a>
                    ) : (
                      <p className="text-ink">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {hasWhatsapp() ? (
              <a
                href={whatsappLink({ context: "the website" })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-[#25D366] px-8 py-3 font-semibold text-white transition-transform hover:scale-105 focus-gold"
              >
                <Icon name="chat" /> {contact.whatsappLabel}
              </a>
            ) : null}
          </div>

          {/* Right: form */}
          <div className="rounded-card border border-hairline bg-surface p-6 md:p-8">
            <p className="mb-6 text-sm text-muted">{contact.formNote}</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
