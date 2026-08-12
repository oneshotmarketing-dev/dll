// PLACEHOLDER — replace [bracketed] stats, teacher profiles, batch dates & seat
// counts, promo-bar/Stakes CRS numbers, and testimonials (incl. photos) with
// real, verifiable data before launch. Variant A (Canada-PR landing page),
// **WhatsApp CTA edition**: no assessment offer; every CTA opens wa.me with a
// section-specific prefill. Refresh CRS numbers every 2–3 weeks from IRCC.
// Never promise PR, an ITA, or a guaranteed timeline.

import type {
  PromoBarContent,
  HeroContent,
  Stat,
  StakesContent,
  ExamsContent,
  SectionHeadingContent,
  Feature,
  RoadmapStep,
  CurriculumCard,
  Teacher,
  Batch,
  Testimonial,
  FaqItem,
  FinalCtaContent,
  AccentHeading,
  GoalSlide,
} from "./types";

export const fcPromo: PromoBarContent = {
  id: "fc-wa-2026-07b",
  text: "🇨🇦 Latest French Express Entry draw: CRS 420 — the CEC draw needed 517. New TEF/TCF cohort starts July 15. Limited seats. Message us on WhatsApp.",
  mobileText: "🇨🇦 French draw CRS 420 vs CEC 517 — new cohort July 15. Message us.",
};

export const fcHero: HeroContent = {
  eyebrow: "Built for TEF Canada & TCF Canada",
  heading: { before: "Turn", accent: "French", after: "into Canada PR — faster than you think." },
  subhead:
    "Live online classes built around the TEF/TCF Canada exam — taught by certified trainers who explain French through English and Hindi, at times that fit Canadian evenings. Reach CLB 7 in all four skills and qualify for draws cutting off 100+ points below the CEC cut-off.",
  ctaLabel: "Chat with us on WhatsApp",
  ctaWaMessage:
    "Hi! I want to reach CLB 7 for the French draw. My current level is beginner. What's the realistic timeline?",
  underCtaLine:
    "Real humans, real answers — your level, your timeline, your batch, usually within minutes. No forms, no pressure.",
  credibilityLine: "92% of our students reach CLB 7 on their first attempt.",
  liveCard: { label: "Live: TEF Speaking Drill", participants: "6 participants" },
  image: {
    src: "/images/hero/fc-hero.jpg",
    alt: "Professional preparing for the TEF Canada exam online",
  },
};

export const fcStats: Stat[] = [
  { value: "500+", label: "Students coached to TEF/TCF" },
  { value: "92%", label: "Reach CLB 7 first attempt" },
  { value: "50+", label: "Live cohorts completed" },
  { value: "4.9/5", label: "Average student rating" },
];

export const fcStakes: StakesContent = {
  eyebrow: "THE MATH NOBODY TELLS YOU",
  heading: { before: "Two queues. One is", accent: "open." },
  general: { label: "CEC draw · CRS 517", value: "CRS 517", amount: 517 },
  french: { label: "French draw · CRS 420", value: "CRS 420", amount: 420 },
  caption:
    "Stuck around CRS 420–470? General all-program draws have been paused since 2024, and the CEC draw now sits at 517. Strong French (NCLC 7 in all four skills) unlocks the French-language draws — which last cut off at 420 — and adds up to 50 bilingual CRS points on top. It's the single biggest lever left on the board.",
  subline:
    "On a PGWP or work permit with an expiry date? Your window is real — and so is the plan. Message us your date and we'll tell you honestly what's achievable.",
  ctaLabel: "Message us your permit date",
  waMessage: "Hi! My permit expires in [month/year]. Is CLB 7 realistic for me in time?",
};

