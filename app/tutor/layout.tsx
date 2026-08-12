import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/portal";
import { PortalShell, type NavItem } from "@/components/portal/PortalShell";

const TUTOR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/tutor", icon: "dashboard" },
  { label: "My Batches", href: "/tutor/batches", icon: "groups" },
];

// Tutor-only shell. Non-tutors are bounced to their own area.
export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/set-password");
  if (user.role === "admin") redirect("/admin");
  if (user.role !== "tutor") redirect("/student");

  return (
    <PortalShell user={user} nav={TUTOR_NAV} homeHref="/tutor">
      {children}
    </PortalShell>
  );
}
