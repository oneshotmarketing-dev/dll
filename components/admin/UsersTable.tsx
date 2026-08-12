import { UserRowActions } from "@/components/admin/UserRowActions";

export interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  must_change_password?: boolean;
  last_sign_in_at?: string | null;
  course_name?: string | null;
  batch_name?: string | null;
  // Current active enrolment (for the Edit dialog's Course → Batch cascade).
  course_id?: string | null;
  batch_id?: string | null;
}

export interface BatchOption {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
}

function StatusPill({ status }: { status: string }) {
  const active = status === "active";
  const color = active ? "#22c55e" : "#8A93A3";
  return (
    <span className="rounded-pill px-2.5 py-0.5 text-[11px] font-bold capitalize" style={{ color, backgroundColor: `${color}1a` }}>
      {status}
    </span>
  );
}

function lastLogin(iso: string | null | undefined): string {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function UsersTable({
  rows,
  emptyText,
  showBatch = false,
  batches = [],
}: {
  rows: UserRow[];
  emptyText: string;
  showBatch?: boolean;
  batches?: BatchOption[];
}) {
  if (!rows.length) {
    return <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">{emptyText}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted">
            <th className="px-4 py-3 font-bold">Name</th>
            <th className="px-4 py-3 font-bold">Email</th>
            <th className="px-4 py-3 font-bold">WhatsApp</th>
            {showBatch ? <th className="px-4 py-3 font-bold">Course</th> : null}
            {showBatch ? <th className="px-4 py-3 font-bold">Batch</th> : null}
            <th className="px-4 py-3 font-bold">Last login</th>
            <th className="px-4 py-3 font-bold">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const muted = r.status === "inactive";
            return (
              <tr key={r.id} className={`border-b border-hairline/50 last:border-0 ${muted ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-ink">{r.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted">{r.email || "—"}</td>
                <td className="px-4 py-3 text-muted">{r.phone || "—"}</td>
                {showBatch ? <td className="px-4 py-3 text-muted">{r.course_name || "—"}</td> : null}
                {showBatch ? <td className="px-4 py-3 text-muted">{r.batch_name || "—"}</td> : null}
                <td className="px-4 py-3 text-muted">{lastLogin(r.last_sign_in_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill status={r.status} />
                    {r.must_change_password ? (
                      <span className="rounded-pill px-2 py-0.5 text-[10px] font-bold text-gold" style={{ backgroundColor: "#C5A36B1a" }} title="Must change password on next login">
                        Temp pw
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3"><UserRowActions row={r} batches={batches} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
