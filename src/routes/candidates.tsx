import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp, matchScore } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/candidates")({
  head: () => ({ meta: [
    { title: "Candidates · CareerVeda ERP" }, { name: "description", content: "Candidate intelligence and eligibility finder." },
    { property: "og:title", content: "Candidates · CareerVeda ERP" }, { property: "og:description", content: "Candidate intelligence and eligibility finder." },
  ] }),
  component: Candidates,
});

function Candidates() {
  const { s, d } = useErp();
  const [q, setQ] = useState("");
  const [companyId, setCompanyId] = useState<string>("none");
  const opening = s.companies.find((c) => c.id === companyId)?.openings[0];
  const reqSkills = opening?.skills ?? [];
  let list = s.candidates.filter((c) => (c.name + c.skills.join(" ") + c.program).toLowerCase().includes(q.toLowerCase()));
  if (reqSkills.length) list = [...list].sort((a, b) => matchScore(b, reqSkills) - matchScore(a, reqSkills));

  return (
    <>
      <PageHead title="Candidates" sub="Search, match against openings and assign to backend calling." action={<AddCandidate />} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search name, skill, program…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-64 bg-card"><SelectValue placeholder="Eligibility finder" /></SelectTrigger>
          <SelectContent><SelectItem value="none">Eligibility finder: off</SelectItem>{s.companies.map((c) => <SelectItem key={c.id} value={c.id}>Match: {c.name} – {c.openings[0]?.role}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>
            <th className="p-3">Name</th><th className="p-3">Program</th><th className="p-3">Skills</th><th className="p-3">Score</th>{reqSkills.length > 0 && <th className="p-3">Match</th>}<th className="p-3">Owner</th><th className="p-3"></th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3"><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.priorCourse} · {c.status}</div></td>
              <td className="p-3">{c.program}</td>
              <td className="p-3"><div className="flex flex-wrap gap-1">{c.skills.map((k) => <Badge key={k} variant={reqSkills.includes(k) ? "default" : "secondary"}>{k}</Badge>)}</div></td>
              <td className="p-3">{c.score}</td>
              {reqSkills.length > 0 && <td className="p-3 font-semibold text-primary">{matchScore(c, reqSkills)}%</td>}
              <td className="p-3 capitalize">{c.result ?? (c.owner === "hr" ? `HR · ${c.stage}` : c.owner)}</td>
              <td className="p-3">{c.owner === "placement" && <Button size="sm" onClick={() => { d({ type: "assignBackend", id: c.id, companyId: companyId !== "none" ? companyId : undefined }); toast.success(`${c.name} sent to Backend Calling`); }}>Assign to calling</Button>}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  );
}

function AddCandidate() {
  const { d } = useErp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", priorCourse: "", program: "Full-Stack Development", skills: "", score: "70" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add candidate</Button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>New candidate</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) return;
          d({ type: "addCandidate", c: { name: f.name, phone: f.phone, email: f.email, priorCourse: f.priorCourse, program: f.program, status: "Enrolled", skills: f.skills.split(",").map((x) => x.trim()).filter(Boolean), experience: 0, score: Number(f.score) || 0 } });
          toast.success("Candidate added"); setOpen(false); }}>
          {(["name", "phone", "email", "priorCourse", "program", "skills", "score"] as const).map((k) => (
            <div key={k} className="grid gap-1"><Label className="capitalize">{k === "priorCourse" ? "Prior course" : k === "skills" ? "Skills (comma separated)" : k}</Label><Input value={f[k]} onChange={set(k)} required={k === "name"} /></div>))}
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
