import React, { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// Tip Tanımlamaları
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW'; 
type ColumnType = { id: string; title: string; color?: string; tasks: TaskType[] };
type TaskType = { 
  id: string; 
  columnId: string; 
  title: string; 
  description: string; 
  dueDate: string;
  priority: PriorityType;
  assignee?: { name: string; email: string }; 
  lastMovedAt?: string; 
};

type MemberType = { id: string; name: string; email: string };

const Proje: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000' }
  ];

  const columnColorOptions = [
    { name: "Gri", class: "bg-gray-200/90" },
    { name: "Mavi", class: "bg-blue-100/95" },
    { name: "Yeşil", class: "bg-emerald-100/95" },
    { name: "Sarı", class: "bg-amber-100/95" },
    { name: "Kırmızı", class: "bg-red-100/95" },
    { name: "Mor", class: "bg-purple-100/95" },
  ];

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [members, setMembers] = useState<MemberType[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | "ALL">("ALL");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false); 
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ 
    title: "", description: "", dueDate: "", priority: "MEDIUM" as PriorityType, assigneeMail: "" 
  });
  const [newColTitle, setNewColTitle] = useState(""); 
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  
  const fetchBoard = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/project/${projectId}/board`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setColumns(data.columns || []);
        if (data.orgId) fetchOrgMembers(data.orgId);
      }
    } catch (error) { console.error("Pano yüklenemedi:", error); }
    finally { setIsLoading(false); }
  };

  const fetchOrgMembers = async (orgId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (error) { console.error("Üyeler çekilemedi"); }
  };

  useEffect(() => { fetchBoard(); }, [projectId]);

  const handleCreateColumn = async () => {
    if (!newColTitle.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/column/create/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: newColTitle })
      });
      if (res.ok) { fetchBoard(); setIsColModalOpen(false); setNewColTitle(""); }
    } catch (error) { alert("Sütun eklenemedi."); }
  };

  const deleteColumn = async (colId: string) => {
    if (!window.confirm("Sütun ve içindeki görevler silinecek. Onaylıyor musunuz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/column/delete/${projectId}/${colId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchBoard();
    } catch (error) { alert("Silme hatası."); }
  };

  const handleSaveTask = async () => {
    if (!newTask.title || !activeColId || !newTask.assigneeMail) {
      alert("Lütfen başlık ve ekip üyesi seçtiğinizden emin olun.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/create/${projectId}/${activeColId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          date: newTask.dueDate,
          priority: newTask.priority,
          assigneeMail: newTask.assigneeMail
        })
      });
      if (res.ok) { fetchBoard(); closeTaskModal(); }
    } catch (error) { alert("Görev hatası."); }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Görevi silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/tasks/delete/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchBoard();
    } catch (error) { console.error(error); }
  };

  const handleDrop = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/project/task/${taskId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ columnId: targetColId })
      });
      if (res.ok) fetchBoard();
    } catch (error) { console.error("Taşıma hatası."); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData("taskId", taskId);

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setNewTask({ title: "", description: "", dueDate: "", priority: "MEDIUM", assigneeMail: "" });
  };

  const getPriorityColor = (p: PriorityType) => {
    if (p === 'HIGH') return 'bg-red-500 text-white border-transparent';
    if (p === 'MEDIUM') return 'bg-amber-400 text-white border-transparent';
    return 'bg-emerald-400 text-white border-transparent';
  };

  return (
    <div className="h-screen w-full bg-cover bg-center transition-all duration-700 flex flex-col font-sans overflow-hidden select-none"
      style={{ backgroundColor: "#F4F5F7", backgroundImage: bgImage ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${bgImage})` : 'none' }}>
      
      <header className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border-b border-gray-200 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">← Geri Dön</button>
          <div className="h-6 w-[1px] bg-gray-300 mx-2" />
          <h1 className="font-black text-gray-800 tracking-tighter text-xl uppercase">Proje Panosu</h1>
        </div>

        <div className="flex flex-1 items-center justify-center px-10 gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" placeholder="Görevlerde ara..." 
              className="w-full bg-gray-100 border-none rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button key={p} onClick={() => setSelectedPriority(p as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPriority === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {p === 'ALL' ? 'Hepsi' : p === 'HIGH' ? 'Yüksek' : p === 'MEDIUM' ? 'Orta' : 'Düşük'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-200/50 p-1.5 rounded-xl">
            {presets.map(p => (
              <button key={p.id} onClick={() => setBgImage(p.url)} className="w-7 h-7 rounded-lg bg-cover border-2 border-transparent hover:border-indigo-500 transition-all" style={{ backgroundImage: `url(${p.url})` }} />
            ))}
          </div>
          <button onClick={() => setBgImage(null)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">Temizle</button>
          <button onClick={() => fileInputRef.current?.click()} className="text-xs font-black text-indigo-600 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 uppercase">Resim</button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onloadend = () => setBgImage(r.result as string); r.readAsDataURL(file); }
          }} />
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 flex gap-6 p-6 overflow-x-auto items-start custom-scrollbar">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center font-bold opacity-30 tracking-[0.3em]">SENKRONİZE EDİLİYOR...</div>
        ) : (
          <>
            {columns.map((col) => (
              <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col.id)} 
                className={`${col.color || 'bg-gray-200/90'} backdrop-blur-md w-[320px] shrink-0 rounded-[1.5rem] flex flex-col max-h-full shadow-lg border border-white/40`}>
                
                <div className="p-5 font-black text-gray-700 text-xs flex justify-between items-center relative tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className="bg-black/10 px-2 py-0.5 rounded-full text-[9px] opacity-50">{col.tasks.length}</span>
                  </div>
                  <button onClick={() => setOpenSettingsId(openSettingsId === col.id ? null : col.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10">⚙️</button>
                  
                  {openSettingsId === col.id && (
                    <div className="absolute top-12 right-2 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl p-4 z-30 border border-gray-100 w-52">
                      <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Renk Teması</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {columnColorOptions.map((opt) => (
                          <button key={opt.name} onClick={() => setOpenSettingsId(null)} className={`w-10 h-10 rounded-xl border-2 border-white ${opt.class} hover:scale-110 transition-transform`} />
                        ))}
                      </div>
                      <button onClick={() => deleteColumn(col.id)} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 uppercase tracking-widest">Sütunu Kaldır</button>
                    </div>
                  )}
                </div>
                
                <div className="px-3 pb-3 flex flex-col gap-3 overflow-y-auto min-h-[50px] custom-scrollbar">
                  {col.tasks
                    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedPriority === "ALL" || t.priority === selectedPriority))
                    .map((task) => (
                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white/90 p-5 rounded-2xl shadow-sm border border-white cursor-grab active:cursor-grabbing hover:shadow-xl transition-all group relative">
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'HIGH' ? 'YÜKSEK' : task.priority === 'MEDIUM' ? 'ORTA' : 'DÜŞÜK'}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-[10px]">✕</button>
                      </div>

                      <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h4>
                      <p className="text-gray-500 text-[11px] leading-snug line-clamp-2 mb-4">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black uppercase">
                            {task.assignee?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            @{task.assignee?.name?.split(' ')[0].toLowerCase() || 'boş'}
                          </span>
                        </div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter italic">
                          {new Date(task.dueDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setActiveColId(col.id); setIsTaskModalOpen(true); }} className="mx-3 my-3 p-3 text-gray-400 hover:bg-white/50 hover:text-indigo-600 rounded-xl text-[10px] font-black border-2 border-dashed border-gray-300 transition-all uppercase tracking-widest">
                  + Yeni Kart
                </button>
              </div>
            ))}

            <button onClick={() => setIsColModalOpen(true)} className="bg-white/60 hover:bg-white/80 w-[320px] shrink-0 rounded-[1.5rem] py-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-400 transition-all shadow-sm">
              <div className="text-2xl font-light">+</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sütun Ekle</span>
            </button>
          </>
        )}
      </main>

      {/* Sütun Ekleme Modalı */}
      {isColModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsColModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tighter uppercase">Yeni Sütun</h2>
            <input autoFocus placeholder="Sütun Başlığı..." className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold mb-6" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setIsColModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-black text-gray-400 text-xs uppercase tracking-widest">İptal</button>
              <button onClick={handleCreateColumn} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals: Görev Ekleme */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeTaskModal}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tighter uppercase">Yeni Kart</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görev Adı</label>
                <input placeholder="Ne yapılacak?" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              </div>
              
              {/* 🚀 ÜYE SEÇİM DROPDOWN - GÜNCELLENDİ */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görevi Atanacak Üye</label>
                <div className="relative group">
                   <select 
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none cursor-pointer"
                    value={newTask.assigneeMail}
                    onChange={(e) => setNewTask({...newTask, assigneeMail: e.target.value})}
                  >
                    <option value="">Üye Seçiniz...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.email}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Öncelik</label>
                  <select className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as PriorityType})}>
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Bitiş Tarihi</label>
                  <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Açıklama</label>
                <textarea placeholder="Görev detaylarını buraya yazın..." className="w-full bg-gray-50 border-none rounded-2xl p-4 h-24 outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none text-sm" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={closeTaskModal} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-xs uppercase tracking-widest">İptal</button>
                <button onClick={handleSaveTask} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">Kartı Oluştur</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proje;