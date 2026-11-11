import { createContext, useContext, useReducer, type ReactNode } from "react";

export type Role = "admin" | "placement" | "backend" | "hr" | "designer" | "developer";
export const ROLES: { id: Role; label: string; person: string }[] = [
  { id: "admin", label: "Super Admin", person: "Vishal (Admin)" },
  { id: "placement", label: "Placement Head", person: "Ananya Rao" },
  { id: "backend", label: "Backend Calling", person: "Rohit Verma" },
  { id: "hr", label: "HR & Interview", person: "Priya Nair" },
  { id: "designer", label: "Graphic Designer", person: "Kabir Shah" },
  { id: "developer", label: "Full-Stack Developer", person: "Meera Iyer" },
];

export type CallStatus = "Not Called" | "Connected" | "DNP" | "Interested" | "Not Interested" | "Follow-up";
export const CALL_STATUSES: CallStatus[] = ["Not Called", "Connected", "DNP", "Interested", "Not Interested", "Follow-up"];
export type Stage = "Received" | "CV Review" | "LinkedIn Review" | "HR Mock" | "Tech Round 1" | "Tech Round 2" | "Tech Round 3" | "Final";
export const STAGES: Stage[] = ["Received", "CV Review", "LinkedIn Review", "HR Mock", "Tech Round 1", "Tech Round 2", "Tech Round 3", "Final"];

export interface CallLog { date: string; status: CallStatus; remark: string; by: string }
export interface StageNote { stage: Stage; date: string; feedback: string; rating: number; by: string }
export interface Candidate {
  id: string; name: string; phone: string; email: string; priorCourse: string; program: string;
  status: "Graduated" | "Enrolled"; skills: string[]; experience: number; score: number;
  owner: "placement" | "backend" | "hr"; callStatus: CallStatus; whatsapp: "Not Sent" | "Sent" | "Delivered" | "Replied";
  cvReceived: boolean; calls: CallLog[]; stage?: Stage | undefined; stageNotes: StageNote[]; companyId?: string | undefined;
  result?: "Selected" | "Rejected" | "On Hold" | undefined; slot?: string | undefined;
}
export interface Company {
  id: string; name: string; industry: string; city: string; website: string;
  hrs: { name: string; phone: string; email: string }[]; openings: { role: string; skills: string[]; positions: number }[];
  nextFollowUp: string;
}
export type TaskCol = "Todo" | "In Progress" | "Review" | "Done";
export const TASK_COLS: TaskCol[] = ["Todo", "In Progress", "Review", "Done"];
export interface Task {
  id: string; title: string; description: string; team: "designer" | "developer"; assignee: string;
  priority: "Low" | "Medium" | "High"; due: string; col: TaskCol; comments: { by: string; text: string; at: string }[];
}
export interface Eod { id: string; role: Role; person: string; date: string; summary: string; metrics: Record<string, number>; plan: string }
export interface Activity { at: string; who: string; text: string }

interface State { role: Role; candidates: Candidate[]; companies: Company[]; tasks: Task[]; eods: Eod[]; activity: Activity[] }

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
let seq = 0;
const uid = () => `r${++seq}`;

