import Image from "next/image";
import Link from "next/link";

// "Language destinations" — sits directly below the hero, above the stats band.
// Four photo cards, each a single Link into its language/course page. This is a
// fixed marketing section, so its heading + card data live here (self-contained).
// Reuses the locked tokens: canvas #030712, surface #0B1220, gold #C5A36B,
// Libre Caslon serif accent, .section-y rhythm and the glow-card hover.
interface Destination {
  language: string;
  href: string;
  image: string;
  alt: string;
  /** Optional gold chip shown on the photo (e.g. the French exam track). */
  chip?: string;
}

const DESTINATIONS: Destination[] = [
  {
    language: "French",
    href: "/french-canada",
    image: "/images/languages/french.jpg",
    alt: "A Loire Valley château framed by formal gardens in France",
    chip: "TEF/TCF Canada track",
  },
  {
    language: "Spanish",
    href: "/courses/spanish",
    image: "/images/languages/spanish.jpg",
    alt: "The colourful colonial streets of Cartagena, Colombia",
  },
  {
    language: "German",
    href: "/courses/german",
    image: "/images/languages/german.jpg",
    alt: "A Bavarian old-town square with rooftops beneath the Alps",
  },
  {
    language: "IELTS English",
    href: "/courses/ielts",
    image: "/images/languages/ielts.jpg",
    alt: "The Toronto skyline with the CN Tower at dusk",
  },
];

export function LanguageDestinations() {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      {/* Same display pattern as other sections: bold sans headline with one
          Libre Caslon italic accent phrase (.accent-glow). */}
      <h2 className="mb-7 text-center text-3xl font-bold tracking-tight text-ink md:text-5xl lg:mb-12">
        Select the language you want to <span className="accent-glow">learn.</span>
      </h2>

      {/* 1 col mobile · 2×2 tablet · 4-across desktop. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.language}
            href={d.href}
            aria-label={`Explore ${d.language} courses`}
            className="group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-glow-card focus-gold"
          >
            {/* Destination photo — 1:1 square for maximum presence,
                image scales on hover. */}
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={d.image}
                alt={d.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* Subtle bottom dark (canvas) gradient for legibility over any photo. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-canvas/10 to-transparent"
              />
              {/* Gold chip — solid dark surface bg keeps gold text AA-legible
                  over any photo (cn() is a plain joiner, so no bg override). */}
              {d.chip ? (
                <span className="absolute left-3 top-3 inline-flex items-center rounded-pill border border-gold/30 bg-surface/90 px-3 py-1 text-eyebrow uppercase text-gold backdrop-blur-sm">
                  {d.chip}
                </span>
              ) : null}
            </div>

            {/* Label bar — brand gold background with near-black (canvas) text. */}
            <div className="flex items-center justify-between gap-2 bg-gold px-5 py-4">
              <span className="text-xl font-bold text-canvas">{d.language}</span>
              <span className="flex items-center gap-1 text-eyebrow uppercase text-canvas/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Explore <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
