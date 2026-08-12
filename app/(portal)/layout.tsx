import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/portal";
import { PortalShell, type NavItem } from "@/components/portal/PortalShell";

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: "dashboard" },
  { label: "Live Classes", href: "/student/live-classes", icon: "live_tv" },
  { label: "Recordings", href: "/student/recordings", icon: "video_library" },
  { label: "Resources", href: "/student/resources", icon: "folder_open" },
];

// Authed shell for the student portal. Middleware already blocks anonymous
// users; here we also force the first-login password change and keep non-students
// out — tutors/admins hitting /student are bounced to their own area.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/set-password");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "tutor") redirect("/tutor");

  return (
    <PortalShell user={user} nav={STUDENT_NAV} homeHref="/student" profileHref="/student/profile">
      {children}
    </PortalShell>
  );
}
