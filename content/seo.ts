import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://deeslanguagelounge.com";
const SITE_NAME = "Dees Language Lounge";

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

// Per-page metadata source. /french-canada title fixed per kickoff SEO clause.
export const pageSeo = {
  home: {
    title: "Dees Language Lounge — Live Online French, Spanish, German & IELTS Classes",
    description:
      "Live online language classes in French, Spanish, German and IELTS English. Small groups, certified trainers, speaking practice from day one. Book a free level assessment.",
    path: "/",
  },
  frenchCanada: {
    title: "TEF/TCF Canada Preparation — Live French Classes | Dees Language Lounge",
    description:
      "Live online French classes built around the TEF/TCF Canada exam. Reach CLB 7 in all four skills for Canada Express Entry. Book a free level assessment.",
    path: "/french-canada",
  },
  about: {
    title: "About Us | Dees Language Lounge",
    description:
      "The story, mission and trainers behind Dees Language Lounge — a live online language school built for ambitious professionals.",
    path: "/about",
  },
  bookAssessment: {
    title: "Book a Free Level Assessment | Dees Language Lounge",
    description:
      "Book your free 30-minute level assessment. Know your exact starting level and a realistic timeline to your goal — no commitment.",
    path: "/book-assessment",
  },
  contact: {
    title: "Contact | Dees Language Lounge",
    description: "Get in touch with Dees Language Lounge by email, phone or WhatsApp.",
    path: "/contact",
  },
  freeResources: {
    title: "Free Resources | Dees Language Lounge",
    description: "Free language-learning and Canada-PR guides and tools from Dees Language Lounge.",
    path: "/free-resources",
  },
  spanish: {
    title: "Live Spanish Classes (DELE) — Coming Soon | Dees Language Lounge",
    description: "A1–C1 DELE-aligned live Spanish cohorts, coming soon. Book a free assessment to reserve your spot.",
    path: "/courses/spanish",
  },
  german: {
    title: "Live German Classes (Goethe) — Coming Soon | Dees Language Lounge",
    description: "A1–C1 Goethe-aligned live German cohorts, coming soon. Book a free assessment to reserve your spot.",
    path: "/courses/german",
  },
  ielts: {
    title: "Live IELTS English Prep — Coming Soon | Dees Language Lounge",
    description: "Band-score-strategy IELTS prep with weekly mock tests, coming soon. Book a free assessment for your plan.",
    path: "/courses/ielts",
  },
  privacy: { title: "Privacy Policy | Dees Language Lounge", description: "How Dees Language Lounge collects and uses your information.", path: "/privacy" },
  terms: { title: "Terms of Service | Dees Language Lounge", description: "The terms for using the Dees Language Lounge website and services.", path: "/terms" },
} satisfies Record<string, PageSeo>;

export function buildMetadata(key: keyof typeof pageSeo): Metadata {
  const seo = pageSeo[key];
  const url = `${SITE_URL}${seo.path === "/" ? "" : seo.path}`;
  return {
    // Absolute so the root layout's "%s | Dees Language Lounge" template does
    // not re-append the brand (these titles already include it).
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export { SITE_URL, SITE_NAME };
