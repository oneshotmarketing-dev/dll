import { SITE_URL, SITE_NAME } from "@/content/seo";
import type { FaqItem } from "@/content/types";

// Structured data (JSON-LD). Organization is injected site-wide from the root
// layout; Course and FAQPage are added by the pages that have them.

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is static and trusted (built from /content), safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Live online language school teaching French, Spanish, German and IELTS English, with a dedicated TEF/TCF Canada exam-prep track.",
        sameAs: [],
      }}
    />
  );
}

export function CourseJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name,
        description,
        url: `${SITE_URL}${path}`,
        provider: {
          "@type": "EducationalOrganization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}