const names = ["Aarav Mehta", "Diya Sharma", "Ishaan Gupta", "Sneha Patil", "Arjun Reddy", "Kavya Menon", "Rahul Singh", "Pooja Joshi", "Vikram Das", "Neha Kulkarni", "Siddharth Jain", "Tanvi Bhat"];
const programs = ["Full-Stack Development", "Data Analytics", "Digital Marketing", "UI/UX Design"];
const skillPool = ["React", "Node.js", "SQL", "Python", "Excel", "Power BI", "Figma", "SEO", "MongoDB", "Java"];
const seedCandidates: Candidate[] = names.map((n, i) => ({
  id: uid(), name: n, phone: `98${(45000000 + i * 1371).toString()}`, email: n.toLowerCase().replace(" ", ".") + "@mail.com",
  priorCourse: ["B.Tech", "BCA", "B.Com", "BSc", "MBA"][i % 5]!, program: programs[i % 4]!,
  status: i % 3 === 0 ? "Enrolled" : "Graduated", skills: [skillPool[i % 10]!, skillPool[(i + 3) % 10]!, skillPool[(i + 6) % 10]!],
  experience: i % 4, score: 55 + ((i * 7) % 43),
  owner: i < 5 ? "placement" : i < 9 ? "backend" : "hr",
  callStatus: i < 5 ? "Not Called" : (["Connected", "DNP", "Interested", "Follow-up"] as CallStatus[])[i % 4]!,
  whatsapp: i < 6 ? "Not Sent" : "Delivered", cvReceived: i > 7,
  calls: i >= 5 ? [{ date: today(), status: "Connected", remark: "Discussed openings", by: "Rohit Verma" }] : [],
  stage: i >= 9 ? STAGES[(i - 8) * 2] : undefined, stageNotes: [], slot: i >= 9 ? "Mon 11:00" : undefined,
}));
const seedCompanies: Company[] = [
  { id: uid(), name: "Infosys", industry: "IT Services", city: "Bengaluru", website: "infosys.com", hrs: [{ name: "Rakesh K", phone: "9876500011", email: "rakesh@infosys.com" }], openings: [{ role: "React Developer", skills: ["React", "Node.js"], positions: 4 }], nextFollowUp: today() },
  { id: uid(), name: "Zomato", industry: "Food Tech", city: "Gurugram", website: "zomato.com", hrs: [{ name: "Shalini P", phone: "9876500022", email: "shalini@zomato.com" }, { name: "Amit R", phone: "9876500033", email: "amit@zomato.com" }], openings: [{ role: "Data Analyst", skills: ["SQL", "Power BI", "Excel"], positions: 2 }], nextFollowUp: today() },
  { id: uid(), name: "Razorpay", industry: "Fintech", city: "Bengaluru", website: "razorpay.com", hrs: [{ name: "Nikhil T", phone: "9876500044", email: "nikhil@razorpay.com" }], openings: [{ role: "Product Designer", skills: ["Figma"], positions: 1 }, { role: "Backend Engineer", skills: ["Node.js", "MongoDB"], positions: 2 }], nextFollowUp: today() },
];
const seedTasks: Task[] = [
  { id: uid(), title: "Instagram post – Placement Drive", description: "4 carousel slides announcing Infosys drive", team: "designer", assignee: "Kabir Shah", priority: "High", due: today(), col: "In Progress", comments: [] },
  { id: uid(), title: "Brochure revamp", description: "Update Data Analytics brochure", team: "designer", assignee: "Kabir Shah", priority: "Medium", due: today(), col: "Todo", comments: [] },
  { id: uid(), title: "Fix enquiry form bug", description: "Form not submitting on Safari", team: "developer", assignee: "Meera Iyer", priority: "High", due: today(), col: "Review", comments: [{ by: "Meera Iyer", text: "Patched, please verify", at: now() }] },
  { id: uid(), title: "Course landing page", description: "New UI/UX program page", team: "developer", assignee: "Meera Iyer", priority: "Medium", due: today(), col: "Todo", comments: [] },
  { id: uid(), title: "Logo pack for partners", description: "", team: "designer", assignee: "Kabir Shah", priority: "Low", due: today(), col: "Done", comments: [] },
];

type Action =
  | { type: "role"; role: Role }
  | { type: "addCandidate"; c: Omit<Candidate, "id" | "calls" | "stageNotes" | "owner" | "callStatus" | "whatsapp" | "cvReceived"> }
  | { type: "assignBackend"; id: string; companyId?: string }
  | { type: "logCall"; id: string; status: CallStatus; remark: string; whatsapp: Candidate["whatsapp"]; cvReceived: boolean }
  | { type: "handoff"; id: string; slot: string }
  | { type: "advance"; id: string; feedback: string; rating: number; result?: Candidate["result"] }
  | { type: "addCompany"; c: Omit<Company, "id"> }
  | { type: "addHr"; id: string; hr: Company["hrs"][number] }
  | { type: "addTask"; t: Omit<Task, "id" | "comments" | "col"> }
  | { type: "moveTask"; id: string; col: TaskCol }
  | { type: "comment"; id: string; text: string }
  | { type: "addEod"; e: Omit<Eod, "id" | "date" | "person" | "role"> };

