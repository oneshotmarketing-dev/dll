import { PortalSkeleton } from "@/components/portal/PortalSkeleton";

// Shown instantly inside the student PortalShell while a page's server render /
// data fetch (or cold start) completes — so navigation never feels frozen.
export default function Loading() {
  return <PortalSkeleton />;
}
