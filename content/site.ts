import type { NavItem, FooterContent } from "./types";

/**
 * Site-wide config and shared chrome (nav + footer model).
 *
 * ctaMode is the SINGLE switch for the entire booking flow:
 *   'form'     → every CTA routes to /book-assessment (default)
 *   'whatsapp' → every CTA opens a wa.me deep-link with page/section context
 * Switching later is this one-line change. Both paths are fully built.
 */
// Single switch for the whole booking flow (kickoff Functionality #1).
const CTA_MODE: "form" | "whatsapp" = "whatsapp";

export const site = {
  name: "Dees Language Lounge",
  wordmark: "Dees Language Lounge",
  monogram: "D",
  ctaMode: CTA_MODE,
  // Mode-aware default label used by shared chrome (nav, drawer). Section CTAs
  // pass their own label from /content.
  ctaLabel: CTA_MODE === "whatsapp" ? "Chat on WhatsApp" : "Book a free level assessment",

  // The one conversion destination when ctaMode === 'form'.
  bookingPath: "/book-assessment",

  socials: {
    facebook: "https://www.facebook.com/people/Dees-Language-Lounge/61591417082656/",
    instagram: "https://www.instagram.com/deeslanguagelounge/",
    linkedin: "#",
    x: "#",
    discord: "#",
  },
} as const;

// Site-wide nav (kickoff Functionality #2). French IS the TEF/TCF Canada page,
// so there is no separate "TEF-TCF Canada" item.
export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Courses",
    dropdown: [
      { label: "French", href: "/french-canada" },
      { label: "Spanish", href: "/courses/spanish" },
      { label: "German", href: "/courses/german" },
      { label: "IELTS English", href: "/courses/ielts" },
    ],
  },
  {
    label: "Services",
    // Landing page is Home ("/") for now — repoint each to its own page later.
    dropdown: [
      { label: "Online Courses", href: "/" },
      { label: "Online Classes", href: "/" },
      { label: "Beginner's Classes", href: "/" },
      { label: "Advanced Classes", href: "/" },
      { label: "TEF Canada", href: "/" },
      { label: "Language Learning", href: "/" },
      { label: "French Tutor", href: "/" },
      { label: "French Classes", href: "/" },
      { label: "Group Lessons", href: "/" },
      { label: "Leadership Coaching", href: "/" },
      { label: "TEF Exam Preparation", href: "/" },
      { label: "TCF Exam Preparation", href: "/" },
      { label: "DELF Exam Preparation", href: "/" },
      { label: "Language Training", href: "/" },
      { label: "Online Learning", href: "/" },
      { label: "Online Programs", href: "/" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Default footer (multi-language school voice — Variant B / homepage).
// The /french-canada page passes its own footer override with the compliance line.
export const footer: FooterContent = {
  blurb:
    "Live online classes in French, Spanish, German and IELTS English — small groups, certified trainers, real conversation. Wherever you are in the world, learn a language properly.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Courses",
      links: [
        { label: "French", href: "/french-canada" },
        { label: "Spanish", href: "/courses/spanish" },
        { label: "German", href: "/courses/german" },
        { label: "IELTS English", href: "/courses/ielts" },
      ],
    },
    {
      title: "Links",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
  legal: "© 2026 Dees Language Lounge. All rights reserved.",
};
