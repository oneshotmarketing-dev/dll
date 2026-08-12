import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { LanguageDestinations } from "@/components/sections/LanguageDestinations";
import { StatsBar } from "@/components/sections/StatsBar";
import { RecognitionStrip } from "@/components/sections/RecognitionStrip";
import { GoalsCarouselV3 } from "@/components/sections/GoalsCarouselV3";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { BigClaim } from "@/components/sections/BigClaim";
import { Roadmap } from "@/components/sections/Roadmap";
import { CurriculumCarouselV2 } from "@/components/sections/CurriculumCarouselV2";
// Trainers section removed — level-check strip flows straight into "Reserve your seat".
// import { Teachers } from "@/components/sections/Teachers";
import { BatchesV2 } from "@/components/sections/BatchesV2";
import { TestimonialsV2 } from "@/components/sections/TestimonialsV2";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTABand } from "@/components/sections/FinalCTABand";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/content/seo";
import {
  homeHero,
  homeStats,
  homeRecognition,
  homeGoalsHeading,
  homeGoals,
  homeFeaturesHeading,
  homeFeatures,
  homeBigClaim,
  homeRoadmapHeading,
  homeRoadmap,
  homeCurriculumHeading,
  homeCurriculumSlides,
  homeCurriculumClosing,
  homeCurriculumClosingWaMessage,
  // Trainer copy — unused since the trainers section was removed.
  // homeTeachersHeading,
  // homeTeachersIntro,
  // homeTeachers,
  // homeTeachersTrustLine,
  homeBatchesHeading,
  homeBatchesIntro,
  homeBatches,
  homeBatchesFootnote,
  homeTestimonialsHeading,
  homeTestimonials,
  homeFaqHeading,
  homeFaq,
  homeFinalCta,
} from "@/content/home";

export const metadata: Metadata = buildMetadata("home");

const CTX = "a new language";

// Variant B — the multi-language school homepage, WhatsApp CTA edition.
// ZERO Canada-PR/immigration messaging in section copy (TEF/TCF exam names on
// batch cards are factual exam labels only).
export default function HomePage() {
  return (
    <main>
      <FaqJsonLd items={homeFaq} />

      <Hero content={homeHero} contextLabel={CTX} />
      <LanguageDestinations />
      <StatsBar stats={homeStats} />
      <RecognitionStrip content={homeRecognition} />
      <GoalsCarouselV3 heading={homeGoalsHeading} slides={homeGoals} />
      <FeatureGrid heading={homeFeaturesHeading} features={homeFeatures} />
      <BigClaim heading={homeBigClaim.heading} footnote={homeBigClaim.footnote} />
      <Roadmap heading={homeRoadmapHeading} steps={homeRoadmap} />
      <CurriculumCarouselV2
        heading={homeCurriculumHeading}
        slides={homeCurriculumSlides}
        closing={homeCurriculumClosing}
        closingCtaLabel="Message us about your level"
        closingWaMessage={homeCurriculumClosingWaMessage}
      />
      {/* Trainers section ("Learn from trainers who've been there") removed —
          the level-check WhatsApp strip now flows straight into "Reserve your seat".
      <Teachers
        heading={homeTeachersHeading}
        intro={homeTeachersIntro}
        teachers={homeTeachers}
        trustLine={homeTeachersTrustLine}
      />
      */}
      <BatchesV2
        heading={homeBatchesHeading}
        intro={homeBatchesIntro}
        batches={homeBatches}
        ctaLabel="Reserve on WhatsApp"
        footnote={homeBatchesFootnote}
      />
      <TestimonialsV2 heading={homeTestimonialsHeading} testimonials={homeTestimonials} />
      <FAQ heading={homeFaqHeading} items={homeFaq} />
      <FinalCTABand content={homeFinalCta} context={CTX} />
    </main>
  );
}
