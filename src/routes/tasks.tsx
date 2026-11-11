import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useErp, TASK_COLS, type Task, type TaskCol } from "@/lib/erp-store";
import { PageHead } from "@/components/erp/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [
    { title: "Task Board · CareerVeda ERP" }, { name: "description", content: "Design and development task board with comments." },
    { property: "og:title", content: "Task Board · CareerVeda ERP" }, { property: "og:description", content: "Design and development task board with comments." },
  ] }),
  component: Tasks,
});

function Tasks() {
  const { s, d } = useErp();
  const [drag, setDrag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const tasks = s.tasks.filter((t) => s.role === "admin" || t.team === s.role);
  return (
    <>
      <PageHead title="Task Board" sub="Drag cards between columns. Click a card for details and comments." action={s.role === "admin" && <NewTask />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_COLS.map((col) => (
          <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) d({ type: "moveTask", id: drag, col }); setDrag(null); }} className="min-h-48 rounded-xl bg-muted p-3">
            <div className="mb-3 flex justify-between text-sm font-semibold">{col}<span className="text-muted-foreground">{tasks.filter((t) => t.col === col).length}</span></div>
            <div className="space-y-2">{tasks.filter((t) => t.col === col).map((t) => (
              <div key={t.id} draggable onDragStart={() => setDrag(t.id)} onClick={() => setOpen(t.id)} className="cursor-grab rounded-lg border bg-card p-3 text-sm hover:border-primary">
                <div className="font-medium">{t.title}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Badge variant={t.priority === "High" ? "destructive" : "secondary"}>{t.priority}</Badge>{t.assignee}{t.comments.length > 0 && ` · 💬${t.comments.length}`}</div>
              </div>))}</div>
          </div>))}
      </div>
      {open && <TaskDialog task={s.tasks.find((t) => t.id === open)!} onClose={() => setOpen(null)} />}
    </>
  );
}

function TaskDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const { d } = useErp();
  const [txt, setTxt] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>{task.title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
        <div className="text-sm">Assignee: {task.assignee} · Due {task.due} · {task.team === "designer" ? "Design" : "Development"}</div>
        <Select value={task.col} onValueChange={(v) => d({ type: "moveTask", id: task.id, col: v as TaskCol })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TASK_COLS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <ul className="max-h-40 space-y-2 overflow-y-auto">{task.comments.map((c, i) => <li key={i} className="rounded-lg bg-muted p-2 text-sm"><b>{c.by}</b>: {c.text}<div className="text-xs text-muted-foreground">{c.at}</div></li>)}</ul>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!txt) return; d({ type: "comment", id: task.id, text: txt }); setTxt(""); }}>
          <Input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Add a comment…" /><Button type="submit">Post</Button></form>
      </DialogContent>
    </Dialog>
  );
}

function NewTask() {
  const { d } = useErp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", team: "developer" as Task["team"], priority: "Medium" as Task["priority"], due: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New task</Button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!f.title) return;
          d({ type: "addTask", t: { ...f, assignee: f.team === "designer" ? "Kabir Shah" : "Meera Iyer" } }); toast.success("Task created"); setOpen(false); }}>
          <div className="grid gap-1"><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></div>
          <div className="grid gap-1"><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={f.team} onValueChange={(v) => setF({ ...f, team: v as Task["team"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="developer">Developer</SelectItem><SelectItem value="designer">Designer</SelectItem></SelectContent></Select>
            <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v as Task["priority"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            <Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
