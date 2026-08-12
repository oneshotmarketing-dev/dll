// Shared content types. Every page's copy is a typed object built from these,
// so the eventual real-data swap is data-only and never touches components.

export type LanguageKey = "french" | "spanish" | "german" | "ielts";
export type GoalKey = "canada-pr" | "study-abroad" | "career" | "travel";

/** A headline split so exactly one accent word renders in glowing serif. */
export interface AccentHeading {
  /** Text before the accent word. */
  before: string;
  /** The single emphasized word/phrase (Libre Caslon italic, gold glow). */
  accent: string;
  /** Text after the accent word. */
  after?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Eyebrow {
  text: string;
}

export interface PromoBarContent {
  id: string; // bump to re-show after a dismissal
  text: string;
  mobileText?: string;
}

export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavDropdownItem[];
}

export interface HeroPickerOption {
  label: string;
  value: LanguageKey | GoalKey;
}

export interface HeroContent {
  eyebrow?: string;
  heading: AccentHeading;
  /** When true the whole heading renders in serif (matches a specific export). */
  headingSerifWhole?: boolean;
  subhead: string;
  picker?: {
    label: string;
    kind: "language" | "goal";
    options: HeroPickerOption[];
  };
  ctaLabel: string;
  /** Static WhatsApp prefill when the hero has no picker (falls back to picker-derived). */
  ctaWaMessage?: string;
  underCtaLine?: string;
  credibilityLine?: string;
  liveCard?: { label: string; participants: string };
  image: { src: string; alt: string };
}

export interface RecognitionContent {
  caption: string;
  logos: string[];
}

export interface GoalSlide {
  title: string;
  body: string;
  image?: { src: string; alt: string };
  /** CSS object-position for the square crop (GoalsCarouselV3). Defaults to
   * "center top" so upper-half subjects stay framed; override per image
   * (e.g. "center 30%") if a face sits too high. */
  imagePosition?: string;
}

export interface Feature {
  icon: string; // Material Symbols name
  title: string;
  body: string;
  featured?: boolean;
}

export interface RoadmapStep {
  number: number;
  title: string;
  body: string;
  image?: { src: string; alt: string };
}

export interface CurriculumCard {
  title: string;
  flag?: string;
  lines: string[];
  footnote?: string;
}

/** One "What you'll cover" row: a learner pain phrase + how we solve it. */
export interface CurriculumCover {
  pain: string;
  solution: string;
}

/** Rich curriculum slide for the carousel (one language per slide, no image). */
export interface CurriculumSlide {
  flag: string;
  /** Language name — rendered as the gold serif accent in the slide title. */
  name: string;
  /** "Levels / Track" line, shown in gold. */
  levelsTrack: string;
  /** "What you'll cover" pain-point pairs. */
  covers: CurriculumCover[];
  /** "Outcome" line. */
  outcome: string;
  /** Optional inline text link (e.g. French → /french-canada). */
  link?: { label: string; href: string };
}

export interface Teacher {
  name: string;
  credential: string;
  blurb: string;
  image?: { src: string; alt: string };
}

export interface Batch {
  title: string;
  covered?: string;
  dates: string;
  schedule: string;
  level?: string;
  faculty: string;
  seatsLeft: string;
  featured?: boolean;
  language?: LanguageKey;
  /** Exam name shown on the BatchCardV2 whiteboard art (e.g. "TEF Canada").
   * Used only as the fallback illustration when `image` is not set. */
  examName?: string;
  /** Optional photo header (BatchCardV2). When set, a real 2:1 photo replaces
   * the SVG classroom art. `position` sets CSS object-position (default center). */
  image?: { src: string; alt: string; position?: string };
}

export interface Testimonial {
  name: string;
  role: string;
  outcome: string;
  quote: string;
  /** Square portrait photo (TestimonialsV2). */
  image?: { src: string; alt: string };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionHeadingContent {
  eyebrow?: string;
  heading: AccentHeading;
}

/** "The Stakes" comparison — one locked (general) bar vs one glowing (French) bar. */
export interface StakesBar {
  label: string;
  value: string; // e.g. "514+" — also drives the bar width
  amount: number; // numeric CRS for proportional bar width
}
export interface StakesContent {
  eyebrow: string;
  heading: AccentHeading;
  general: StakesBar; // muted / locked (periwinkle)
  french: StakesBar; // gold / open
  caption: string;
  subline: string;
  ctaLabel: string;
  waMessage?: string;
}

/** One row in an exam card: a bold white label + muted remainder. */
export interface ExamBullet {
  /** Bold white lead-in (e.g. "Format:"; for the reject card, the term). */
  label: string;
  /** Muted remainder. Omit for the emphasized closing bullet. */
  text?: string;
  /** The emphasized "We prepare you for this exam" closing line. */
  emphasis?: boolean;
}

/** "The Exams" card — two accepted (check), one not-accepted (cross). */
export interface ExamCard {
  title: string;
  variant: "accept" | "reject";
  bullets: ExamBullet[];
}
export interface ExamsContent {
  eyebrow: string;
  heading: AccentHeading;
  intro: string;
  cards: ExamCard[];
  closing: string;
  closingCtaLabel: string;
  closingWaMessage?: string;
}

export interface FinalCtaContent {
  heading: AccentHeading;
  body?: string;
  ctaLabel: string;
  /** Optional verbatim WhatsApp prefill (whatsapp CTA mode). */
  waMessage?: string;
}

// ── About page ────────────────────────────────────────────────
export interface AboutHeroContent {
  eyebrow: string;
  heading: AccentHeading;
  subhead: string;
  ctaLabel: string;
  ctaWaMessage?: string;
}
export interface AboutStoryContent {
  eyebrow: string;
  heading: AccentHeading;
  paragraphs: string[];
  /** The key sentence pulled out of the prose as a styled inset line. */
  rule?: AccentHeading;
}
export interface AboutFounderContent {
  eyebrow: string;
  name: string;
  role: string;
  paragraphs: string[];
  pullQuote: string;
  image: { src: string; alt: string };
}
export interface AboutHonestyPoint {
  lead: string;
  rest: string;
}
export interface AboutHonestyContent {
  eyebrow: string;
  heading: AccentHeading;
  intro: string;
  points: AboutHonestyPoint[];
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterContent {
  blurb: string;
  columns: FooterColumn[];
  legal: string;
}
