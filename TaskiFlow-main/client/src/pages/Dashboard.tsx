import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, FolderKanban, Users, Settings, LogOut, Bell, Search, Plus, X, 
  Folder, Calendar, ChevronRight, AlertCircle, Activity, Layout as LayoutIcon
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]); 
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const[memberCount, setMemberCount] = useState(0);
  const[projectCount, setProjectCount] = useState(0);

  
  
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login"); 
    } else {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      fetchProjects();
    }
  }, []);
  
  useEffect(()=>{

    const fetchMemberCount = async () =>{

      const token = localStorage.getItem("token");
      if(!token) return;

      try{
        const res =await fetch("http://localhost:5000/api/organizations/members", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if(Array.isArray(data)){
          setMemberCount(data.length);
        }
      }catch(error){
        console.log("Mevcut Çekme Hatası: ",error);
      }
    };

    fetchMemberCount();
    
  },[]);

  const calculateChartData = (projectList: any[]) => {
    const daysMap: any = { "Pzt": 0, "Sal": 0, "Çar": 0, "Per": 0, "Cum": 0, "Cmt": 0, "Paz": 0 };
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

    projectList.forEach((proj) => {
      const date = new Date(proj.createdAt);
      const dayName = dayNames[date.getDay()];
      if (daysMap[dayName] !== undefined) daysMap[dayName]++;
    });

    const formattedData = [
      { name: "Pzt", projects: daysMap["Pzt"] },
      { name: "Sal", projects: daysMap["Sal"] },
      { name: "Çar", projects: daysMap["Çar"] },
      { name: "Per", projects: daysMap["Per"] },
      { name: "Cum", projects: daysMap["Cum"] },
      { name: "Cmt", projects: daysMap["Cmt"] },
      { name: "Paz", projects: daysMap["Paz"] },
    ];
    setChartData(formattedData);
  };

  const fetchProjects = async () => {
    setErrorMessage("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/project", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
        setProjectCount(data.length);
        calculateChartData(data);
      } else {
        throw new Error("Projeler yüklenemedi.");
      }
    } catch (error) {
      setErrorMessage("Sunucuyla bağlantı kurulamadı.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setIsModalOpen(false); 
        setNewProject({ title: "", description: "" }); 
        fetchProjects(); 
      }
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-[#F1F5F9] text-slate-900'}`}>
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6">
          <div className={`w-full max-w-lg p-10 rounded-[2rem] shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Yeni Proje Kaydı</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-70">PROJE ADI</label>
                <input type="text" required value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className={`w-full px-6 py-4 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-medium ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="E-Ticaret Web Sitesi..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-70">AÇIKLAMA</label>
                <textarea rows={3} value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className={`w-full px-6 py-4 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-medium ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="Projenin temel hedefleri..." />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                {isLoading ? "İşleniyor..." : "Projeyi Onayla"}
              </button>
            </form>
          </div>
        </div>
      )}

     

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-24 flex items-center justify-between px-12 border-b ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/70 border-slate-200'} backdrop-blur-xl`}>
          <div>
            <h1 className="text-2xl font-bold">Hoş Geldiniz, {currentUser?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Proje kayıtlarında ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-12 pr-6 py-3 rounded-xl text-sm w-72 outline-none border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-100 border-transparent focus:bg-white focus:border-slate-300'}`} />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold shadow-blue-500/20 shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
              <Plus size={20}/> Yeni Proje
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-transparent">
          {errorMessage && <div className="p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-semibold shadow-sm"><AlertCircle size={20}/> {errorMessage}</div>}

          {/* PROJE GRID */}
          <section>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Kayıtlı Projeler</h2>
              <div className="h-[2px] flex-1 mx-8 bg-slate-200 dark:bg-slate-800 opacity-50"></div>
              <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{projects.length} TOPLAM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {projects.length === 0 ? (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] opacity-30">
                   <LayoutIcon size={48} className="mx-auto mb-4" />
                   <p className="font-bold text-lg">Görüntülenecek proje bulunamadı.</p>
                </div>
              ) : (
                projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
                  <ProjectCard key={project.id} project={project} darkMode={darkMode} />
                ))
              )}
            </div>
          </section>

          {/* ANALİZ ALANI */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-12">
            <div className="lg:col-span-1 space-y-6">
              <StatBox title="Toplam Proje" value={projectCount} icon={<Folder size={22}/>} accentColor="blue" darkMode={darkMode} />
              <StatBox title="Ekip Mevcudu" value={memberCount} icon={<Users size={22}/>} accentColor="purple" darkMode={darkMode} />
            </div>

            <div className={`lg:col-span-3 p-10 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold tracking-tight">Proje Oluşturma Trendi</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white-800 rounded-full text-[10px] font-black tracking-widest opacity-60">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> GERÇEK ZAMANLI
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#E2E8F0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: darkMode ? '#1e293b' : '#fff'}} />
                    <Area type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={3} fill="url(#colorProj)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// YARDIMCI BİLEŞENLER
const NavItem = ({ to, icon, label, active = false, darkMode }: any) => (
  <Link to={to} className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800'}`}>
    {icon} <span className="text-sm">{label}</span>
  </Link>
);

const StatBox = ({ title, value, icon, accentColor, darkMode }: any) => {
  const accentClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  };
  return (
    <div className={`p-8 rounded-3xl border shadow-sm transition-all hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black tracking-[0.2em] opacity-40 uppercase">{title}</p>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accentClasses[accentColor]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
};

const ProjectCard = ({ project, darkMode }: any) => (
  <div className={`group p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-8">
      <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 text-blue-600 rounded-2xl flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white shadow-inner">
        <FolderKanban size={24} />
      </div>
      <span className="text-[10px] font-bold tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full">KAYITLI</span>
    </div>
    <h4 className="text-xl font-bold mb-3 tracking-tight group-hover:text-blue-500 transition-colors">{project.title}</h4>
    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 h-10">{project.description || "Resmi kayıt açıklaması bulunmuyor."}</p>
    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
        <Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString("tr-TR")}
      </div>
      <Link to={`/projects/${project.id}`} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-3 transition-all">
        Dosyayı Aç <ChevronRight size={18} />
      </Link>
    </div>
  </div>
);

export default Dashboard;