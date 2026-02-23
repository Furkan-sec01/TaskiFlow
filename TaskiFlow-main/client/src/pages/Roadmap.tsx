import { useState } from "react";
import { ChevronDown, ChevronRight, Share2, Download, MessageSquare, SlidersHorizontal, Search, Plus, MoreHorizontal } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  status: "DONE" | "IN PROGRESS" | "TODO";
  start: number; // column index (0-based, each col = 2 weeks)
  span: number;
  color: string;
  assignee?: string;
}

interface Epic {
  id: string;
  title: string;
  start: number;
  span: number;
  color: string;
  tasks: Task[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { label: "JUL", sub: "Sprint 1", cols: 2 },
  { label: "AUG", sub: "Sprint 2", cols: 2 },
  { label: "AUG", sub: "Sprint 3", cols: 2 },
  { label: "SEP", sub: "", cols: 2 },
  { label: "OCT", sub: "", cols: 2 },
];

const TOTAL_COLS = 10; // half-week units

const RELEASES: { label: string; col: number; color: string }[] = [
  { label: "Beta 1.0", col: 5, color: "#4F46E5" },
  { label: "Beta 2.0", col: 7, color: "#4F46E5" },
];

const EPICS: Epic[] = [
  {
    id: "FLY-1",
    title: "App basics",
    start: 2,
    span: 5,
    color: "#22C55E",
    tasks: [
      { id: "FLY-10", title: "Setup dev and ...", status: "DONE", start: 2, span: 2, color: "#22C55E", assignee: "A" },
      { id: "FLY-13", title: "As a user I can ...", status: "DONE", start: 2, span: 2, color: "#22C55E", assignee: "B" },
      { id: "FLY-11", title: "As a user...", status: "IN PROGRESS", start: 3, span: 3, color: "#22C55E", assignee: "C" },
      { id: "FLY-12", title: "As a use...", status: "IN PROGRESS", start: 4, span: 2, color: "#22C55E", assignee: "D" },
    ],
  },
  {
    id: "FLY-2",
    title: "Basic trip booking",
    start: 3,
    span: 3,
    color: "#7C3AED",
    tasks: [],
  },
  {
    id: "FLY-3",
    title: "Invite and share",
    start: 3,
    span: 4,
    color: "#3B82F6",
    tasks: [],
  },
  {
    id: "FLY-4",
    title: "My Trips overview",
    start: 4,
    span: 4,
    color: "#EAB308",
    tasks: [],
  },
  {
    id: "FLY-5",
    title: "Notifications",
    start: 4,
    span: 4,
    color: "#06B6D4",
    tasks: [],
  },
  {
    id: "FLY-7",
    title: "Booking modifications flow",
    start: 5,
    span: 4,
    color: "#22C55E",
    tasks: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  DONE: "bg-green-100 text-green-700",
  "IN PROGRESS": "bg-blue-100 text-blue-700",
  TODO: "bg-gray-100 text-gray-600",
};

const avatarColors = ["bg-pink-400", "bg-orange-400", "bg-violet-500", "bg-teal-400", "bg-sky-500"];
const initials = ["AK", "MB", "CR", "DS", "ET"];

function Avatar({ index }: { index: number }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${avatarColors[index % avatarColors.length]}`}>
      {initials[index % initials.length]}
    </span>
  );
}

// ─── Bar component ────────────────────────────────────────────────────────────
function Bar({
  start, span, color, label, small,
}: { start: number; span: number; color: string; label?: string; small?: boolean }) {
  const leftPct = (start / TOTAL_COLS) * 100;
  const widthPct = (span / TOTAL_COLS) * 100;
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 cursor-pointer transition-opacity hover:opacity-90 group"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: color,
        height: small ? "18px" : "22px",
      }}
    >
      {label && (
        <span className="text-white text-[10px] font-semibold truncate leading-none">{label}</span>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function EpicRow({ epic }: { epic: Epic }) {
  const [open, setOpen] = useState(epic.id === "FLY-1");

  return (
    <>
      {/* Epic header row */}
      <tr className="border-b border-gray-100 hover:bg-gray-50/60 group">
        <td className="w-56 min-w-[14rem] px-3 py-1.5 sticky left-0 bg-white group-hover:bg-gray-50/60 z-10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOpen(!open)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span className="w-4 h-4 rounded bg-indigo-600 flex-shrink-0 text-[9px] font-bold text-white flex items-center justify-center">E</span>
            <span className="text-xs font-semibold text-gray-500 mr-1">{epic.id}</span>
            <span className="text-xs font-medium text-gray-800 truncate">{epic.title}</span>
          </div>
        </td>
        <td className="relative h-9" colSpan={1}>
          <div className="relative w-full h-full">
            <Bar start={epic.start} span={epic.span} color={epic.color} />
          </div>
        </td>
      </tr>

      {/* Task rows */}
      {open &&
        epic.tasks.map((task, i) => (
          <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/40 group">
            <td className="w-56 min-w-[14rem] px-3 py-1 sticky left-0 bg-white group-hover:bg-gray-50/40 z-10">
              <div className="flex items-center gap-1.5 pl-5">
                <span className="w-3.5 h-3.5 rounded-sm bg-indigo-500 flex-shrink-0 text-[8px] font-bold text-white flex items-center justify-center">S</span>
                <span className="text-[11px] text-gray-400 mr-1">{task.id}</span>
                <span className="text-[11px] text-gray-700 truncate">{task.title}</span>
                <span className={`ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                {task.assignee && <Avatar index={i} />}
              </div>
            </td>
            <td className="relative h-7" colSpan={1}>
              <div className="relative w-full h-full">
                <Bar start={task.start} span={task.span} color={task.color} small />
              </div>
            </td>
          </tr>
        ))}
    </>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Roadmap() {
  const TODAY_COL = 4.2; // orange line position

  return (
    <div className="min-h-screen bg-white font-[system-ui]" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <div className="px-6 pt-5 pb-1 text-xs text-gray-400 flex gap-1.5">
        <span className="hover:underline cursor-pointer">Projects</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Travel Booking App</span>
      </div>

      {/* Header */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Roadmap</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <MessageSquare size={13} />
            Give feedback
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
            <Share2 size={13} />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
            <Download size={13} />
            Export
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-2 flex items-center gap-3 border-b border-gray-100">
        {/* Avatar group */}
        <div className="flex -space-x-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Avatar key={i} index={i} />
          ))}
          <button className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-300 transition-colors">
            <Plus size={10} />
          </button>
        </div>

        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-28"
            placeholder="Search..."
          />
        </div>

        {["Status category", "Versions", "Type"].map((f) => (
          <button key={f} className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            {f}
            <ChevronDown size={11} />
          </button>
        ))}

        <div className="ml-auto">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Gantt */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed" style={{ minWidth: "900px" }}>
          {/* Column headers */}
          <colgroup>
            <col style={{ width: "224px" }} />
            <col />
          </colgroup>
          <thead>
            {/* Month row */}
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 bg-white z-20 px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sprints
              </th>
              <th className="p-0">
                <div className="relative grid text-[11px] font-semibold text-gray-400 uppercase tracking-wider" style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)` }}>
                  {["JUL", "", "AUG", "", "SEP", "", "OCT", "", "", ""].map((m, i) => (
                    <div key={i} className="py-2 text-center border-l border-gray-100 first:border-l-0">
                      {m}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
            {/* Sprint row */}
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 bg-white z-20 px-3 py-1 text-left text-[11px] font-medium text-gray-500">
                Releases
              </th>
              <th className="p-0">
                <div
                  className="relative grid"
                  style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)` }}
                >
                  {Array.from({ length: TOTAL_COLS }).map((_, i) => {
                    const sprint = i === 1 ? "Sprint 1" : i === 3 ? "Sprint 2" : i === 5 ? "Sprint 3" : "";
                    return (
                      <div
                        key={i}
                        className={`py-1 text-center text-[10px] font-medium border-l border-gray-100 first:border-l-0 ${
                          sprint ? (i === 3 ? "text-indigo-700 bg-indigo-50/60" : "text-gray-400") : ""
                        }`}
                      >
                        {sprint}
                      </div>
                    );
                  })}

                  {/* Release diamonds */}
                  {RELEASES.map((r) => (
                    <div
                      key={r.label}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                      style={{ left: `${(r.col / TOTAL_COLS) * 100}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <div className="w-3 h-3 rounded-full mb-0.5" style={{ backgroundColor: r.color }} />
                      <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: r.color }}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {EPICS.map((epic) => (
              <EpicRow key={epic.id} epic={epic} />
            ))}

            {/* Today line — rendered via wrapper */}
          </tbody>
        </table>

        {/* Today line overlay */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-orange-500 z-30"
          style={{
            left: `calc(224px + ${(TODAY_COL / TOTAL_COLS) * 100}% * (100% - 224px) / 100%)`,
          }}
        />
      </div>
    </div>
  );
}