export const fcExams: ExamsContent = {
  eyebrow: "KNOW BEFORE YOU BOOK",
  heading: { before: "Only two exams", accent: "count", after: "for PR" },
  intro:
    "IRCC accepts exactly two French tests for Express Entry — and every year, people lose months and hundreds of dollars booking the wrong one. Here's the full picture:",
  cards: [
    {
      title: "TEF Canada",
      variant: "accept",
      bullets: [
        { label: "Format:", text: "computer-based, all four sections in one sitting" },
        { label: "Speaking:", text: "recorded on the day, scored later" },
        { label: "Results:", text: "in ~3–4 weeks" },
        { label: "Scoring:", text: "wide points band on writing & speaking — often the more forgiving option at the CLB 7 borderline" },
        { label: "We prepare you for this exam", emphasis: true },
      ],
    },
    {
      title: "TCF Canada",
      variant: "accept",
      bullets: [
        { label: "Format:", text: "computer or paper-based, depending on the centre" },
        { label: "Structure:", text: "four mandatory tests, ~2h47m total" },
        { label: "Scoring:", text: "writing & speaking graded 0–20 — a single point can separate CLB 6 from CLB 7" },
        { label: "What that means:", text: "exam strategy matters as much as your French" },
        { label: "We prepare you for this exam", emphasis: true },
      ],
    },
    {
      title: "What does NOT count",
      variant: "reject",
      bullets: [
        { label: "TEFAQ / TCF Québec", text: "only for Quebec's own immigration programs, not Express Entry" },
        { label: "DELF / DALF", text: "a prestigious lifetime diploma, but NOT accepted for Express Entry (even a DALF C1 holder must still sit TEF/TCF Canada)" },
        { label: 'Generic TEF / TCF "tout public"', text: "wrong version, not valid for immigration" },
      ],
    },
  ],
  closing:
    "Both accepted exams map to the same NCLC scale, cost roughly CAD $400–450, and results are valid for 2 years. Not sure which suits you? Message us — the right choice depends on your profile, and we'll tell you straight.",
  closingCtaLabel: "Ask which exam fits you",
  closingWaMessage: "Hi! Should I take TEF Canada or TCF Canada? My level is roughly A2.",
};

// Failure-traps grid (rebuilt) — reuses FeatureGrid.
export const fcFeaturesHeading: SectionHeadingContent = {
  eyebrow: "AND HOW WE TRAIN AGAINST IT",
  heading: { before: "The exam has", accent: "traps", after: ". We drill every one." },
};

export const fcFeatures: Feature[] = [
  {
    icon: "warning",
    title: "One weak skill sinks everything",
    body: "IRCC counts your lowest score. Every year, candidates clear three skills and land CLB 6 in one — and the whole profile drops below the line. We diagnose your weakest skill first and train it hardest.",
  },
  {
    icon: "hearing",
    title: "The audio plays ONCE",
    body: "TEF Canada's listening section gives you one play. No replays, no mercy. We train one-play listening from week one, so exam day sounds familiar, not terrifying.",
  },
  {
    icon: "record_voice_over",
    title: "Speaking is where points die",
    body: "The oral is a live, graded conversation — the one skill no app can teach. You'll do graded mock orals every single week until the real one feels routine.",
  },
  {
    icon: "translate",
    title: "Trainers who explain in your language",
    body: "Our trainers teach French through English and Hindi, and know exactly where speakers of Indian languages stumble — so grammar clicks in minutes, not months. Every class works fully in English too.",
  },
];

export const fcBigClaim: { heading: AccentHeading; footnote: string } = {
  heading: { before: "92% of our students hit", accent: "CLB 7", after: "on their first attempt." },
  footnote: "Dees Language Lounge student outcomes. Individual results depend on starting level and study time.",
};

export const fcRoadmapHeading: SectionHeadingContent = {
  heading: { before: "Your journey to", accent: "Canada PR" },
};

