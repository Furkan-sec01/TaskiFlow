import { useNavigate } from "react-router-dom";
import {
  BarChart2, Clock, TrendingUp, Zap, AlertCircle,
  ChevronRight, Activity,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "paused";
  sprint: string;
  color: string;
  icon: React.ReactNode;
}

// ── Project Data ───────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "proj-alpha",
    name: "PROJ-Alpha",
    description: "Ana uygulama geliştirme — login, dashboard, API entegrasyonu ve kullanıcı yönetimi.",
    status: "active",
    sprint: "Sprint 7",
    color: "#3b82f6",
    icon: <Zap size={20} />,
  },
  {
    id: "proj-beta",
    name: "PROJ-Beta",
    description: "Mobile uygulama — iOS & Android responsive düzenlemeler ve push bildirim altyapısı.",
    status: "active",
    sprint: "Sprint 4",
    color: "#8b5cf6",
    icon: <Activity size={20} />,
  },
  {
    id: "proj-gamma",
    name: "PROJ-Gamma",
    description: "Veritabanı optimizasyon projesi — indeks iyileştirme, sorgu optimizasyonu ve performans raporları.",
    status: "paused",
    sprint: "Sprint 2",
    color: "#10b981",
    icon: <BarChart2 size={20} />,
  },
  {
    id: "proj-delta",
    name: "PROJ-Delta",
    description: "CI/CD pipeline kurulumu — GitHub Actions, Docker entegrasyonu ve otomatik test süreçleri.",
    status: "completed",
    sprint: "Sprint 6",
    color: "#f59e0b",
    icon: <TrendingUp size={20} />,
  },
  {
    id: "proj-epsilon",
    name: "PROJ-Epsilon",
    description: "Erişilebilirlik (a11y) güncellemesi — WCAG 2.1 uyumluluğu ve ekran okuyucu desteği.",
    status: "active",
    sprint: "Sprint 3",
    color: "#ef4444",
    icon: <AlertCircle size={20} />,
  },
  {
    id: "proj-zeta",
    name: "PROJ-Zeta",
    description: "Analitik dashboard — kullanıcı davranışı izleme, cohort analizi ve raporlama altyapısı.",
    status: "active",
    sprint: "Sprint 5",
    color: "#06b6d4",
    icon: <Clock size={20} />,
  },
];

const STATUS_CONFIG = {
  active:    { label: "Aktif",     dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  paused:    { label: "Duraklatıldı", dot: "bg-amber-400",  text: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/30" },
  completed: { label: "Tamamlandı",  dot: "bg-slate-400",   text: "text-slate-500 dark:text-slate-400",   bg: "bg-slate-100 dark:bg-slate-700" },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReportsList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Raporlar</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{PROJECTS.length} proje</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">Proje Raporları</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Detaylı raporu görüntülemek için bir projeye tıklayın.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project) => {
            const sc = STATUS_CONFIG[project.status];
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/reports/${project.id}`)}
                className="group text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden"
              >
                {/* Card Top Color Bar */}
                <div className="h-1.5 w-full" style={{ background: project.color }} />

                <div className="p-5">
                  {/* Icon + Name Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: project.color }}
                      >
                        {project.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{project.sprint}</div>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}