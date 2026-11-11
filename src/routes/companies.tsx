import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/companies")({
  head: () => ({ meta: [
    { title: "Companies · CareerVeda ERP" }, { name: "description", content: "Company intelligence, HR contacts and openings." },
    { property: "og:title", content: "Companies · CareerVeda ERP" }, { property: "og:description", content: "Company intelligence, HR contacts and openings." },
  ] }),
  component: Companies,
});

function Companies() {
  const { s, d } = useErp();
  return (
    <>
      <PageHead title="Companies" sub="Hiring partners, HR contacts and open roles." action={<AddCompany />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.companies.map((c) => {
          const aligned = s.candidates.filter((x) => x.companyId === c.id);
          return (
            <div key={c.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-xs text-muted-foreground">{c.industry} · {c.city} · {c.website}</p></div><Badge variant="secondary">{aligned.length} aligned</Badge></div>
              <div className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Openings</div>
              {c.openings.map((o, i) => <div key={i} className="mt-1 text-sm">{o.role} <span className="text-muted-foreground">×{o.positions}</span> <span className="text-xs text-muted-foreground">({o.skills.join(", ")})</span></div>)}
              <div className="mt-4 text-xs font-semibold uppercase text-muted-foreground">HR contacts ({c.hrs.length})</div>
              {c.hrs.map((h, i) => <div key={i} className="mt-1 text-sm">{h.name} · <span className="text-muted-foreground">{h.phone}</span></div>)}
              <HrForm onAdd={(hr) => { d({ type: "addHr", id: c.id, hr }); toast.success("HR contact added"); }} />
            </div>
          );
        })}
      </div>
    </>
  );
}

function HrForm({ onAdd }: { onAdd: (h: { name: string; phone: string; email: string }) => void }) {
  const [n, setN] = useState(""); const [p, setP] = useState("");
  return (
    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!n) return; onAdd({ name: n, phone: p, email: "" }); setN(""); setP(""); }}>
      <Input placeholder="HR name" value={n} onChange={(e) => setN(e.target.value)} className="h-8" />
      <Input placeholder="Phone" value={p} onChange={(e) => setP(e.target.value)} className="h-8" />
      <Button size="sm" variant="outline" type="submit">Add</Button>
    </form>
  );
}

function AddCompany() {
  const { d } = useErp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", industry: "", city: "", website: "", role: "", skills: "", positions: "1" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add company</Button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>New company</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!f.name) return;
          d({ type: "addCompany", c: { name: f.name, industry: f.industry, city: f.city, website: f.website, hrs: [], nextFollowUp: "", openings: f.role ? [{ role: f.role, skills: f.skills.split(",").map((x) => x.trim()).filter(Boolean), positions: Number(f.positions) || 1 }] : [] } });
          toast.success("Company added"); setOpen(false); }}>
          {(Object.keys(f) as (keyof typeof f)[]).map((k) => (
            <div key={k} className="grid gap-1"><Label className="capitalize">{k === "role" ? "Opening role" : k === "skills" ? "Required skills (comma separated)" : k}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={k === "name"} /></div>))}
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