export const fcRoadmap: RoadmapStep[] = [
  {
    number: 1,
    title: "Say hello on WhatsApp",
    body: "Tell us your current level (even if it's zero), your permit timeline, and your target. A real person replies with an honest plan: which track, which batch, and whether your window is realistic. If it isn't, we'll say so.",
    image: {
      src: "/images/roadmap/fc-whatsapp.jpg",
      alt: "Student messaging Dees Language Lounge on WhatsApp",
    },
  },
  {
    number: 2,
    title: "Join your live cohort",
    body: "Small groups, certified trainers, classes scheduled for Canadian evenings and weekends (EST/PST-friendly). Weekly graded mock orals from month one, every class recorded.",
    image: {
      src: "/images/roadmap/fc-live-class.jpg",
      alt: "Live TEF/TCF cohort class",
    },
  },
  {
    number: 3,
    title: "Pass TEF/TCF and claim your points",
    body: "Sit the exam with graded mock tests behind you — then take your CLB 7 into the French draw and your 50-point bilingual bonus.",
    image: {
      src: "/images/roadmap/fc-certificate.jpg",
      alt: "Candidate passing the TEF Canada exam",
    },
  },
];

export const fcCurriculumHeading: SectionHeadingContent = {
  eyebrow: "EXAM-ALIGNED, NOT GENERIC",
  heading: { before: "Trained for the", accent: "exam", after: ", not just the language" },
};

export const fcCurriculumIntro =
  "Generic French gets you to B1. Exam-specific training gets you from B1 to CLB 7. Every module below maps to a scored section of the test.";

export const fcCurriculum: CurriculumCard[] = [
  {
    title: "TEF Canada track",
    lines: [
      "Listening: one-play drills from week one, native-speed audio, question-type strategy",
      "Reading: speed-reading emails, notices and articles under exam timing",
      "Writing: both timed tasks with templates, connectors, and graded feedback",
      "Speaking: the two live role-plays — ask, convince, argue — rehearsed in weekly mock orals",
    ],
    footnote: "Weekly graded full mocks with skill-by-skill CLB scoring",
  },
  {
    title: "TCF Canada track",
    lines: [
      "Listening & Reading: computer-based format practice at real question rhythm and timing",
      "Writing (3 tasks): structure and scoring drills — where a single point separates CLB 6 from CLB 7",
      "Speaking (3 tasks): examiner-style live practice, recorded and reviewed",
    ],
    footnote: "Weekly graded full mocks with skill-by-skill CLB scoring",
  },
];

export const fcCurriculumClosing =
  "Levels A0 → CLB 7 in structured stages. Message us your level and we'll tell you exactly which stage you start at.";

export const fcTeachersHeading: SectionHeadingContent = {
  heading: { before: "Learn from trainers who've", accent: "been there" },
};

export const fcTeachersIntro =
  "Certified French trainers (DELF/DALF/TEF credentials, C1/C2) who learned French as a second language themselves — and know the TEF/TCF scoring grids inside out. They explain through English and Hindi, and they've sat where you're sitting.";

// PLACEHOLDER — replace with Deepa's real trainers, photos and REAL credentials.
export const fcTeachers: Teacher[] = [
  { name: "Valérie D.", credential: "DALF C2", blurb: "8 yrs teaching · 200+ students to CLB 7 · English/Hindi" },
  { name: "Antoine L.", credential: "TEF CLB 9", blurb: "6 yrs teaching · Exam Specialist · English/French" },
  { name: "Sophie M.", credential: "TEF Evaluator", blurb: "10 yrs teaching · 300+ students to CLB 7 · English/French" },
  { name: "Julien B.", credential: "DALF C2", blurb: "5 yrs teaching · Mock Test Expert · English/Hindi" },
];

export const fcTeachersTrustLine =
  "Credentials verified. Ask to meet your trainer on WhatsApp before you enrol — we'll happily introduce you.";

export const fcBatchesHeading: SectionHeadingContent = {
  heading: { before: "Reserve your", accent: "seat" },
};

export const fcBatchesIntro =
  "Small live cohorts, Canadian-friendly hours. When a batch fills, it closes — we don't squeeze in extra seats.";

