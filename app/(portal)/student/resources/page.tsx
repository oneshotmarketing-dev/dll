import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { ResourcesView, type ResGroup } from "@/components/portal/ResourcesView";
import { fullDate } from "@/lib/datetime";

interface Res {
  id: string;
  type: string;
  title: string;
  description: string | null;
  duration: number | null;
  session: {
    id: string;
    title: string;
    starts_at: string;
    status: string;
    batch: { title: string; course: { title: string } | null } | null;
  } | null;
}

export default async function ResourcesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const tz = user.timezone || "UTC";
  const supabase = createClient();

  const [resRes, viewRes] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id,type,title,description,duration,created_at,session:sessions!inner(id,title,starts_at,status,batch:batches(title,course:courses(title)))",
      )
      .order("created_at", { ascending: false }),
    supabase.from("resource_views").select("resource_id"),
  ]);

  const resources = (resRes.data ?? []) as unknown as Res[];
  const viewed = new Set((viewRes.data ?? []).map((v: { resource_id: string }) => v.resource_id));

  // Group by session, newest session first.
  const map = new Map<string, ResGroup & { startsAt: string }>();
  for (const r of resources) {
    if (!r.session || r.session.status === "cancelled") continue;
    const g =
      map.get(r.session.id) ??
      ({
        sessionId: r.session.id,
        sessionTitle: r.session.title,
        dateLabel: fullDate(r.session.starts_at, tz),
        startsAt: r.session.starts_at,
        items: [],
      } as ResGroup & { startsAt: string });
    g.items.push({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      duration: r.duration,
      courseTitle: r.session.batch?.course?.title ?? "",
      isNew: !viewed.has(r.id),
    });
    map.set(r.session.id, g);
  }

  const groups = [...map.values()].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  const courses = [...new Set(resources.map((r) => r.session?.batch?.course?.title).filter(Boolean))] as string[];

  return <ResourcesView groups={groups} courses={courses} studentId={user.id} subtitle={courses[0] ?? ""} />;
}
