import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, CheckSquare, Users, Settings, LogOut, Bell, Search, Plus, X, Flag, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  
  const [newTask, setNewTask] = useState({ title: "", date: "", time: "", priority: "MEDIUM" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login"); 
    } else {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      fetchTasks(user.id);
    }
  }, []);

  const fetchTasks = async (userId: number) => {
    setErrorMessage("");
    try {
      // 🛠️ DÜZELTME: localhost yerine 127.0.0.1 yazıldı
      const response = await fetch(`http://127.0.0.1:5000/api/tasks?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const taskArray = Array.isArray(data) ? data : [];
        setTasks(taskArray);
        calculateGraphData(taskArray);
      } else { 
        setTasks([]); 
        throw new Error("Veri alınamadı"); 
      }
    } catch (error) { 
        setTasks([]);
        setErrorMessage("Sunucuya bağlanılamadı."); 
    }
  };

  const filteredTasks = tasks.filter((task) => 
    task.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateGraphData = (taskList: any[]) => {
    const counts: any = { Pzt: 0, Sal: 0, Çar: 0, Per: 0, Cum: 0, Cmt: 0, Paz: 0 };
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    taskList.forEach((task) => {
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        const day = dayNames[d.getDay()];
        if (counts[day] !== undefined) counts[day]++;
      }
    });
    setChartData([
      { name: 'Pzt', tasks: counts['Pzt'] }, { name: 'Sal', tasks: counts['Sal'] },
      { name: 'Çar', tasks: counts['Çar'] }, { name: 'Per', tasks: counts['Per'] },
      { name: 'Cum', tasks: counts['Cum'] }, { name: 'Cmt', tasks: counts['Cmt'] },
      { name: 'Paz', tasks: counts['Paz'] },
    ]);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !currentUser) return;
    setIsLoading(true);
    try {
      // 🛠️ DÜZELTME: localhost yerine 127.0.0.1 yazıldı
      const res = await fetch("http://127.0.0.1:5000/api/tasks", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
            title: newTask.title,
            priority: newTask.priority,
            date: newTask.date, 
            userId: currentUser.id 
        }),
      });
      if (res.ok) { 
        await fetchTasks(currentUser.id);
        setIsModalOpen(false); 
        setNewTask({ title: "", date: "", time: "", priority: "MEDIUM" }); 
      } else {
        alert("Görev eklenirken bir hata oluştu.");
      }
    } catch (error) { 
        console.error(error);
        alert("Sunucuyla iletişim hatası."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Tarih Yok";
    return new Date(dateString).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  };

  // Yardımcı Fonksiyonlar
  const getPriorityLabel = (p: string) => p === "HIGH" ? "Yüksek" : p === "MEDIUM" ? "Orta" : "Düşük";
  const getPriorityColor = (p: string) => p === "HIGH" ? "bg-red-100 text-red-600" : p === "MEDIUM" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600";
  const getPriorityBadgeColor = (p: string) => p === "HIGH" ? "bg-red-50 text-red-600" : p === "MEDIUM" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600";

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Yeni Görev Oluştur</h2>
              <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div><label className="block text-sm font-semibold mb-2">Görev Adı</label><input type="text" placeholder="Yapılacak iş..." className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`} value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Tarih</label><input type="date" className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`} value={newTask.date} onChange={(e) => setNewTask({...newTask, date: e.target.value})} /></div>
                <div><label className="block text-sm font-semibold mb-2">Saat</label><input type="time" className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`} value={newTask.time} onChange={(e) => setNewTask({...newTask, time: e.target.value})} /></div>
              </div>
              <div className="flex gap-3">
                {[
                    { val: 'LOW', label: 'Düşük' }, 
                    { val: 'MEDIUM', label: 'Orta' }, 
                    { val: 'HIGH', label: 'Yüksek' }
                ].map((p) => (
                  <button key={p.val} type="button" onClick={() => setNewTask({...newTask, priority: p.val})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 ${newTask.priority === p.val ? 'bg-blue-100 text-blue-600 border-blue-200' : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}`}>
                    <Flag size={16}/> {p.label}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg">{isLoading ? "Ekleniyor..." : "Görevi Ekle"}</button>
            </form>
          </div>
        </div>
      )}

      {/* SOL MENÜ */}
      <aside className={`hidden w-72 flex-col border-r md:flex transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-20 flex items-center px-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3">T</div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>TaskiFlow</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg"><LayoutDashboard size={22} /> <span className="ml-3 font-medium">Genel Bakış</span></Link>
          <Link to="/tasks" className={`flex items-center px-4 py-3 rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><CheckSquare size={22} /> <span className="ml-3 font-medium">Görevlerim</span></Link>
          <Link to="/team" className={`flex items-center px-4 py-3 rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><Users size={22} /> <span className="ml-3 font-medium">Ekip Arkadaşları</span></Link>
          <Link to="/settings" className={`flex items-center px-4 py-3 rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><Settings size={22} /> <span className="ml-3 font-medium">Ayarlar</span></Link>
        </nav>
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={handleLogout} className={`flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* İÇERİK */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 backdrop-blur-md border-b flex items-center justify-between px-8 sticky top-0 z-20 transition-colors ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Merhaba, {currentUser?.name || "Kullanıcı"} 👋
            </h2>
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                className={`pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all w-64 ${darkMode ? 'bg-gray-800 focus:bg-gray-700 text-white' : 'bg-gray-100 focus:bg-white'}`} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className={`relative p-2 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}><Bell size={20} /></Link>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg flex gap-2"><Plus size={20}/> Yeni Görev</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {errorMessage && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle size={20} /> {errorMessage}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard darkMode={darkMode} title="Toplam Görev" value={tasks.length} color="bg-blue-500" icon={<CheckSquare className="text-white"/>} />
            <StatCard darkMode={darkMode} title="Tamamlanan" value={tasks.filter(t => t.status === "DONE").length} color="bg-indigo-500" icon={<CheckCircle className="text-white"/>} />
            <StatCard darkMode={darkMode} title="Bekleyen" value={tasks.filter(t => t.status !== "DONE").length} color="bg-orange-500" icon={<Clock className="text-white"/>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Haftalık Performans</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#9CA3AF' : '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: darkMode ? '#9CA3AF' : '#6B7280'}} />
                    <Tooltip contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? '#fff' : '#000'}} />
                    <Area type="monotone" dataKey="tasks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{searchTerm ? `Sonuçlar (${filteredTasks.length})` : `Son Görevler (${tasks.length})`}</h3>
                <Link to="/tasks" className="text-blue-600 text-sm font-medium hover:underline">Tümü</Link>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[400px]">
                {filteredTasks.length === 0 ? <div className="text-center py-10 text-gray-400">Görev bulunamadı.</div> : filteredTasks.map((task, index) => (
                  <div key={task.id || index} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${darkMode ? 'hover:bg-gray-700 border-transparent hover:border-gray-600' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${getPriorityColor(task.priority)}`}>
                        {task.title ? task.title.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${getPriorityBadgeColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, darkMode }: any) => (
  <div className={`p-6 rounded-3xl border shadow-sm flex justify-between items-start transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div><p className="text-gray-500 text-sm mb-1">{title}</p><h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</h3></div>
    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-md ${color}`}>{icon}</div>
  </div>
);

export default Dashboard;