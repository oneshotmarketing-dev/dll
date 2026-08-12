import { TableSkeleton } from "@/components/portal/Skeletons";

// Tutor batches is now a table (like admin), with no create button.
export default function Loading() {
  return <TableSkeleton withButton={false} />;
}
