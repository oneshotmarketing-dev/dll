// PLACEHOLDER — replace [bracketed] stats, teacher names/photos/credentials,
// batch dates & seat counts, and testimonials (incl. real photos) with the
// client's real, verifiable data before launch. Variant B homepage,
// **WhatsApp CTA edition** (ctaMode: 'whatsapp' in content/site.ts): no
// assessment offer; every CTA opens wa.me with a section-specific prefill.

import type {
  PromoBarContent,
  HeroContent,
  Stat,
  RecognitionContent,
  SectionHeadingContent,
  GoalSlide,
  Feature,
  RoadmapStep,
  CurriculumSlide,
  Teacher,
  Batch,
  Testimonial,
  FaqItem,
  FinalCtaContent,
  AccentHeading,
} from "./types";

export const homePromo: PromoBarContent = {
  id: "home-wa-2026-07",
  text: "New live batches for French, Spanish, German & IELTS start July 15 — seats are limited. Message us on WhatsApp to reserve yours.",
  mobileText: "New batches start July 15 — message us to reserve a seat.",
};

export const homeHero: HeroContent = {
  eyebrow: "Live classes · Certified trainers · Real conversation",
  heading: { before: "Speak a new", accent: "language", after: "with confidence." },
  subhead:
    "Live online classes in French, Spanish, German and IELTS English — taught the way languages are actually learned: small groups, certified trainers who explain in your language, and speaking from your very first class. Wherever you are in the world, world-class training comes to you.",
  picker: {
    label: "I want to learn",
    kind: "language",
    options: [
      { label: "French", value: "french" },
      { label: "Spanish", value: "spanish" },
      { label: "German", value: "german" },
      { label: "IELTS English", value: "ielts" },
    ],
  },
  ctaLabel: "Chat with us on WhatsApp",
  underCtaLine:
    "Real humans, real answers — batch dates, fees, and honest guidance on where to start, usually within minutes.",
  credibilityLine: "92% of our students reach their target level on the first attempt.",
  liveCard: { label: "Live: French Conversation Circle", participants: "6 participants" },
  image: {
    src: "/images/hero/home-hero.jpg",
    alt: "Professional taking a live online language class",
  },
};

// Prefill for the hero CTA is computed from the picker (see Hero.tsx), e.g.
// "Hi! I want to learn French. Can you share batch details and fees?"

export const homeStats: Stat[] = [
  { value: "4", label: "Languages taught live" },
  { value: "500+", label: "Students coached" },
  { value: "50+", label: "Live batches completed" },
  { value: "4.9/5", label: "Average rating" },
];

export const homeRecognition: RecognitionContent = {
  caption: "We prepare you for the certifications the world actually recognises.",
  logos: ["DELF/DALF", "DELE", "Goethe-Zertifikat", "IELTS", "TEF/TCF"],
};

export const homeGoalsHeading: SectionHeadingContent = {
  heading: { before: "Your partner in achieving your", accent: "goals" },
};

export const homeGoals: GoalSlide[] = [
  {
    title: "Advance your career",
    body: "Bilingual professionals get shortlisted first. Add a certified language to your CV and open doors in MNCs, client-facing roles, translation and beyond.",
    image: {
      src: "/images/goals/career.jpg",
      alt: "Bilingual professional in a client meeting",
    },
  },
  {
    title: "Study or work abroad",
    body: "Universities and employers don't ask if you \"know\" a language — they ask for proof. DELF, DELE, Goethe, IELTS: we train you for the exact exam, not just the language.",
    image: {
      src: "/images/goals/study-abroad.jpg",
      alt: "Student preparing to study abroad",
    },
  },
  {
    title: "Travel and connect",
    body: "Order confidently in Paris. Make friends in Berlin. Bargain in Barcelona. Real conversation, real culture — not textbook drills.",
    image: {
      src: "/images/goals/travel.jpg",
      alt: "Traveller connecting with locals",
    },
  },
];

export const homeFeaturesHeading: SectionHeadingContent = {
  heading: { before: "Why learners", accent: "trust", after: "us" },
};

export const homeFeatures: Feature[] = [
  {
    icon: "record_voice_over",
    title: "Live classes, real speaking",
    body: "The skill apps can't teach. Every single week you speak, get corrected by a real trainer, and speak again — because confidence is built out loud, not on mute.",
  },
  {
    icon: "workspace_premium",
    title: "A curriculum that leads somewhere",
    body: "No wandering lessons. Every level (A1 → C1) is mapped to an official certification — DELF/DALF, DELE, Goethe, IELTS — so your progress is provable, not just a feeling.",
  },
  {
    icon: "translate",
    title: "Trainers who explain in your language",
    body: "Our trainers learned these languages as second languages themselves. They explain grammar through English and Hindi, know exactly where learners stumble, and get you past it faster. Every class works fully in English too.",
  },
  {
    icon: "groups",
    title: "Small groups. Your trainer knows your name.",
    body: "Maximum 10 per batch. Your weak spots get personal attention, every class is recorded, and nobody gets left behind.",
  },
];

