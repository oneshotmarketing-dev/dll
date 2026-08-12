import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { StatsBar } from "@/components/sections/StatsBar";
import { GoalsCarouselV3 } from "@/components/sections/GoalsCarouselV3";
import { StakesSection } from "@/components/sections/StakesSection";
import { ExamsSection } from "@/components/sections/ExamsSection";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { BigClaim } from "@/components/sections/BigClaim";
import { ProficiencyLevels } from "@/components/sections/ProficiencyLevels";
import { Roadmap } from "@/components/sections/Roadmap";
import { Curriculum } from "@/components/sections/Curriculum";
// Trainers section removed — curriculum flows straight into "Reserve your seat".
// import { Teachers } from "@/components/sections/Teachers";
import { BatchesV2 } from "@/components/sections/BatchesV2";
import { TestimonialsV2 } from "@/components/sections/TestimonialsV2";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTABand } from "@/components/sections/FinalCTABand";
import { CourseJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, pageSeo } from "@/content/seo";
import {
  fcHero,
  fcStats,
  fcBenefitsHeading,
  fcBenefits,
  fcStakes,
  fcExams,
  fcFeaturesHeading,
  fcFeatures,
  fcBigClaim,
  fcRoadmapHeading,
  fcRoadmap,
  fcCurriculumHeading,
  fcCurriculumIntro,
  fcCurriculum,
  fcCurriculumClosing,
  // Trainer copy — unused since the trainers section was removed.
  // fcTeachersHeading,
  // fcTeachersIntro,
  // fcTeachers,
  // fcTeachersTrustLine,
  fcBatchesHeading,
  fcBatchesIntro,
  fcBatches,
  fcBatchesFootnote,
  fcTestimonialsHeading,
  fcTestimonials,
  fcFaqHeading,
  fcFaq,
  fcFinalCta,
} from "@/content/frenchCanada";

export const metadata: Metadata = buildMetadata("frenchCanada");

const CTX = "French (Canada PR)";

export default function FrenchCanadaPage() {
  return (
    <main>
      <CourseJsonLd
        name="TEF/TCF Canada Preparation — Live French Classes"
        description={pageSeo.frenchCanada.description}
        path="/french-canada"
      />
      <FaqJsonLd items={fcFaq} />

      <Hero content={fcHero} contextLabel={CTX} />
      <StatsBar stats={fcStats} />
      <GoalsCarouselV3 heading={fcBenefitsHeading} slides={fcBenefits} />
      <StakesSection content={fcStakes} />
      <ProficiencyLevels />
      <ExamsSection content={fcExams} />
      <FeatureGrid heading={fcFeaturesHeading} features={fcFeatures} />
      <BigClaim heading={fcBigClaim.heading} footnote={fcBigClaim.footnote} />
      <Roadmap heading={fcRoadmapHeading} steps={fcRoadmap} />
      <Curriculum
        heading={fcCurriculumHeading}
        intro={fcCurriculumIntro}
        cards={fcCurriculum}
        closing={fcCurriculumClosing}
        variant="detail"
      />
      {/* Trainers section ("Learn from trainers who've been there") removed —
          the curriculum now flows straight into "Reserve your seat".
      <Teachers
        heading={fcTeachersHeading}
        intro={fcTeachersIntro}
        teachers={fcTeachers}
        trustLine={fcTeachersTrustLine}
      />
      */}
      <BatchesV2
        heading={fcBatchesHeading}
        intro={fcBatchesIntro}
        batches={fcBatches}
        ctaLabel="Reserve on WhatsApp"
        footnote={fcBatchesFootnote}
      />
      <TestimonialsV2 heading={fcTestimonialsHeading} testimonials={fcTestimonials} />
      <FAQ heading={fcFaqHeading} items={fcFaq} />
      <FinalCTABand content={fcFinalCta} context={CTX} />
    </main>
  );
}
