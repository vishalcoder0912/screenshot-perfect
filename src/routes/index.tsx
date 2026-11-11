import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useErp, STAGES, TASK_COLS, ROLES } from "@/lib/erp-store";
import { PageHead, Stat } from "@/components/erp/Shell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard · CareerVeda Placement ERP" },
    { name: "description", content: "Live overview of candidates, companies, calls, interviews and team tasks." },
    { property: "og:title", content: "Dashboard · CareerVeda Placement ERP" },
    { property: "og:description", content: "Live overview of candidates, companies, calls, interviews and team tasks." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { s } = useErp();
  const c = s.candidates;
  const calls = c.flatMap((x) => x.calls);
  const role = ROLES.find((r) => r.id === s.role)!;
  const pipeline = STAGES.map((st) => ({ name: st.replace("Tech Round ", "T"), count: c.filter((x) => x.stage === st && !x.result).length }));
  const myTasks = s.tasks.filter((t) => s.role === "admin" || t.team === s.role);
  const stats: [string, number | string, "primary" | "accent" | "success" | "destructive"][] = {
    admin: [["Candidates", c.length, "primary"], ["Enrolled learners", c.filter((x) => x.status === "Enrolled").length, "accent"], ["Companies", s.companies.length, "primary"], ["HR contacts", s.companies.reduce((a, x) => a + x.hrs.length, 0), "accent"], ["With backend", c.filter((x) => x.owner === "backend").length, "primary"], ["With HR", c.filter((x) => x.owner === "hr").length, "success"], ["Calls logged", calls.length, "accent"], ["Open tasks", s.tasks.filter((t) => t.col !== "Done").length, "destructive"]],
    placement: [["Candidates", c.length, "primary"], ["Unassigned", c.filter((x) => x.owner === "placement").length, "accent"], ["Open positions", s.companies.reduce((a, x) => a + x.openings.reduce((b, o) => b + o.positions, 0), 0), "primary"], ["Selected", c.filter((x) => x.result === "Selected").length, "success"]],
    backend: [["My queue", c.filter((x) => x.owner === "backend").length, "primary"], ["Calls today", calls.length, "accent"], ["Connected", calls.filter((x) => x.status !== "DNP" && x.status !== "Not Called").length, "success"], ["DNP", calls.filter((x) => x.status === "DNP").length, "destructive"]],
    hr: [["In pipeline", c.filter((x) => x.owner === "hr" && !x.result).length, "primary"], ["Awaiting review", c.filter((x) => x.stage === "Received").length, "accent"], ["Selected", c.filter((x) => x.result === "Selected").length, "success"], ["Rejected", c.filter((x) => x.result === "Rejected").length, "destructive"]],
    designer: TASK_COLS.map((col, i): [string, number, "primary" | "accent" | "success" | "destructive"] => [col, myTasks.filter((t) => t.col === col).length, (["primary", "accent", "destructive", "success"] as const)[i]!]),
    developer: TASK_COLS.map((col, i): [string, number, "primary" | "accent" | "success" | "destructive"] => [col, myTasks.filter((t) => t.col === col).length, (["primary", "accent", "destructive", "success"] as const)[i]!]),
  }[s.role];

  return (
    <>
      <PageHead title={`Good day, ${role.person.split(" ")[0]}`} sub={`${role.label} workspace`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([l, v, t]) => <Stat key={l} label={l} value={v} tone={t} />)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          {s.role === "designer" || s.role === "developer" ? (
            <>
              <h2 className="mb-3 font-semibold">My tasks</h2>
              <ul className="divide-y">{myTasks.filter((t) => t.col !== "Done").map((t) => (
                <li key={t.id} className="flex justify-between py-2 text-sm"><span>{t.title}</span><span className="text-muted-foreground">{t.col}</span></li>))}</ul>
              <Link to="/tasks" className="mt-3 inline-block text-sm font-medium text-primary">Open task board →</Link>
            </>
          ) : (
            <>
              <h2 className="mb-3 font-semibold">Interview pipeline</h2>
              <div className="h-64"><ResponsiveContainer><BarChart data={pipeline}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Recent activity</h2>
          <ul className="space-y-3 text-sm">{s.activity.slice(0, 10).map((a, i) => (
            <li key={i}><span className="font-medium">{a.who}</span> {a.text}<div className="text-xs text-muted-foreground">{a.at}</div></li>))}</ul>
        </div>
      </div>
    </>
  );
}
