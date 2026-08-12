import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/portal";

// Post-login landing. Routes by role. Phase 0 only ships the student portal, so
// everyone lands there for now; tutor/admin branches are added with their portals.
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/set-password");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "tutor") redirect("/tutor");
  redirect("/student");
}
