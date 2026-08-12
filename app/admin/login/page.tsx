import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/portal";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

// Public admin sign-in. Lives outside the (panel) group so it doesn't inherit
// the admin shell/guard. An already-authenticated admin skips straight in.
export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user?.role === "admin" && !user.mustChangePassword) redirect("/admin");
  return <AdminLoginForm />;
}
