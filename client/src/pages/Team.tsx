import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Users, Settings, Mail, UserPlus, Trash2 } from "lucide-react";
import emailjs from "@emailjs/browser"; 
import { useTheme } from "../context/ThemeContext"; // 👈 1. BU EKLENDİ

const Team = () => {
  const { darkMode } = useTheme(); // 👈 2. MODU BURADAN ALIYORUZ
  
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [isSending, setIsSending] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  useEffect(() => {
    // localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchUsers(user.id || user.user?.id);
      } catch (error) {
        console.error("Kullanıcı bilgisi parse hatası:", error);
      }
    }
  }, []);

  const fetchUsers = async (userId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users?userId=${userId}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) { console.error("Hata:", error); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${name} adlı kişiyi silmek istediğine emin misin?`)) return;
    if (!currentUser) {
      alert("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    try {
      const userId = currentUser.id || currentUser.user?.id;
      const res = await fetch(`http://localhost:5000/api/users/${id}?requesterUserId=${userId}`, { 
        method: "DELETE" 
      });
      if (res.ok) { 
        alert("✅ Silindi."); 
        fetchUsers(userId); 
      } 
      else { 
        const errorData = await res.json();
        alert("❌ Silinemedi: " + (errorData.error || "Bilinmeyen hata")); 
      }
    } catch (error) { alert("Hata."); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    setIsSending(true);
    try {
      const userId = currentUser.id || currentUser.user?.id;
      const dbRes = await fetch("http://localhost:5000/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMember,
          inviterUserId: userId
        }),
      });
      if (!dbRes.ok) {
        const errorData = await dbRes.json();
        throw new Error(errorData.error || "Kayıt hatası.");
      }

      // Backend'den dönen token'ı al
      const dbData = await dbRes.json();
      const verificationToken = dbData.token || dbData.verificationToken;

      // Onaylama linkini oluştur
      const confirmationLink = `${window.location.origin}/verify?token=${verificationToken}`;

      const templateParams = {
        to_name: newMember.name,      
        to_email: newMember.email,    
        from_name: "TaskiFlow Admin",
        confirmation_link: confirmationLink
      };

      try {
        await emailjs.send("service_xyz123", "template_i6wa2zo", templateParams, "K7vg4r177dmyFtn45");
      } catch (emailError) {
        console.error("Email gönderme hatası:", emailError);
        // Email gönderilemese bile kullanıcı oluşturuldu, linki göster
      }

      // Link'i kullanıcıya göster (development için)
      const linkMessage = `✅ ${newMember.name} davet edildi!\n\n` +
        `Onaylama Linki:\n${confirmationLink}\n\n` +
        `Not: Email'den link açılmazsa, yukarıdaki linki kopyalayıp tarayıcınıza yapıştırın.`;
      
      alert(linkMessage);
      
      // Link'i console'a da yazdır
      console.log("Onaylama Linki:", confirmationLink);
      
      fetchUsers(userId); 
      setIsModalOpen(false); 
      setNewMember({ name: "", email: "" }); 
    } catch (error: any) { alert("Hata: " + error.message); } 
    finally { setIsSending(false); }
  };

  return (
    // 👇 3. ANA KAPLAYICIYA KARANLIK MOD AYARI GELDİ
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      {/* DAVET MODALI (RENKLER DİNAMİK OLDU) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-md transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h2 className="text-2xl font-bold mb-6">Ekip Arkadaşı Davet Et</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ad Soyad</label>
                <input type="text" required 
                  className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Ad Soyad"/>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>E-Posta</label>
                <input type="email" required 
                  className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="Mail"/>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>İptal</button>
                <button type="submit" disabled={isSending} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                  {isSending ? "Gönderiliyor..." : "Davet Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOL MENÜ (RENKLER DİNAMİK OLDU) */}
      <aside className={`hidden w-72 flex-col border-r md:flex transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-20 flex items-center px-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3">T</div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>TaskiFlow</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutDashboard size={22} /><span className="ml-3 font-medium">Genel Bakış</span></Link>
          <Link to="/tasks" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><CheckSquare size={22} /><span className="ml-3 font-medium">Görevlerim</span></Link>
          <Link to="/team" className="flex items-center px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200"><Users size={22} /><span className="ml-3 font-medium">Ekip Arkadaşları</span></Link>
          <Link to="/settings" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}><Settings size={22} /><span className="ml-3 font-medium">Ayarlar</span></Link>
        </nav>
      </aside>

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ekip Yönetimi</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
            <UserPlus size={20}/> Yeni Üye Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 relative group transition-colors 
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              
              <button onClick={() => handleDelete(user.id, user.name)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Kullanıcıyı Sil">
                <Trash2 size={18} />
              </button>

              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1"><Mail size={14} className="mr-1"/> {user.email}</div>
                {user.status === 'pending' ? (
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">Onay Bekliyor</span>
                ) : (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Aktif Üye</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Team;