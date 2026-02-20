import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { LayoutDashboard, CheckSquare, Users, Settings, Mail, UserPlus, Trash2, LogOut, AlertTriangle, UserMinus, User ,BarChart2 } from "lucide-react";
import NotificationDropdown from "../components/NotificationDropdown";

const Team = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // State Tanımları
  const [users, setUsers] = useState<any[]>([]); // Boş dizi ile başlat
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [isSending, setIsSending] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  // Sayfa Yüklendiğinde Çalışacak
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/organizations/members", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();

      // DİKKAT: Gelen verinin dizi olduğundan emin oluyoruz
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Beklenmeyen veri formatı:", data);
        setUsers([]); // Hata varsa boş dizi yap
      }
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
      setUsers([]);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if(!newMember.email){
      alert("Lütfen bir e-posta adresi girin.");
      return;
    }

    setIsSending(true);

    try{
      const res = await fetch("http://localhost:5000/api/organizations/invite",{
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify({
          email: newMember.email
        })
      });
      const data = await res.json();
      
      if(!res.ok){
        alert(data.error || "Bir hata oluştu");
        return;
      }
      alert("Davet Başarıyla Gönderildi");

    } catch(error){
      console.error("Davet hatası:", error);
      alert("Sunucuya bağlanılamadı.");
    } finally{
      setIsSending(false);
    }
  }

  const handleLeaveOrganization = async ()=> {
    const confirmLeave = window.confirm(
      "Bu ekipten ayrılmak istediğinize emin misiniz? Tüm proje erişimleriniz sonlanacak ve yeni bir kişisel çalışma alanına aktarılacaksınız."
    );

    if(!confirmLeave) return;

    setIsLeaving(true);
    const token = localStorage.getItem("token");

    try{
      const res = await fetch("http://localhost:5000/api/organizations/leave",{
        method:"POST",
        headers: {"Authorization": `Bearer ${token}`}
      });

      const data = await res.json();
      if(!res.ok){
        alert(data.error || "Ayrılma işlemi başarısız.");
        return;
      }

      alert("Başarıyla ayrıldınız. Yeni workspace'iniz hazır!");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");


    }catch(error){
      alert("Sunucuyla bağlantı kurulamadı.");
    }finally {
      setIsLeaving(false);
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    const confirmDelete = window.confirm("Bu üyeyi ekipten çıkarmak istediğinize emin misiniz?");
    if (!confirmDelete) return;

    setIsDelete(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/organizations/delete", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ memberId }) 
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Üye silme işlemi başarısız");
        return;
      }

      alert("Üye başarıyla ekipten çıkarıldı.");
      

      setUsers(prev => prev.filter(user => user.id !== memberId));

    } catch (error) {
      alert("Sunucuyla bağlantı kurulamadı.");
    } finally {
      setIsDelete(false);
    }
  };

  // 2. Çıkış Yap
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };



  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
     {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-md transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h2 className="text-2xl font-bold mb-6">Ekip Arkadaşı Davet Et</h2>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">E-posta Adresi</label>
                <input 
                  type="email"
                  required
                  placeholder="arkadas@sirket.com"
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-blue-500`}
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className={`flex-1 py-3 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSending}
                  className={`flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-opacity ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSending ? "Gönderiliyor..." : "Davet Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ekip Yönetimi</h1>
          <NotificationDropdown />
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
            <UserPlus size={20}/> Yeni Üye Ekle
          </button>
        </div>

        {/* KULLANICI LİSTESİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length === 0 ? (
             <div className="col-span-full text-center py-10 text-gray-400">Henüz kayıtlı başka kullanıcı yok veya yüklenemedi.</div>
          ) : (
             users.map((user) => (
                <div key={user.id} className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 relative group transition-colors 
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  
                  <button onClick={() => handleDeleteMember(user.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Kullanıcıyı Sil">
                    <Trash2 size={18} />
                  </button>
    
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1 truncate w-40" title={user.email}><Mail size={12} className="mr-1"/> {user.email}</div>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">Aktif Üye</span>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className={`mt-16 p-8 rounded-[2rem] border-2 border-dashed transition-colors ${darkMode ? 'border-red-900/30 bg-red-900/10' : 'border-red-100 bg-red-50/30'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl h-fit">
                        <UserMinus size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-600">Ekipten Ayrıl</h3>
                        <p className={`text-sm mt-1 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Mevcut organizasyondan ayrıldığınızda tüm projelerinizden ve ekip iletişiminden koparsınız. 
                            <strong> Not:</strong> Ekip sahibiyseniz önce sahipliği devretmeniz gerekir.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleLeaveOrganization}
                    disabled={isLeaving}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                        isLeaving 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white shadow-sm'
                    }`}
                >
                    {isLeaving ? "Ayrılıyorsunuz..." : "Organizasyondan Ayrıl"}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Team;