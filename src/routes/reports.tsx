import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp, ROLES } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "EOD Reports · CareerVeda ERP" }, { name: "description", content: "Daily end-of-day reports for every team." },
    { property: "og:title", content: "EOD Reports · CareerVeda ERP" }, { property: "og:description", content: "Daily end-of-day reports for every team." },
  ] }),
  component: Reports,
});

const FIELDS: Record<string, string[]> = {
  backend: ["Companies researched", "HR contacts added", "HRs contacted", "Jobs collected", "Colleges contacted", "Follow-ups completed", "Responses received"],
  hr: ["CV reviews", "LinkedIn reviews", "Mock interviews", "Tech rounds"],
  placement: ["Requirements added", "Candidates assigned"],
  designer: ["Designs delivered", "Revisions"], developer: ["Tasks shipped", "Bugs fixed"], admin: [],
};

function Reports() {
  const { s, d } = useErp();
  const calls = s.candidates.flatMap((c) => c.calls);
  const auto = s.role === "backend" ? { "Total calls": calls.length, DNP: calls.filter((c) => c.status === "DNP").length, Connected: calls.filter((c) => c.status !== "DNP").length } : {};
  const [m, setM] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState(""); const [plan, setPlan] = useState("");
  const list = s.role === "admin" ? s.eods : s.eods.filter((e) => e.role === s.role);
  return (
    <>
      <PageHead title="EOD Reports" sub={s.role === "admin" ? "All team submissions." : "Submit today's report."} />
      <div className="grid gap-6 lg:grid-cols-2">
        {s.role !== "admin" && (
          <form className="grid gap-3 rounded-xl border bg-card p-5" onSubmit={(e) => { e.preventDefault();
            const metrics: Record<string, number> = { ...auto }; for (const k of (FIELDS[s.role] ?? [])) metrics[k] = Number(m[k]) || 0;
            d({ type: "addEod", e: { summary, plan, metrics } }); setM({}); setSummary(""); setPlan(""); toast.success("EOD submitted"); }}>
            {Object.keys(auto).length > 0 && <div className="grid grid-cols-3 gap-2">{Object.entries(auto).map(([k, v]) => <div key={k} className="rounded-lg bg-muted p-2 text-center"><div className="text-xs text-muted-foreground">{k}</div><div className="font-display text-lg font-bold">{v}</div></div>)}</div>}
            <div className="grid grid-cols-2 gap-3">{(FIELDS[s.role] ?? []).map((k) => <div key={k} className="grid gap-1"><Label className="text-xs">{k}</Label><Input type="number" min={0} value={m[k] ?? ""} onChange={(e) => setM({ ...m, [k]: e.target.value })} /></div>)}</div>
            <div className="grid gap-1"><Label>Summary</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} required /></div>
            <div className="grid gap-1"><Label>Next-day plan</Label><Textarea value={plan} onChange={(e) => setPlan(e.target.value)} /></div>
            <Button type="submit">Submit EOD</Button>
          </form>
        )}
        <div className="space-y-3">
          {list.length === 0 && <p className="text-sm text-muted-foreground">No reports submitted yet.</p>}
          {list.map((e) => (
            <div key={e.id} className="rounded-xl border bg-card p-4">
              <div className="flex justify-between text-sm"><b>{e.person}</b><span className="text-muted-foreground">{ROLES.find((r) => r.id === e.role)?.label} · {e.date}</span></div>
              <div className="mt-2 flex flex-wrap gap-2">{Object.entries(e.metrics).map(([k, v]) => <span key={k} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{k}: <b>{v}</b></span>)}</div>
              <p className="mt-2 text-sm">{e.summary}</p>{e.plan && <p className="mt-1 text-xs text-muted-foreground">Tomorrow: {e.plan}</p>}
            </div>))}
        </div>
      </div>
    </>
  );
}
