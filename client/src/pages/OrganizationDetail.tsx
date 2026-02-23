import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Users, 
  FolderKanban, 
  UserPlus, 
  ArrowLeft,
  Mail,
  Calendar,
  X,
  UserMinus,
  LogOut,
  ChevronRight,
  Trash2,
  LucideTrash2
} from "lucide-react";

const OrganizationDetail = () => {
  const { orgId } = useParams();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // State Yönetimi
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "projects">("members");

  // Modal ve Davet State'leri
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Veri Yükleme
  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  useEffect(() => {
    if (activeTab === "projects") {
      fetchOrgProjects();
    }
  }, [activeTab, orgId]);

  // 📡 Üyeleri Getir
  const fetchMembers = async () => {
    if (!orgId || orgId === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
      else setMembers([]);
    } catch (error) {
      console.error("Üyeler yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 📡 Projeleri Getir
  const fetchOrgProjects = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsProjectsLoading(true);
      const res = await fetch(`http://localhost:5000/api/project/org/${orgId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProjects(data);
    } catch (error) {
      console.error("Projeler yüklenemedi:", error);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // 🚀 Üye Davet Et
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, orgId: orgId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Davet başarıyla gönderildi!");
        setIsInviteModalOpen(false);
        setInviteEmail("");
      } else {
        alert(data.error || "Davet gönderilemedi.");
      }
    } catch (error) {
      alert("Sunucu bağlantı hatası.");
    } finally {
      setIsInviting(false);
    }
  };

  // 🗑️ Üyeyi Çıkar
  const handleDeleteMember = async (memberId: string) => {
    const confirmDelete = window.confirm("Bu üyeyi ekipten çıkarmak istediğinize emin misiniz?");
    if (!confirmDelete) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/delete-member`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ memberId })
      });
      if (res.ok) {
        alert("Üye başarıyla çıkarıldı.");
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch (error) {
      alert("Sunucu hatası.");
    }
  };

  // 🏃 Ekipten Ayrıl
  const handleLeaveTeam = async () => {
    const confirmLeave = window.confirm("Bu ekipten ayrılmak istediğinize emin misiniz?");
    if (!confirmLeave) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/leave`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Ekipten ayrıldınız.");
        navigate("/team");
      } else {
        const data = await res.json();
        alert(data.error || "Ayrılma işlemi başarısız.");
      }
    } catch (error) {
      alert("Sunucu hatası.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/project/${projectId}`,{
      method: "DELETE",
      headers: {
      "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Proje başarıyla silindi!");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } else {
      const data = await res.json();
      alert(data.error || "Silme işlemi başarısız.");
    }
  }

  const handleDeleteTeam = async () => {
    const confirmLeave = window.confirm("Bu ekipten kapatmak istediğinize eminmisiniz?");
    if(!confirmLeave) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/organizations/${orgId}`,{
      method: "DELETE",
      headers:{
        "Authorization": `Bearer ${token}`
      }
    });

    if(res.ok){
      alert("Ekip kapatıldı.");
      navigate("/team");
    }
    else{
      const data = await res.json();
      alert(data.error || "Silme işlemi başarısız.");
    }
  }

  return (
    <div className={`min-h-screen p-8 transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 🖼️ DAVET MODALI */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Ekibe Davet Et</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">E-posta Adresi</label>
                <input 
                  type="email" required placeholder="arkadas@sirket.com"
                  className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>İptal</button>
                <button type="submit" disabled={isInviting} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all">
                  {isInviting ? "Gönderiliyor..." : "Davet Et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ÜST BAR */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <button onClick={() => navigate("/team")} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity font-bold">
          <ArrowLeft size={20} /> Organizasyonlara Dön
        </button>
        <div className="flex gap-3">
          <button onClick={handleLeaveTeam} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18} /> Ekipten Ayrıl
          </button>

          <button onClick={handleDeleteTeam} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={18} /> Ekibi Kapat
          </button>

          <button onClick={() => setIsInviteModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <UserPlus size={18} /> Üye Davet Et
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Çalışma Alanı Detayları</h1>

        {/* TAB MENÜ */}
        <div className="flex gap-8 border-b border-gray-700/20 mb-8">
          <button onClick={() => setActiveTab("members")} className={`pb-4 font-bold flex items-center gap-2 transition-all ${activeTab === "members" ? 'border-b-2 border-blue-500 text-blue-500' : 'opacity-50 hover:opacity-80'}`}>
            <Users size={20} /> Üyeler ({members.length})
          </button>
          <button onClick={() => setActiveTab("projects")} className={`pb-4 font-bold flex items-center gap-2 transition-all ${activeTab === "projects" ? 'border-b-2 border-blue-500 text-blue-500' : 'opacity-50 hover:opacity-80'}`}>
            <FolderKanban size={20} /> Projeler
          </button>
        </div>

        {/* İÇERİK: ÜYELER */}
        {activeTab === "members" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-10 opacity-50 animate-pulse text-center font-bold">Üyeler getiriliyor...</div>
            ) : (
              members.map((member) => (
                <div key={member.id} className={`p-6 rounded-3xl border transition-all relative group hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                    {member.role !== 'OWNER' && (
                      <button onClick={() => handleDeleteMember(member.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10" title="Üyeyi Çıkar">
                        <UserMinus size={18} />
                      </button>
                    )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-md uppercase">{member.name.charAt(0)}</div>
                    <div>
                      <h3 className="font-bold">{member.name}</h3>
                      <p className="text-xs opacity-60 flex items-center gap-1 truncate w-40" title={member.email}><Mail size={12}/> {member.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/10">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${member.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{member.role}</span>
                    <span className="text-[10px] opacity-40 flex items-center gap-1"><Calendar size={10}/> {new Date(member.joinedAt || Date.now()).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* İÇERİK: PROJELER */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isProjectsLoading ? (
              <div className="col-span-full py-20 text-center opacity-50 animate-pulse font-bold">Projeler yükleniyor...</div>
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-20 opacity-40 flex flex-col items-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[3rem]">
                <FolderKanban size={48} className="mb-4" />
                <p className="text-xl font-bold">Henüz Proje Yok</p>
                <p className="text-sm">Bu organizasyon için ilk projeyi oluşturun.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className={`group p-8 rounded-[2.5rem] border transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-100 shadow-sm hover:border-blue-500/50'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${darkMode ? 'bg-gray-700 group-hover:bg-blue-600' : 'bg-blue-50 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      <FolderKanban size={24} className={darkMode ? 'text-blue-400 group-hover:text-white' : 'text-blue-600 group-hover:text-white'} />
                      
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase">{project._count?.tasks || 0} Görev</span>
                      <span className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-tighter">{project._count?.columns || 0} Sütun</span>
                    </div>
                  </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                      className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Organizasyonu Sil"
                    >
                      <Trash2 size={18} />
                    </button>

                  <h4 className="text-xl font-black mb-3 group-hover:text-blue-500 transition-colors">{project.title}</h4>
                  <p className="text-sm opacity-60 font-medium line-clamp-2 h-10 mb-8 leading-relaxed">{project.description || "Bu proje için henüz bir açıklama girilmemiş."}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-700/10">
                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-40"><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString("tr-TR")}</div>
                    <div className="flex items-center gap-1 text-blue-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Detaylar <ChevronRight size={16} /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetail;