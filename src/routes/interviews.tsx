import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp, STAGES, type Candidate } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [
    { title: "Interviews · CareerVeda ERP" }, { name: "description", content: "HR interview journey from CV review to final decision." },
    { property: "og:title", content: "Interviews · CareerVeda ERP" }, { property: "og:description", content: "HR interview journey from CV review to final decision." },
  ] }),
  component: Interviews,
});

function Interviews() {
  const { s } = useErp();
  const [open, setOpen] = useState<Candidate | null>(null);
  const hr = s.candidates.filter((c) => c.owner === "hr");
  return (
    <>
      <PageHead title="Interview Pipeline" sub="Candidates received from the backend team, stage by stage." />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((st) => {
          const items = hr.filter((c) => c.stage === st && !c.result);
          return (
            <div key={st} className="w-56 shrink-0 rounded-xl bg-muted p-3">
              <div className="mb-2 flex justify-between text-sm font-semibold">{st}<span className="text-muted-foreground">{items.length}</span></div>
              <div className="space-y-2">{items.map((c) => (
                <button key={c.id} onClick={() => setOpen(c)} className="w-full rounded-lg border bg-card p-3 text-left text-sm hover:border-primary">
                  <div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.program}{c.slot && ` · ${c.slot}`}</div></button>))}</div>
            </div>
          );
        })}
      </div>
      <h2 className="mb-3 mt-4 font-semibold">Final results</h2>
      <div className="flex flex-wrap gap-2">{hr.filter((c) => c.result).map((c) => (
        <Badge key={c.id} variant={c.result === "Rejected" ? "destructive" : "default"} className="py-1">{c.name} · {c.result}</Badge>))}
        {hr.every((c) => !c.result) && <p className="text-sm text-muted-foreground">No decisions yet.</p>}</div>
      {open && <StageDialog id={open.id} onClose={() => setOpen(null)} />}
    </>
  );
}

function StageDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { s, d } = useErp();
  const c = s.candidates.find((x) => x.id === id)!;
  const [fb, setFb] = useState(""); const [rating, setRating] = useState([3]);
  const isFinal = c.stage === "Final";
  const submit = (result?: Candidate["result"]) => { d({ type: "advance", id, feedback: fb, rating: rating[0] ?? 3, result }); toast.success(isFinal ? `Decision: ${result}` : "Moved to next stage"); onClose(); };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{c.name} — {c.stage}</DialogTitle></DialogHeader>
        <div className="flex flex-wrap gap-1">{STAGES.map((st) => <span key={st} className={cn("h-1.5 flex-1 rounded-full", STAGES.indexOf(st) <= STAGES.indexOf(c.stage!) ? "bg-primary" : "bg-muted")} />)}</div>
        {c.stageNotes.length > 0 && <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">{c.stageNotes.map((n, i) => <li key={i} className="border-l-2 border-accent pl-3"><b>{n.stage}</b> · {n.rating}/5 — {n.feedback || "—"}<div className="text-xs text-muted-foreground">{n.by} · {n.date}</div></li>)}</ul>}
        <div className="grid gap-1"><Label>Feedback</Label><Textarea value={fb} onChange={(e) => setFb(e.target.value)} /></div>
        <div className="grid gap-2"><Label>Rating: {rating[0]}/5</Label><Slider min={1} max={5} step={1} value={rating} onValueChange={setRating} /></div>
        {isFinal ? <div className="flex gap-2"><Button className="flex-1" onClick={() => submit("Selected")}>Selected</Button><Button variant="outline" className="flex-1" onClick={() => submit("On Hold")}>On hold</Button><Button variant="destructive" className="flex-1" onClick={() => submit("Rejected")}>Rejected</Button></div>
          : <Button onClick={() => submit()}>Save & move to {STAGES[STAGES.indexOf(c.stage!) + 1]}</Button>}
      </DialogContent>
    </Dialog>
  );
}
