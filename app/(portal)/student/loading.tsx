import { DashboardSkeleton } from "@/components/portal/Skeletons";

// /student dashboard skeleton. Nested routes (recordings, live-classes, etc.)
// override this with their own loading.tsx shaped like that page.
export default function Loading() {
  return <DashboardSkeleton />;
}
