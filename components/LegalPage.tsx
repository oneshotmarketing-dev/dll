import type { LegalPage as LegalPageContent } from "@/content/legal";

// Shared layout for Privacy / Terms. Readable body on canvas (white / cool-grey,
// per accessibility rules). Sections render as paragraphs, an optional bulleted
// list, then optional closing paragraphs.
export function LegalPageView({ page }: { page: LegalPageContent }) {
  return (
    <main>
      <article className="mx-auto max-w-3xl px-5 py-20 md:px-16 md:py-28">
        <p className="mb-3 text-eyebrow uppercase text-gold">{page.updated}</p>
        <h1 className="mb-6 text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-tight text-ink">
          {page.title}
        </h1>

        {page.intro?.length ? (
          <div className="mb-12 space-y-4">
            {page.intro.map((p) => (
              <p key={p} className="text-lg leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <div className="mb-12" />
        )}

        <div className="space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-xl font-bold text-ink">{s.heading}</h2>

              <div className="space-y-4">
                {s.body.map((p) => (
                  <p key={p} className="leading-relaxed text-muted">
                    {p}
                  </p>
                ))}

                {s.bullets ? (
                  <ul className="list-disc space-y-2 pl-5 marker:text-gold">
                    {s.bullets.map((b) => (
                      <li key={b} className="leading-relaxed text-muted">
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {s.outro?.map((p) => (
                  <p key={p} className="leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
