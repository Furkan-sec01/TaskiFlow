import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { LayoutDashboard, CheckSquare, Users, Settings, Mail, UserPlus, Trash2, LogOut } from "lucide-react";

const Team = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // State Tanımları
  const [users, setUsers] = useState<any[]>([]); // Boş dizi ile başlat
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [isSending, setIsSending] = useState(false);

  // Sayfa Yüklendiğinde Çalışacak
  useEffect(() => {
    fetchUsers();
  }, []);

  // 1. Kullanıcıları Listele (Backend'e Bağlı)
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users", {
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

  // 2. Çıkış Yap
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 3. (Opsiyonel) Silme İşlemi - Şimdilik alert veriyor
  const handleDelete = (id: number) => {
    if(confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
        // İleride buraya DELETE isteği eklenecek
        alert("Silme fonksiyonu henüz backend'de aktif değil.");
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-md transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h2 className="text-2xl font-bold mb-6">Ekip Arkadaşı Davet Et</h2>
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl mb-4 text-sm font-semibold">
                ⚠️ Davet sistemi henüz aktif değil.
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Kapat</button>
          </div>
        </div>
      )}

      {/* SOL MENÜ */}
      <aside className={`hidden w-72 flex-col border-r md:flex transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-20 flex items-center px-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3">T</div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>TaskiFlow</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutDashboard size={22} /><span className="ml-3 font-medium">Genel Bakış</span></Link>
          <Link to="/projects" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><CheckSquare size={22} /><span className="ml-3 font-medium">Projelerim</span></Link>
          <Link to="/team" className="flex items-center px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200"><Users size={22} /><span className="ml-3 font-medium">Ekip Arkadaşları</span></Link>
          <Link to="/settings" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><Settings size={22} /><span className="ml-3 font-medium">Ayarlar</span></Link>
        </nav>
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={handleLogout} className={`flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
            <LogOut size={18} className="mr-2" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ekip Yönetimi</h1>
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
                  
                  <button onClick={() => handleDelete(user.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Kullanıcıyı Sil">
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
      </main>
    </div>
  );
};

export default Team;