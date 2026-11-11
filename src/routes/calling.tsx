import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp, CALL_STATUSES, type Candidate, type CallStatus } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/calling")({
  head: () => ({ meta: [
    { title: "Calling Desk · CareerVeda ERP" }, { name: "description", content: "Backend calling queue, call history and HR handoff." },
    { property: "og:title", content: "Calling Desk · CareerVeda ERP" }, { property: "og:description", content: "Backend calling queue, call history and HR handoff." },
  ] }),
  component: Calling,
});

const canHandoff = (c: Candidate) => c.callStatus === "Interested" && c.cvReceived;

function Calling() {
  const { s } = useErp();
  const queue = s.candidates.filter((c) => c.owner === "backend");
  const [sel, setSel] = useState<string | null>(null);
  const cur = queue.find((c) => c.id === sel) ?? queue[0];
  return (
    <>
      <PageHead title="Calling Desk" sub="Hand off to HR once a candidate is Interested and their CV is received." />
      {queue.length === 0 ? <p className="text-muted-foreground">Queue is empty — the Placement Head assigns candidates from the Candidates page.</p> : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <ul className="space-y-2">{queue.map((c) => (
            <li key={c.id}><button onClick={() => setSel(c.id)} className={`w-full rounded-xl border p-3 text-left transition-colors ${cur?.id === c.id ? "border-primary bg-card" : "bg-card/60 hover:bg-card"}`}>
              <div className="flex justify-between"><span className="font-medium">{c.name}</span><Badge variant={canHandoff(c) ? "default" : "secondary"}>{c.callStatus}</Badge></div>
              <div className="text-xs text-muted-foreground">{c.program} · {c.phone}</div></button></li>))}</ul>
          {cur && <CallPanel key={cur.id} c={cur} />}
        </div>
      )}
    </>
  );
}

function CallPanel({ c }: { c: Candidate }) {
  const { s, d } = useErp();
  const [status, setStatus] = useState<CallStatus>(c.callStatus === "Not Called" ? "Connected" : c.callStatus);
  const [remark, setRemark] = useState("");
  const [wa, setWa] = useState(c.whatsapp);
  const [cv, setCv] = useState(c.cvReceived);
  const [slot, setSlot] = useState("");
  const company = s.companies.find((x) => x.id === c.companyId);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-xl font-semibold">{c.name}</h2>
      <p className="text-sm text-muted-foreground">{c.email} · {c.phone}{company && ` · for ${company.name}`}</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); d({ type: "logCall", id: c.id, status, remark, whatsapp: wa, cvReceived: cv }); setRemark(""); toast.success("Call logged"); }}>
        <div className="grid gap-1"><Label>Calling status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CallStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CALL_STATUSES.filter((x) => x !== "Not Called").map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1"><Label>WhatsApp</Label>
          <Select value={wa} onValueChange={(v) => setWa(v as Candidate["whatsapp"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Not Sent", "Sent", "Delivered", "Replied"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1 sm:col-span-2"><Label>Remarks</Label><Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="What was discussed?" /></div>
        <div className="flex items-center gap-2"><Switch checked={cv} onCheckedChange={setCv} id="cv" /><Label htmlFor="cv">CV received</Label></div>
        <Button type="submit" className="sm:justify-self-end">Log call</Button>
      </form>
      <div className="mt-6 rounded-lg bg-muted p-4">
        <div className="mb-2 text-sm font-semibold">Hand off to HR</div>
        {canHandoff(c) ? (
          <div className="flex gap-2"><Input placeholder="Preferred slot e.g. Tue 3 PM" value={slot} onChange={(e) => setSlot(e.target.value)} className="bg-card" />
            <Button onClick={() => { d({ type: "handoff", id: c.id, slot }); toast.success(`${c.name} handed to HR`); }}>Hand off</Button></div>
        ) : <p className="text-sm text-muted-foreground">Needs status “Interested” and CV received (log a call to update).</p>}
      </div>
      <div className="mt-6"><div className="mb-2 text-sm font-semibold">Call history</div>
        {c.calls.length === 0 ? <p className="text-sm text-muted-foreground">No calls yet.</p> :
          <ul className="space-y-2">{c.calls.map((l, i) => <li key={i} className="border-l-2 border-accent pl-3 text-sm"><span className="font-medium">{l.status}</span> — {l.remark || "No remark"}<div className="text-xs text-muted-foreground">{l.date} · {l.by}</div></li>)}</ul>}
      </div>
    </div>
  );
}
