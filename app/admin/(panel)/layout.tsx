import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/portal";
import { PortalShell, type NavItem } from "@/components/portal/PortalShell";

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Students", href: "/admin/students", icon: "school" },
  { label: "Tutors", href: "/admin/tutors", icon: "co_present" },
  { label: "Courses", href: "/admin/courses", icon: "menu_book" },
  { label: "Batches", href: "/admin/batches", icon: "groups" },
];

// Admin-only shell. Non-admins are bounced to their own area.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/set-password");
  if (user.role !== "admin") redirect("/student");

  return (
    <PortalShell user={user} nav={ADMIN_NAV} homeHref="/admin">
      {children}
    </PortalShell>
  );
}
