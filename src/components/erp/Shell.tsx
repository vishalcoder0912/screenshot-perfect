import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Users, Building2, PhoneCall, ClipboardCheck, KanbanSquare, FileText, Menu } from "lucide-react";
import { useState } from "react";
import { ROLES, useErp, type Role } from "@/lib/erp-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof Users; roles: Role[] }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "placement", "backend", "hr", "designer", "developer"] },
  { to: "/candidates", label: "Candidates", icon: Users, roles: ["admin", "placement"] },
  { to: "/companies", label: "Companies", icon: Building2, roles: ["admin", "placement", "backend"] },
  { to: "/calling", label: "Calling Desk", icon: PhoneCall, roles: ["admin", "backend"] },
  { to: "/interviews", label: "Interviews", icon: ClipboardCheck, roles: ["admin", "hr", "placement"] },
  { to: "/tasks", label: "Task Board", icon: KanbanSquare, roles: ["admin", "designer", "developer"] },
  { to: "/reports", label: "EOD Reports", icon: FileText, roles: ["admin", "placement", "backend", "hr", "designer", "developer"] },
];

export function Shell({ children }: { children: ReactNode }) {
  const { s, d } = useErp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const nav = NAV.filter((n) => n.roles.includes(s.role));
  const side = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-6">
        <div className="font-display text-xl font-bold">Career<span className="text-sidebar-primary">Veda</span></div>
        <div className="text-xs opacity-70">Placement ERP</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent")}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-2 text-xs opacity-70">Viewing as</div>
        <Select value={s.role} onValueChange={(v) => d({ type: "role", role: v as Role })}>
          <SelectTrigger className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="mt-2 text-xs opacity-70">{ROLES.find((r) => r.id === s.role)?.person}</div>
      </div>
    </aside>
  );
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen md:block">{side}</div>
      {open && <div className="fixed inset-0 z-40 flex md:hidden"><div className="h-full">{side}</div><div className="flex-1 bg-foreground/40" onClick={() => setOpen(false)} /></div>}
      <div className="flex-1 min-w-0">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <span className="font-display font-bold">CareerVeda ERP</span>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Stat({ label, value, tone = "primary" }: { label: string; value: number | string; tone?: "primary" | "accent" | "success" | "destructive" }) {
  const bar = { primary: "bg-primary", accent: "bg-accent", success: "bg-success", destructive: "bg-destructive" }[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4">
      <div className={cn("absolute left-0 top-0 h-full w-1", bar)} />
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