export const homeBigClaim: { heading: AccentHeading; footnote: string } = {
  heading: { before: "92% of our students reach their", accent: "target level", after: "on the first attempt." },
  footnote: "Dees Language Lounge student outcomes.",
};

export const homeRoadmapHeading: SectionHeadingContent = {
  heading: { before: "Your journey starts", accent: "here" },
};

export const homeRoadmap: RoadmapStep[] = [
  {
    number: 1,
    title: "Say hello on WhatsApp",
    body: "Tell us your goal and your current level — even if it's zero. A real person (not a bot) replies with honest guidance: which language track, which batch, what timeline is realistic. No forms, no pressure, no spam.",
    image: {
      src: "/images/roadmap/whatsapp.jpg",
      alt: "Student messaging Dees Language Lounge on WhatsApp",
    },
  },
  {
    number: 2,
    title: "Join your live batch",
    body: "Small groups, certified trainers, evening and weekend slots. You'll speak in your very first class — and every session is recorded, so life never knocks you off track.",
    image: {
      src: "/images/roadmap/live-class.jpg",
      alt: "Live online cohort class in session",
    },
  },
  {
    number: 3,
    title: "Certify your level",
    body: "Sit your DELF, DELE, Goethe or IELTS exam with graded mock tests behind you — and add a certificate the whole world recognises to your name.",
    image: {
      src: "/images/roadmap/certificate.jpg",
      alt: "Student receiving a language certificate",
    },
  },
];

export const homeCurriculumHeading: SectionHeadingContent = {
  eyebrow: "CEFR-ALIGNED, EXAM-READY",
  heading: { before: "Structured for", accent: "certification", after: ", level by level" },
};

// Rich carousel slides — one language each, no background image. "What you'll
// cover" is now pain-point pairs: a learner frustration + how we fix it.
export const homeCurriculumSlides: CurriculumSlide[] = [
  {
    flag: "🇫🇷",
    name: "French",
    levelsTrack: "Levels A1 → C1 · Tracks: DELF/DALF · TEF/TCF Canada",
    covers: [
      { pain: "I can read French but freeze when someone speaks", solution: "listening trained on native-speed audio, including one-play drills" },
      { pain: "I've studied for years and still can't hold a conversation", solution: "live speaking in every single class, from week one" },
      { pain: "Grammar rules never stick", solution: "explained through English/Hindi with patterns, not memorisation" },
      { pain: "Writing feels impossible under time pressure", solution: "exam-task templates, connectors, and graded feedback" },
      { pain: "I don't know if I'm actually improving", solution: "weekly mock orals scored against the real exam grid" },
    ],
    outcome: "A certification recognised by universities, employers and governments worldwide.",
    link: { label: "Preparing for Canada? See the TEF/TCF track →", href: "/french-canada" },
  },
  {
    flag: "🇪🇸",
    name: "Spanish",
    levelsTrack: "Levels A1 → C1 · Track: DELE",
    covers: [
      { pain: "Ser vs estar and the subjunctive break my brain", solution: "taught through patterns and real usage, demystified" },
      { pain: "I understand Spanish in class but not real people", solution: "listening across Latin American AND European accents" },
      { pain: "Apps got me vocabulary but no conversation", solution: "speaking-first method from your very first class" },
      { pain: "I want proof, not just progress", solution: "full DELE task training — reading, writing, listening, oral interview" },
      { pain: "I'm scared of speaking badly in front of others", solution: "small groups and weekly conversation circles built for mistakes" },
    ],
    outcome: "The DELE — the lifetime-valid Spanish diploma issued by Instituto Cervantes.",
  },
  {
    flag: "🇩🇪",
    name: "German",
    levelsTrack: "Levels A1 → C1 · Track: Goethe-Zertifikat",
    covers: [
      { pain: "Der/die/das and the cases feel random", solution: "cases and word order taught through patterns, not tables to memorise" },
      { pain: "German word order scrambles everything I say", solution: "sentence-building drills until structure becomes instinct" },
      { pain: "I know words but can't speak in real situations", solution: "practical conversation for work, study and daily life" },
      { pain: "Exam German feels different from textbook German", solution: "Goethe training for all four modules with graded mocks" },
      { pain: "I need German for my career, not small talk", solution: "vocabulary built for careers and university" },
    ],
    outcome: "The Goethe-Zertifikat — the German credential employers and universities ask for by name.",
  },
  {
    flag: "🇬🇧",
    name: "IELTS English",
    levelsTrack: "Formats: Academic & General Training · Goal: your target band",
    covers: [
      { pain: "My English is fine but my band score isn't", solution: "band-score strategy for all four modules — the exam is a technique, and we teach it" },
      { pain: "Writing Task 2 always drags me down", solution: "essay structures with examiner-style feedback on every draft" },
      { pain: "I panic in the speaking interview", solution: "cue-card drills and live mock interviews until it feels routine" },
      { pain: "I run out of time in reading", solution: "timed drills at real exam pace, every week" },
      { pain: "I keep making the same mistakes", solution: "error-pattern analysis so your band moves, not just your effort" },
    ],
    outcome: "The IELTS score your university, employer or visa application requires.",
  },
];

