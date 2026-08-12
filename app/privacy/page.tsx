import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPage";
import { buildMetadata } from "@/content/seo";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPageView page={legalPages.privacy} />;
}
