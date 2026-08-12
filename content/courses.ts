// Stub course pages (kickoff route map: Spanish/German/IELTS are "coming soon").
// French is NOT here — /courses/french 301-redirects to /french-canada.
// This is the interim form of Phase-0 feature #3 (Course detail pages).

import type { LanguageKey } from "./types";

export interface CourseStub {
  key: Exclude<LanguageKey, "french">;
  name: string;
  flag: string;
  eyebrow: string;
  heading: { before: string; accent: string; after?: string };
  blurb: string;
  bullets: string[];
}

export const courseStubs: Record<CourseStub["key"], CourseStub> = {
  spanish: {
    key: "spanish",
    name: "Spanish",
    flag: "🇪🇸",
    eyebrow: "DELE TRACK",
    heading: { before: "Live", accent: "Spanish", after: "classes are coming soon." },
    blurb:
      "A1–C1, DELE-aligned, speaking-first — the same live cohort format as our French program. Book a free assessment and we'll tell you when the next Spanish batch opens.",
    bullets: ["A1–C1 · DELE track", "Speaking-first method", "Small live cohorts, every class recorded"],
  },
  german: {
    key: "german",
    name: "German",
    flag: "🇩🇪",
    eyebrow: "GOETHE TRACK",
    heading: { before: "Live", accent: "German", after: "classes are coming soon." },
    blurb:
      "A1–C1, Goethe-Zertifikat-aligned, with grammar made simple for English and Hindi speakers. Book a free assessment to reserve your spot in the next cohort.",
    bullets: ["A1–C1 · Goethe-Zertifikat track", "Grammar made simple", "Small live cohorts, every class recorded"],
  },
  ielts: {
    key: "ielts",
    name: "IELTS English",
    flag: "🇬🇧",
    eyebrow: "BAND-SCORE STRATEGY",
    heading: { before: "Live", accent: "IELTS", after: "prep is coming soon." },
    blurb:
      "Academic & General, band-score strategy, weekly mock tests — built to move your lowest skill fastest. Book a free assessment for your target-band plan.",
    bullets: ["Academic & General", "Band-score strategy", "Weekly mock tests"],
  },
};

export const freeResources = {
  eyebrow: "FREE RESOURCES",
  heading: { before: "Guides and tools are", accent: "on the way." },
  blurb:
    "We're building a free level test, a CRS points guide, and a TEF vs TCF comparison. Want early access? Book a free assessment or drop your email in the footer.",
  planned: [
    { title: "Free Level Test", body: "A quick self-assessment to find your starting CEFR level." },
    { title: "CRS Points Guide", body: "How French adds up to 50 CRS points for Canada Express Entry." },
    { title: "TEF vs TCF Guide", body: "Which Canada French exam is right for you — a plain-English comparison." },
  ],
};
