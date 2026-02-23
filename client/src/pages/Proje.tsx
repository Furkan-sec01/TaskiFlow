import React, { useState, useRef, useMemo } from "react";

// Tip Tanımlamaları
type PriorityType = 'Düşük' | 'Orta' | 'Yüksek';
type ColumnType = { id: string; title: string; color?: string };
type TaskType = { 
  id: string; 
  colId: string; 
  title: string; 
  description: string; 
  dueDate: string;
  priority: PriorityType;
  assignee: string; 
  creator: string;  
  lastMovedAt?: string; // Taşınma tarihini tutacak alan
};

const Proje: React.FC = () => {
  const presets = [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000', label: 'Yosemite' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000', label: 'Alpler' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000', label: 'Orman' },
    { id: 'p4', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000', label: 'Dağlar' }
  ];
  
  const columnColorOptions = [
    { name: "Gri", class: "bg-gray-200/90" },
    { name: "Mavi", class: "bg-blue-100/95" },
    { name: "Yeşil", class: "bg-emerald-100/95" },
    { name: "Sarı", class: "bg-amber-100/95" },
    { name: "Kırmızı", class: "bg-red-100/95" },
    { name: "Mor", class: "bg-purple-100/95" },
  ];

  // State Yönetimi
  const [bgImage, setBgImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [columns, setColumns] = useState<ColumnType[]>([
    { id: "col-1", title: "YAPILACAKLAR", color: "bg-gray-200/90" },
    { id: "col-2", title: "GELİŞTİRME", color: "bg-blue-100/90" },
  ]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  
  // Arama ve Filtreleme State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | "Hepsi">("Hepsi");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ 
    title: "", description: "", dueDate: "", priority: "Orta" as PriorityType, assignee: "", creator: "" 
  });
  const [newColTitle, setNewColTitle] = useState(""); 
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // Filtreleme Mekanizması
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = selectedPriority === "Hepsi" || task.priority === selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, selectedPriority]);

  // Fonksiyonlar
  const handleCreateColumn = () => {
    if (newColTitle.trim()) {
      setColumns([...columns, { id: `col-${Date.now()}`, title: newColTitle.toUpperCase(), color: "bg-gray-200/90" }]);
      setNewColTitle("");
      setIsColModalOpen(false);
    }
  };

  const deleteColumn = (colId: string) => {
    if (window.confirm("Sütun ve içindeki görevler silinecek. Onaylıyor musunuz?")) {
      setColumns(prev => prev.filter(c => c.id !== colId));
      setTasks(prev => prev.filter(t => t.colId !== colId));
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData("taskId", taskId);
  
  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const now = new Date().toLocaleString('tr-TR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isMoved = t.colId !== targetColId;
        return { ...t, colId: targetColId, lastMovedAt: isMoved ? now : t.lastMovedAt };
      }
      return t;
    }));
  };

  const changeColumnColor = (colId: string, colorClass: string) => {
    setColumns(prev => prev.map(col => col.id === colId ? { ...col, color: colorClass } : col));
    setOpenSettingsId(null);
  };

  const openEditModal = (task: TaskType) => {
    setNewTask({ ...task });
    setEditingTaskId(task.id);
    setIsEditMode(true);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title) return;
    if (isEditMode && editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...newTask } : t));
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now().toString(), colId: activeColId! }]);
    }
    closeTaskModal();
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setIsEditMode(false);
    setEditingTaskId(null);
    setNewTask({ title: "", description: "", dueDate: "", priority: "Orta", assignee: "", creator: "" });
  };

  const getPriorityColor = (p: PriorityType) => {
    if (p === 'Yüksek') return 'bg-red-500 text-white border-transparent';
    if (p === 'Orta') return 'bg-amber-400 text-white border-transparent';
    return 'bg-emerald-400 text-white border-transparent';
  };

  return (
    <div className="h-screen w-full bg-cover bg-center transition-all duration-700 flex flex-col font-sans overflow-hidden select-none"
      style={{ backgroundColor: "#F4F5F7", backgroundImage: bgImage ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${bgImage})` : 'none' }}>
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border-b border-gray-200 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">T</div>
          <h1 className="font-black text-gray-800 tracking-tighter text-xl">TaskiFlow</h1>
        </div>

        {/* Arama ve Filtreleme Bölümü */}
        <div className="flex flex-1 items-center justify-center px-10 gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Kartlarda veya kişilerde ara..." 
              className="w-full bg-gray-100 border-none rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {["Hepsi", "Yüksek", "Orta", "Düşük"].map((p) => (
              <button 
                key={p} 
                onClick={() => setSelectedPriority(p as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${selectedPriority === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {p}
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
          <button onClick={() => fileInputRef.current?.click()} className="text-xs font-black text-indigo-600 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 uppercase">Resim Yükle</button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onloadend = () => setBgImage(r.result as string); r.readAsDataURL(file); }
          }} />
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 flex gap-6 p-6 overflow-x-auto items-start custom-scrollbar">
        {columns.map((col) => (
          <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col.id)} 
            className={`${col.color || 'bg-gray-200/90'} backdrop-blur-md w-[320px] shrink-0 rounded-[1.5rem] flex flex-col max-h-full shadow-lg border border-white/40`}>
            
            <div className="p-5 font-black text-gray-700 text-xs flex justify-between items-center relative tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <span>{col.title}</span>
                <span className="bg-black/10 px-2 py-0.5 rounded-full text-[9px] opacity-50">
                  {filteredTasks.filter(t => t.colId === col.id).length}
                </span>
              </div>
              <button onClick={() => setOpenSettingsId(openSettingsId === col.id ? null : col.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10">⚙️</button>
              
              {openSettingsId === col.id && (
                <div className="absolute top-12 right-2 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl p-4 z-30 border border-gray-100 w-52">
                  <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Renk Teması</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {columnColorOptions.map((opt) => (
                      <button key={opt.name} onClick={() => changeColumnColor(col.id, opt.class)} className={`w-10 h-10 rounded-xl border-2 border-white ${opt.class} hover:scale-110 transition-transform`} />
                    ))}
                  </div>
                  <button onClick={() => deleteColumn(col.id)} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 uppercase tracking-widest">Sütunu Kaldır</button>
                </div>
              )}
            </div>
            
            <div className="px-3 pb-3 flex flex-col gap-3 overflow-y-auto min-h-[50px]">
              {filteredTasks.filter(t => t.colId === col.id).map((task) => (
                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => openEditModal(task)}
                  className="bg-white/90 p-5 rounded-2xl shadow-sm border border-white cursor-grab active:cursor-grabbing hover:shadow-xl transition-all group relative">
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.filter(t => t.id !== task.id)); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-[10px]">✕</button>
                  </div>

                  <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h4>
                  <p className="text-gray-500 text-[11px] leading-snug line-clamp-2 mb-4">{task.description}</p>
                  
                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black uppercase">
                          {task.assignee ? task.assignee.charAt(0) : '?'}
                        </div>
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          @{task.assignee || 'kişi-yok'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-70">
                        <span className="text-[8px] font-bold text-gray-400 italic">Veren:</span>
                        <span className="text-[9px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          @{task.creator || 'admin'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 mt-1">
                      {task.dueDate && (
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-right">
                          HEDEF: {task.dueDate}
                        </span>
                      )}
                      {task.lastMovedAt && (
                        <span className="text-[8px] font-medium text-indigo-400 italic text-right bg-indigo-50/50 rounded px-1 self-end">
                          🕒 Taşındı: {task.lastMovedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setActiveColId(col.id); setIsTaskModalOpen(true); }} className="mx-3 my-3 p-3 text-gray-400 hover:bg-white/50 hover:text-indigo-600 rounded-xl text-[10px] font-black border-2 border-dashed border-gray-300 transition-all uppercase">
              + Yeni Kart
            </button>
          </div>
        ))}

        <button onClick={() => setIsColModalOpen(true)} className="bg-white/60 hover:bg-white/80 w-[320px] shrink-0 rounded-[1.5rem] py-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-400 transition-all shadow-sm">
          <div className="text-2xl font-light">+</div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sütun Ekle</span>
        </button>
      </main>

      {/* Modals: Sütun Ekleme */}
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

      {/* Modals: Görev Ekleme / Düzenleme */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeTaskModal}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tighter uppercase">{isEditMode ? "Kartı Düzenle" : "Yeni Kart"}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Başlık</label>
                <input placeholder="Ne yapılacak?" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görevi Veren Kişi</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">@</span>
                    <input 
                      placeholder="veren" 
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-9 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" 
                      value={newTask.creator} 
                      onChange={(e) => setNewTask({...newTask, creator: e.target.value.replace('@', '')})} 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görevi Yapacak Kişi</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-sm">@</span>
                    <input 
                      placeholder="yapan" 
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-9 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                      value={newTask.assignee} 
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value.replace('@', '')})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Önem Derecesi</label>
                  <select className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as PriorityType})}>
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Teslim Tarihi</label>
                  <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Detaylar</label>
                <textarea placeholder="Açıklama ekleyin..." className="w-full bg-gray-50 border-none rounded-2xl p-4 h-24 outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none text-sm" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={closeTaskModal} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-xs uppercase tracking-widest">İptal</button>
                <button onClick={handleSaveTask} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">{isEditMode ? "Güncelle" : "Oluştur"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proje;