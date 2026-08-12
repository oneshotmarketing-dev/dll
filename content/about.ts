// PLACEHOLDER — the Story (§4) and Founder (§7) sections are a strong SHAPE with
// invented details. Replace with Deepa's REAL journey, in her words, and a real
// founder portrait before launch — an invented founder story destroys the
// honesty positioning the whole site is built on. Stats/teachers are placeholder.
// About page, WhatsApp CTA edition.

import type {
  AboutHeroContent,
  AboutStoryContent,
  Feature,
  SectionHeadingContent,
  Stat,
  AboutFounderContent,
  Teacher,
  AboutHonestyContent,
  FinalCtaContent,
} from "./types";

export const aboutHero: AboutHeroContent = {
  eyebrow: "Our story",
  heading: { before: "Built by language", accent: "learners", after: ", for language learners." },
  subhead:
    "Dees Language Lounge exists because of a simple belief: anyone can learn to speak a new language with confidence — if they're taught the way languages are actually learned. Live, out loud, in small groups, by trainers who remember what it felt like to start from zero.",
  ctaLabel: "Chat with us on WhatsApp",
  ctaWaMessage: "Hi! Tell me more about how your classes work.",
};

export const aboutStory: AboutStoryContent = {
  eyebrow: "WHY WE EXIST",
  heading: { before: "It started with a", accent: "frustration", after: "you probably share." },
  paragraphs: [
    "Deepa learned French the hard way — apps that stalled at A2, classes that drilled grammar but never real conversation, and the slow discovery that \"knowing\" a language and speaking it are entirely different skills.",
    "What she saw everywhere was the same broken pattern: schools selling course hours instead of outcomes, apps gamifying vocabulary while learners stayed mute, and students who'd studied for years but froze the moment a real person spoke to them.",
    // Reworded to read naturally after the pulled-out rule (see `rule`).
    "It's the one rule that governs everything we do: every class is live. Every learner talks in every session. Every level ends in a certification the world recognises — because progress you can't prove is progress you can't use.",
  ],
  // Pulled out of paragraph 3 and rendered as a styled inset between p2 and p3.
  rule: { before: "You learn to speak by", accent: "speaking." },
};

export const aboutBeliefsHeading: SectionHeadingContent = {
  eyebrow: "HOW WE TEACH",
  heading: { before: "What we", accent: "believe" },
};

export const aboutBeliefs: Feature[] = [
  {
    icon: "record_voice_over",
    title: "Speaking isn't the last step. It's the first.",
    body: "You'll speak in your very first class — badly, and that's the point. Confidence is built out loud, not after \"one more grammar module.\"",
  },
  {
    icon: "groups",
    title: "Small groups or it doesn't work.",
    body: "Maximum 10 per batch. In a class of 40, you speak twice a month. In ours, you speak every session — and your trainer knows exactly where you're stuck.",
  },
  {
    icon: "diversity_3",
    title: "Trainers who've been on your side of the table.",
    body: "Every Dees trainer learned their language as a second language. They explain through English and Hindi, remember what confused them at A1, and teach past it.",
  },
  {
    icon: "verified",
    title: "Honesty over hype.",
    body: "No \"fluent in 30 days.\" No fake urgency. If a timeline isn't realistic, we say so before you pay — because students who trust us finish, and students who finish certify.",
  },
];

export const aboutStats: Stat[] = [
  { value: "4", label: "Languages taught live" },
  { value: "500+", label: "Students coached" },
  { value: "50+", label: "Live batches completed" },
  { value: "4.9/5", label: "Average rating" },
];

// PLACEHOLDER — replace with Deepa's real bio, real portrait and a real quote.
export const aboutFounder: AboutFounderContent = {
  eyebrow: "WHO'S BEHIND THIS",
  name: "Deepa Khatri",
  role: "Founder",
  paragraphs: [
    "I started Dees Language Lounge from my home in [city], Canada, after watching too many talented people around me get stuck — not because they couldn't learn, but because nobody was teaching them to speak. Every batch we run is built the way I wish someone had taught me.",
  ],
  pullQuote:
    "You don't need talent to learn a language. You need a room where it's safe to make mistakes — and a teacher who makes sure they're the right mistakes.",
  image: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Nepln4a8e8BFzcp8_P3KprDaZfmFQK8abTdufZ198S_VgpV3YRMWXa2M1VMZitZDyGH7rwYRcoNvIBd8TgLcCjy2RX-EAL9iRc7BHNOXJQoejqXaC7CndNcq5XcFQ9tz4D1Ikc6-t8QjyBbpxFk8cA7lrn_PpajJ3oZM0H8gqtEPZjPuDhgLq8TPVk86lpq4p0WjO3bRh6u0pFryhkZDO4D8K1sLPAO2eXgdqxn2udhQzHx5atsw",
    alt: "Portrait of founder Deepa Khatri (placeholder — replace with real photo)",
  },
};

export const aboutTeachersHeading: SectionHeadingContent = {
  heading: { before: "The people who'll", accent: "actually", after: "teach you." },
};