const person = (r: Role) => ROLES.find((x) => x.id === r)!.person;

function reducer(s: State, a: Action): State {
  const who = person(s.role);
  const log = (text: string) => [{ at: now(), who, text }, ...s.activity].slice(0, 50);
  const upd = (id: string, f: (c: Candidate) => Candidate) => s.candidates.map((c) => (c.id === id ? f(c) : c));
  const nameOf = (id: string) => s.candidates.find((c) => c.id === id)?.name ?? "";
  switch (a.type) {
    case "role": return { ...s, role: a.role };
    case "addCandidate": return { ...s, candidates: [{ ...a.c, id: uid(), calls: [], stageNotes: [], owner: "placement", callStatus: "Not Called", whatsapp: "Not Sent", cvReceived: false }, ...s.candidates], activity: log(`added candidate ${a.c.name}`) };
    case "assignBackend": return { ...s, candidates: upd(a.id, (c) => ({ ...c, owner: "backend", companyId: a.companyId ?? c.companyId })), activity: log(`assigned ${nameOf(a.id)} to Backend Calling`) };
    case "logCall": return { ...s, candidates: upd(a.id, (c) => ({ ...c, callStatus: a.status, whatsapp: a.whatsapp, cvReceived: a.cvReceived, calls: [{ date: today(), status: a.status, remark: a.remark, by: who }, ...c.calls] })), activity: log(`logged call (${a.status}) for ${nameOf(a.id)}`) };
    case "handoff": return { ...s, candidates: upd(a.id, (c) => ({ ...c, owner: "hr", stage: "Received", slot: a.slot })), activity: log(`handed ${nameOf(a.id)} to HR`) };
    case "advance": return { ...s, candidates: upd(a.id, (c) => {
      const cur = c.stage ?? "Received"; const idx = STAGES.indexOf(cur);
      const notes = [...c.stageNotes, { stage: cur, date: today(), feedback: a.feedback, rating: a.rating, by: who }];
      if (cur === "Final") return { ...c, stageNotes: notes, result: a.result ?? "Selected" };
      return { ...c, stageNotes: notes, stage: STAGES[idx + 1]! };
    }), activity: log(`updated interview stage for ${nameOf(a.id)}`) };
    case "addCompany": return { ...s, companies: [{ ...a.c, id: uid() }, ...s.companies], activity: log(`added company ${a.c.name}`) };
    case "addHr": return { ...s, companies: s.companies.map((c) => (c.id === a.id ? { ...c, hrs: [...c.hrs, a.hr] } : c)), activity: log(`added HR contact ${a.hr.name}`) };
    case "addTask": return { ...s, tasks: [{ ...a.t, id: uid(), comments: [], col: "Todo" }, ...s.tasks], activity: log(`created task "${a.t.title}"`) };
    case "moveTask": return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, col: a.col } : t)), activity: log(`moved task to ${a.col}`) };
    case "comment": return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, comments: [...t.comments, { by: who, text: a.text, at: now() }] } : t)) };
    case "addEod": return { ...s, eods: [{ ...a.e, id: uid(), date: today(), person: who, role: s.role }, ...s.eods], activity: log("submitted EOD report") };
  }
}

const Ctx = createContext<{ s: State; d: (a: Action) => void } | null>(null);
export function ErpProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, { role: "admin", candidates: seedCandidates, companies: seedCompanies, tasks: seedTasks, eods: [], activity: [{ at: now(), who: "System", text: "Workspace ready" }] });
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>;
}
export function useErp() { const c = useContext(Ctx); if (!c) throw new Error("ErpProvider missing"); return c; }
export { person };

export function matchScore(c: Candidate, skills: string[]) {
  if (!skills.length) return 0;
  const hit = skills.filter((k) => c.skills.some((x) => x.toLowerCase() === k.toLowerCase())).length;
  return Math.round((hit / skills.length) * 70 + (c.score / 100) * 30);
}
