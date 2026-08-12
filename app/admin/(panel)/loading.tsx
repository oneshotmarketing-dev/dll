import { AdminDashboardSkeleton } from "@/components/portal/Skeletons";

// /admin dashboard skeleton. List pages (students, batches, etc.) override this
// with their own table-shaped loading.tsx.
export default function Loading() {
  return <AdminDashboardSkeleton />;
}
