import { LayoutDashboard, CheckSquare, Map, Users, BarChart2, Bell, Settings, LogOut, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom"; // 🚀 useNavigate eklendi

const navItems = [
  { icon: LayoutDashboard, label: "Genel Bakış",    to: "/dashboard" },
  { icon: CheckSquare,     label: "Görevlerim",      to: "/tasks" },
  { icon: Map,             label: "Roadmap",           to: "/roadmap" },
  { icon: Users,           label: "Ekiplerim",               to: "/team" },
  { icon: BarChart2,       label: "Raporlar",          to: "/reports" },
  { icon: Bell,            label: "Bildirimler",       to: "/notifications", badge: 3 },
  { icon: Settings,        label: "Ayarlar",           to: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); 

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(()=> {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Kullanıcı verisi ayrıştırılamadı:", error);
      }
    }
  },[]);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleLogout = () => {
    // 1. LocalStorage temizliği
    localStorage.removeItem("token");
    localStorage.removeItem("activeOrgId"); 
    navigate("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-5 flex-shrink-0">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
          <span className="text-white font-bold text-sm tracking-tight">T</span>
        </div>
        <span className="text-[15px] font-semibold text-gray-900 tracking-tight">TaskiFlow</span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map(({ icon: Icon, label, to, badge }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              end
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
              )}

              <Icon
                size={16}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
              />

              <span className="flex-1">{label}</span>

              {badge && !isActive && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}

              {!isActive && (
                <ChevronRight
                  size={13}
                  className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-5 my-3 border-t border-gray-100" />

      {/* ── Kullanıcı Profil Kartı ── */}
      <div className="px-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">AK</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-gray-800 truncate leading-tight">{user ? user.name : "Yükleniyor..."}</p>
            <p className="text-[11px] text-gray-400 truncate leading-tight">{user ? user.email : "..."}</p>
          </div>

          {/* 🚀 Çıkış butonu artık aktif */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              handleLogout(); // 🚀 Fonksiyon çağrıldı
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-red-500"
            title="Çıkış Yap"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

    </aside>
  );
}