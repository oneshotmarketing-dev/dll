import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";
import { AddUserButton } from "@/components/admin/AddUserButton";
import { UsersTable, type UserRow } from "@/components/admin/UsersTable";

export default async function TutorsPage() {
  const supabase = createClient();
  const svc = getServiceClient();
  const [{ data }, authList] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,phone,status,must_change_password")
      .eq("role", "tutor")
      .order("full_name"),
    svc ? svc.auth.admin.listUsers({ page: 1, perPage: 1000 }) : Promise.resolve(null),
  ]);

  const lastLoginById = new Map(
    (authList?.data?.users ?? []).map((u) => [u.id, u.last_sign_in_at ?? null]),
  );
  const rows: UserRow[] = ((data ?? []) as UserRow[]).map((r) => ({
    ...r,
    last_sign_in_at: lastLoginById.get(r.id) ?? null,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Tutors</h1>
          <p className="mt-1 text-muted">Trainers who lead your batches.</p>
        </div>
        <AddUserButton role="tutor" label="Add tutor" />
      </div>
      <UsersTable rows={rows} emptyText="No tutors yet — add your first trainer." />
    </div>
  );
}
