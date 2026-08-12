import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { ProfileView } from "@/components/portal/ProfileView";

interface Enr {
  batch: { title: string; tutor: { full_name: string | null } | null } | null;
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const supabase = createClient();

  const [{ data: prof }, { data: enr }] = await Promise.all([
    supabase.from("profiles").select("phone").eq("id", user.id).single(),
    supabase.from("enrollments").select("batch:batches(title,tutor:profiles(full_name))").eq("status", "active"),
  ]);

  const batchLine = ((enr ?? []) as unknown as Enr[])
    .map((e) =>
      [e.batch?.title, e.batch?.tutor?.full_name ? `Trainer: ${e.batch.tutor.full_name}` : null]
        .filter(Boolean)
        .join(" · "),
    )
    .filter(Boolean)
    .join("   |   ");

  return (
    <ProfileView
      studentId={user.id}
      fullName={user.fullName}
      email={user.email}
      phone={(prof as { phone: string | null } | null)?.phone ?? null}
      timezone={user.timezone}
      avatarUrl={user.avatarUrl}
      batchLine={batchLine}
    />
  );
}