// PLACEHOLDER — real dates and real seat counts only. examName drives the
// whiteboard art on BatchCardV2.
export const fcBatches: Batch[] = [
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

export const fcBatchesFootnote =
  "None of these timings fit? Message us — new cohorts open every month, and we'll match you to the next one.";

export const fcTestimonialsHeading: SectionHeadingContent = {
  heading: { before: "Rated 4.9/5 by our", accent: "learners" },
};

// TODO: Replace with real student testimonials — names used with consent.
// `name` = student name (bold top line); `role` = "credential · role" (gold line).
// Scoped to French/Canada exams only: DELF, TEF Canada, TCF Canada.
export const fcTestimonials: Testimonial[] = [
  {
    name: "Harjot D.",
    role: "TCF Canada NCLC 7 · Truck driver, Express Entry",
    outcome: "TCF NCLC 7",
    quote: "French draws were my only realistic path. Nine months later my CRS jumped 62 points and I had my ITA.",
  },
  {
    name: "Ramanpreet S.",
    role: "TEF Canada CLB 7 · PGWP holder, Toronto",
    outcome: "TEF CLB 7",
    quote: "My permit had 14 months left and my CRS was stuck at 438. I cleared TEF with CLB 7 in all four skills and got my ITA in a French draw.",
  },
  {
    name: "Daniel O.",
    role: "TEF Canada NCLC 7 in 10 months · Accountant",
    outcome: "TEF NCLC 7",
    quote: "Started from zero. The one-play listening drills made exam day feel familiar — the real TEF audio plays once, and I was ready.",
  },
  {
    name: "Meera J.",
    role: "TCF Canada NCLC 7 · Nurse, Surrey",
    outcome: "TCF NCLC 7",
    quote: "Evening batches fit around my shifts, and the computer-based mock tests meant nothing on exam day surprised me.",
  },
  {
    name: "Aditya K.",
    role: "DELF B2 · Software Engineer",
    outcome: "DELF B2",
    quote: "Grammar finally clicked because my trainer explained it through Hindi. Speaking every class got me to DELF B2 with real confidence.",
  },
  {
    name: "Simran G.",
    role: "DELF B1 in 7 months · Student",
    outcome: "DELF B1",
    quote: "I wanted a solid French foundation before sitting the Canada exams. Reaching DELF B1 in seven months proved the method works.",
  },
];

export const fcFaqHeading: SectionHeadingContent = {
  heading: { before: "Frequently asked", accent: "questions" },
};

export const fcFaq: FaqItem[] = [
  {
    question: "Can I really learn enough French in time?",
    answer:
      "Honestly: it depends where you start. From zero, CLB 7 typically takes 10–14 months of consistent study; from A2/B1, often 4–6 months of exam-focused prep. Message us your level and your deadline — if your window is too tight, we'll tell you straight and show you the fastest realistic plan instead of selling you false hope.",
  },
  {
    question: "Isn't French too hard?",
    answer:
      "You don't need fluency — you need CLB 7, a specific, teachable target (roughly B2: structured opinions, clear writing, confident everyday speech). Thousands of first-generation learners clear it every year with exam-focused training.",
  },
  {
    question: "Why not just use free apps or YouTube?",
    answer:
      "Apps stall at B1 — and the exam is won in speaking and listening. The TEF audio plays once; the oral is a live graded conversation. No app corrects your speech or simulates that. Our live classes do exactly that, every week.",
  },
  {
    question: "TEF Canada or TCF Canada — which should I take?",
    answer:
      "Both count equally for IRCC. TEF's production sections are scored on a wider band (often kinder to borderline candidates); TCF's tight 0–20 scale rewards precise exam strategy. The right pick depends on your profile — message us and we'll recommend one, with reasons.",
  },
  {
    question: "What if Canada changes the French category?",
    answer:
      "Fair question. French draws are currently the only Express Entry category IRCC has publicly committed to growing, with francophone targets rising through 2028 — but policy can change, and we won't pretend otherwise. What doesn't change: CLB 7 French also earns up to 50 bilingual CRS points, opens Francophone Mobility work permits, and strengthens PNP options. The skill keeps its value across pathways.",
  },
  {
    question: "Is this legit, or another consultant scam?",
    answer:
      "We're a language school, not an immigration consultancy — we never sell PR promises and we're not licensed to give immigration advice. What we do: teach French, prepare you for TEF/TCF, and publish real outcomes. Named trainers, transparent fees, and you can meet your trainer before paying anything.",
  },
  {
    question: "I work full-time in Canada — how does scheduling work?",
    answer:
      "Cohorts run on Canadian evenings and weekends (EST/PST-friendly), every class is recorded, and batches are small enough that missing a week doesn't mean falling behind.",
  },
  {
    question: "Do I need to know Hindi to join?",
    answer:
      "Not at all. Classes run in English plus French; our trainers can explain through Hindi when it helps — many students love that — but every cohort is fully accessible in English.",
  },
  {
    question: "How do I enrol?",
    answer:
      "One WhatsApp message. Tell us your level, your timeline and your target exam — we'll confirm your batch, fees and start date. No forms, no call centres.",
  },
];

export const fcFinalCta: FinalCtaContent = {
  heading: { before: "Ready to turn", accent: "French", after: "into your PR shortcut?" },
  body: "One message: your level, your deadline, your plan — sorted on WhatsApp today.",
  ctaLabel: "Chat with us on WhatsApp",
  waMessage: "Hi! I'm ready to start French for Canada PR. Help me pick my batch.",
};

// /french-canada uses the ONE shared footer (content/site.ts). The only
// difference is this additive compliance note near the legal row, passed to the
// shared <Footer> as `complianceNote` — no separate footer variant.
export const fcComplianceNote =
  "Dees Language Lounge is a language school and does not provide immigration advice or representation. Draw cut-offs and CRS figures reflect published IRCC data at time of writing and change frequently.";

// "Why French pays off" — reuses the homepage GoalsCarouselV3 (image-top card,
// gold rule, serif title, body; embla carousel + dots on mobile). Answers
// "why French" before the page moves on to "why now". Hedged phrasing on the
// streams card is intentional — no PR/program guarantees.
export const fcBenefitsHeading: SectionHeadingContent = {
  heading: { before: "Why learn", accent: "French?" },
};

export const fcBenefits: GoalSlide[] = [
  {
    title: "The fastest lane to Canada PR",
    body: "French-language Express Entry draws cut off far below the CEC — and CLB 7 adds up to 50 bilingual points to your CRS. No other single skill moves your profile this much.",
    image: { src: "/images/benefits/fc-pr.jpg", alt: "Canadian permanent residence pathway" },
  },
  {
    title: "Bilingual jobs pay more",
    body: "Federal government roles, banks, airlines, healthcare — bilingual positions across Canada shortlist French speakers first, and many pay a bilingualism premium.",
    image: { src: "/images/benefits/fc-jobs.jpg", alt: "Bilingual professional at work in Canada" },
  },
  {
    title: "More doors than one draw",
    body: "Francophone streams in Ontario, New Brunswick and beyond favour French speakers too. If policy shifts, your French still counts — the skill outlives any single program.",
    image: { src: "/images/benefits/fc-streams.jpg", alt: "Francophone community street in Canada" },
  },
  {
    title: "Settle in, not just land",
    body: "From Montréal cafés to francophone communities across Canada, French turns arrival into belonging — school runs, small talk, neighbours, life.",
    image: { src: "/images/benefits/fc-settle.jpg", alt: "Montréal café street scene" },
  },
  {
    title: "A skill the whole world recognises",
    body: "300+ million speakers across five continents. Whatever happens with immigration policy, certified French stays on your CV forever.",
    image: { src: "/images/benefits/fc-global.jpg", alt: "Global map of French-speaking regions" },
  },
];