// PLACEHOLDER — Stitch-invented profiles; replace with Deepa's real trainers.
export const aboutTeachers: Teacher[] = [
  {
    name: "Sarah Dubois",
    credential: "DALF C1",
    blurb: "8 yrs teaching · 200+ students certified · English/Hindi/French",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY12xoy8b9ecZ3T88L1zs4m_1EQFrpRhfST9bf6dZ1JGLjUzlSOQaXnOjwc-ZAUuwAil4jPndYsp9V85LHXSyw4WR0K64qHjUdHQmSpd8ftrPuTZnkb7HCgwwqYtS16HT3LBsyCzEOapw4CbhOkwsS865EGOmXVN4GEPo0-QZXW2OKGWg38LX3QEbQD_QbaWUOvV9MUyspNaeGRDjVYaIyOEkkImvCI60eHATCoCeubEOiTkUKDzJF",
      alt: "Portrait of French trainer Sarah Dubois",
    },
  },
  {
    name: "Carlos Mendez",
    credential: "DELE C1",
    blurb: "7 yrs teaching · 180+ students certified · English/Hindi/Spanish",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANrLE4HjUqQn719JyqEXzpwer-NixZjrpNs-37Bvg3VA142xpUr1dm3nsUu2UYieeTCyGmw3GdiHF_mCLkYrgSEA8UJ1uEfk-0mIo7AGJwsujZ9p5htsKEO9yIvG86ZaCnL4FZwQZ-HhsrHG_P6TldgvXAyaCs_A3QN6-xkE0b5lyjvDRxpa1DJeQ3kPZMpRrWnYmckbV5asMLFJyBwSSddwyL5dqlTBxfaNu-QmwiPmCmDUqcO485",
      alt: "Portrait of Spanish trainer Carlos Mendez",
    },
  },
  {
    name: "Anna Schmidt",
    credential: "Goethe C1",
    blurb: "9 yrs teaching · 220+ students certified · English/German",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4FT5COJwS-3m2l0OQkpXspGST-7QEcrz_Ab21YeA6kiP5LbhswMLkOqHPW4mSNzOV_yn69qlTA3GEOapK-owkhiBhwCpObqAb8bzPZQfL-2yHSRFtu-oiP1uiaIFi7z1hRyCyBjW5rA3RPw3-dlKUSjnJU-VfqKse2Y3zvxJ6B-oubd8JQSV8DuOc5B0VMmXKb3kYUBWNhkwbgWyiDEF1rMjEq8f49daXbZqjkm6H82RiH-oTz9BO",
      alt: "Portrait of German trainer Anna Schmidt",
    },
  },
  {
    name: "David Chen",
    credential: "IELTS 8.5",
    blurb: "6 yrs teaching · 150+ students certified · English",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU0kSCr3WWncVwyB0319_VY5FHj38QAiw0eDxQXsvfN9vcO-g5N-ZMOoWitU5KUXcw_uy42HL_1C4HFV5HEbY8J1pKGVEO0rC3jCxvYFz0rvcahqrRdM0xvnPMKGf0GhYp6j99_-IE19ALG2s3PG6esO3CCY5pkCG5TATtBZuKRk289v3YFqF3KOX7pmEGvZynf98goHSEDPmMvqejNCCR90j0PhnEg5V3nOt-eQi78B3jmBba5zrL",
      alt: "Portrait of IELTS coach David Chen",
    },
  },
];

export const aboutTeachersTrustLine =
  "Credentials verified. Ask to meet your trainer on WhatsApp before you enrol — we'll happily introduce you.";

export const aboutHonesty: AboutHonestyContent = {
  eyebrow: "READ THIS BEFORE YOU ENROL",
  heading: { before: "What we're", accent: "not" },
  intro: "Because trust is earned by what you're willing to say out loud:",
  points: [
    {
      lead: "We're not an immigration consultancy.",
      rest: "We teach languages and prepare you for official exams. We never sell PR promises, and we're not licensed to give immigration advice.",
    },
    {
      lead: "We're not a \"fluent in 30 days\" app.",
      rest: "Real proficiency takes months of live practice. We'll tell you the honest timeline for your level — even if it costs us the sale.",
    },
    {
      lead: "We're not a certificate mill.",
      rest: "Our completion certificates mark your progress, but we train you for the credentials that actually matter: DELF/DALF, DELE, Goethe, IELTS, TEF/TCF.",
    },
    {
      lead: "We're not for everyone.",
      rest: "If you want passive video lessons you can skip, we're the wrong school. Our classes are live, and your trainer will notice if you're quiet.",
    },
  ],
};

export const aboutFinalCta: FinalCtaContent = {
  heading: { before: "Come", accent: "talk", after: "to us — it's what we do best." },
  body: "One message: your goal, your level, an honest answer. Usually within minutes.",
  ctaLabel: "Chat with us on WhatsApp",
  waMessage: "Hi! I read your About page. I want to learn French — what should I do next?",
};