export const homeCurriculumClosing =
  "Not sure which level you are? Message us — we'll place you honestly, even if that means telling you to start smaller.";

// Prefill for the curriculum closing CTA.
export const homeCurriculumClosingWaMessage =
  "Hi! I'm not sure what level I am in French. Can you help?";

export const homeTeachersHeading: SectionHeadingContent = {
  heading: { before: "Learn from trainers who've", accent: "been there" },
};

export const homeTeachersIntro =
  "Every Dees trainer holds a verified international certification — and learned their language as a second language, just like you. They remember what confused them at A1. That's why their students move faster.";

// PLACEHOLDER — Stitch-invented profiles. Replace with Deepa's real trainers,
// photos (with permission) and real credentials before launch.
export const homeTeachers: Teacher[] = [
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

export const homeTeachersTrustLine =
  "Credentials verified. Ask to meet your trainer on WhatsApp before you enrol — we'll happily introduce you.";

export const homeBatchesHeading: SectionHeadingContent = {
  heading: { before: "Reserve your", accent: "seat" },
};

export const homeBatchesIntro =
  "Our next live French batches — TEF/TCF Canada exam track. Small groups; when a batch fills, it closes. We don't squeeze in extra seats.";

// PLACEHOLDER — real dates and real seat counts only. examName drives the
// whiteboard art on BatchCardV2.
export const homeBatches: Batch[] = [
  {
    title: "DELF Canada Prep — Batch 12",
    examName: "DELF Canada",
    image: { src: "/images/batches/tef-beginners.jpg", alt: "TEF Canada beginners cohort" },
    covered: "The complete DELF course — from your first words to exam-ready, covering all four skills: listening, reading, writing and speaking.",
    level: "A0 → CLB 7 full track",
    dates: "Starts July 15, 2026 · Ends Dec 15, 2026",
    schedule: "Mon — Fri",
    faculty: "[Name]",
    seatsLeft: "2 of 10 seats left",
    language: "french",
  },
  {
    title: "TEF Canada Prep — Batch 7",
    examName: "TEF Canada",
    image: { src: "/images/batches/tef-fasttrack.jpg", alt: "TEF Canada fast-track cohort" },
    covered: "The complete TEF Canada course — intensive exam strategy across all four skills: one-play listening drills, timed writing, and weekly graded mock orals.",
    level: "B1+ → exam-ready",
    dates: "Starts July 15, 2026 · Ends Dec 15, 2026",
    schedule: "Mon — Fri",
    faculty: "[Name]",
    seatsLeft: "3 of 10 seats left",
    featured: true,
    language: "french",
  },
  {
    title: "TCF Canada Prep — Batch 4",
    examName: "TCF Canada",
    image: { src: "/images/batches/tcf-prep.jpg", alt: "TCF Canada prep cohort" },
    covered: "The complete TCF Canada course — all four tasks with computer-based format practice and weekly graded mocks.",
    level: "A2+ → exam-ready",
    dates: "Starts July 15, 2026 · Ends Dec 15, 2026",
    schedule: "Mon — Fri",
    faculty: "[Name]",
    seatsLeft: "5 of 10 seats left",
    language: "french",
  },
];

export const homeBatchesFootnote =
  "Learning Spanish, German or IELTS instead? Message us — batches for all languages run every month.";
export const homeBatchesFootnoteWaMessage = "Hi! When does the next Spanish batch start?";

export const homeTestimonialsHeading: SectionHeadingContent = {
  heading: { before: "Rated 4.9/5 by our", accent: "learners" },
};

// TODO: Replace with real student testimonials — names used with consent.
// `name` = student name (bold top line); `role` = "credential · role" (gold line).
export const homeTestimonials: Testimonial[] = [
  {
    name: "Manpreet K.",
    role: "DELF B1 in 7 months · Marketing Manager",
    outcome: "DELF B1",
    quote: "The structured approach and live correction made all the difference. I walked into the exam already knowing what it would feel like.",
  },
  {
    name: "Sofia R.",
    role: "DELE A2 · Design Student",
    outcome: "DELE A2",
    quote: "Finally, classes about speaking, not filling workbooks. My trainer knew my weak spots by week two.",
  },
  {
    name: "Arjun T.",
    role: "IELTS 8.0 first attempt · Engineer",
    outcome: "IELTS 8.0",
    quote: "The mock tests and detailed feedback got me the band I needed for my visa. First attempt.",
  },
  {
    name: "Priya S.",
    role: "TCF Canada NCLC 7 · PGWP holder",
    outcome: "TCF NCLC 7",
    quote: "I needed exact scores in all four skills, not 'good French'. Every class was built around those thresholds.",
  },
  {
    name: "Daniel O.",
    role: "TEF Canada NCLC 7 in 10 months · Accountant",
    outcome: "TEF NCLC 7",
    quote: "Started from zero. The weekly plan told me exactly what to do between classes — that's what kept me going.",
  },
  {
    name: "Keerthana V.",
    role: "Goethe A2 · Nurse",
    outcome: "Goethe A2",
    quote: "Evening batches actually fit my shift schedule, and the trainer adjusted pace when I fell behind.",
  },
  {
    name: "Luis M.",
    role: "DELF B2 · Data Analyst",
    outcome: "DELF B2",
    quote: "Speaking practice every single class. My confidence in the oral exam came from repetition, not luck.",
  },
  {
    name: "Harjot D.",
    role: "TCF Canada NCLC 7 · Truck driver, Express Entry",
    outcome: "TCF NCLC 7",
    quote: "French draws were my only realistic path. Nine months later my CRS jumped 62 points.",
  },
];

export const homeFaqHeading: SectionHeadingContent = {
  heading: { before: "Frequently asked", accent: "questions" },
};

export const homeFaq: FaqItem[] = [
  {
    question: "How long does it take to learn a language?",
    answer:
      "Honestly: it depends on the language, your starting level and your weekly hours. As a guide, a focused learner reaches A2 (confident basics) in 3–5 months and B1 (independent conversation) in 8–12 months. What we'll never tell you is \"fluent in 30 days\" — nobody honest can. Message us your goal and we'll give you a straight answer for your case.",
  },
  {
    question: "I'm a complete beginner — is that okay?",
    answer:
      "It's our most common starting point. Beginner batches assume zero knowledge, and you'll speak your first full sentences in week one.",
  },
  {
    question: "Why live classes instead of free apps?",
    answer:
      "Apps are a fine supplement — but they can't correct your pronunciation, hold a conversation, or push you past the intermediate plateau. Speaking is a live skill. It needs a live class.",
  },
  {
    question: "Which language should I choose?",
    answer:
      "Depends on your goal: French and German open Europe and global careers; Spanish is the world's second-most spoken native language; IELTS is the gateway to English-speaking universities and jobs abroad. Tell us your goal on WhatsApp and we'll give you a straight recommendation — even if it's \"you don't need us yet.\"",
  },
  {
    question: "Do I get a certificate?",
    answer:
      "You'll receive our completion certificate at every level — and far more importantly, we prepare you for the official exams (DELF/DALF, DELE, Goethe, IELTS) that universities and employers worldwide actually recognise.",
  },
  {
    question: "I work full-time — how does scheduling work?",
    answer:
      "Batches run on evenings and weekends across timezones, every class is recorded, and groups are small enough that missing a week doesn't mean falling behind.",
  },
  {
    question: "Do I need to know Hindi to join?",
    answer:
      "Not at all. Classes run in English plus your target language; our trainers can explain through Hindi when it helps — but every batch is fully accessible in English.",
  },
  {
    question: "How do I enrol?",
    answer:
      "One WhatsApp message. Tell us your language and goal, we'll confirm your batch, fees and start date — and you're in. No forms, no call centres.",
  },
];

export const homeFinalCta: FinalCtaContent = {
  heading: { before: "Ready to", accent: "speak", after: "a new language?" },
  body: "One message is all it takes — your goal, your level, your batch, sorted on WhatsApp today.",
  ctaLabel: "Chat with us on WhatsApp",
  waMessage: "Hi! I'm ready to start. Help me pick my batch.",
};
