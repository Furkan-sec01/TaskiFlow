import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // Artık hata vermeyecek
import { LayoutDashboard, CheckSquare, Users, Settings, Bell, Moon, Sun, Save, User, CheckCircle } from "lucide-react";

const SettingsPage = () => {
  const { darkMode, setDarkMode } = useTheme();
  
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    bio: string;
    id: number | null;
  }>({
    name: "",
    email: "", 
    bio: "",
    id: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verileri Çek
  useEffect(() => {
    // localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const userId = user.id || user.user?.id;
      const userEmail = user.email || user.user?.email;

      if (!userId && !userEmail) {
        console.error("Kullanıcı bilgisi bulunamadı");
        return;
      }

      // Backend'den kullanıcı bilgilerini çek
      const queryParam = userId ? `id=${userId}` : `email=${userEmail}`;
      fetch(`http://localhost:5000/api/users/me?${queryParam}`)
        .then(res => res.json())
        .then(data => {
          if(data && !data.error) {
            setProfile({ 
              name: data.name || "", 
              email: data.email || "", 
              bio: data.bio || "",
              id: data.id
            });
          } else {
            // Eğer backend'den veri gelmezse, localStorage'daki veriyi kullan
            setProfile({
              name: user.name || user.user?.name || "",
              email: userEmail || "",
              bio: user.bio || user.user?.bio || "",
              id: userId
            });
          }
        })
        .catch(error => {
          console.error("Kullanıcı bilgisi çekilirken hata:", error);
          // Hata durumunda localStorage'daki veriyi kullan
          setProfile({
            name: user.name || user.user?.name || "",
            email: userEmail || "",
            bio: user.bio || user.user?.bio || "",
            id: userId
          });
        });
    } catch (error) {
      console.error("localStorage parse hatası:", error);
    }
  }, []);

  // Kaydet
  const handleSave = async () => {
    if (!profile.email && !profile.id) {
      alert("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          bio: profile.bio
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Güncellenmiş kullanıcı bilgisini localStorage'a kaydet
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(data.error || "Hata oluştu.");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      {/* SOL MENÜ */}
      <aside className={`hidden w-72 flex-col border-r md:flex transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`h-20 flex items-center px-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3">T</div>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>TaskiFlow</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutDashboard size={22} /><span className="ml-3 font-medium">Genel Bakış</span></Link>
          <Link to="/tasks" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}><CheckSquare size={22} /><span className="ml-3 font-medium">Görevlerim</span></Link>
          <Link to="/team" className={`flex items-center px-4 py-3 rounded-xl hover:bg-opacity-10 ${darkMode ? 'text-gray-400 hover:bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}><Users size={22} /><span className="ml-3 font-medium">Ekip Arkadaşları</span></Link>
          <Link to="/settings" className="flex items-center px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200"><Settings size={22} /><span className="ml-3 font-medium">Ayarlar</span></Link>
        </nav>
      </aside>

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ayarlar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SOL KOLON: Profil Kartı */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="h-24 w-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">{profile.name ? profile.name.charAt(0).toUpperCase() : "A"}</div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name || "Kullanıcı"}</h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              
              {/* BİYOGRAFİ BURADA GÖRÜNECEK */}
              {profile.bio && <div className={`mt-4 p-3 rounded-xl text-sm italic ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>"{profile.bio}"</div>}
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{darkMode ? <Sun size={20}/> : <Moon size={20}/>} Görünüm</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{darkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${darkMode ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"></div>
                </button>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-8 rounded-3xl border shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}><User size={20} className="text-blue-600"/> Profil Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-500 mb-2">Ad Soyad</label><input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`} /></div>
                <div><label className="block text-sm font-bold text-gray-500 mb-2">E-Posta</label><input type="email" value={profile.email} disabled className={`w-full p-3 rounded-xl border outline-none opacity-60 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-500 mb-2">Biyografi</label><textarea rows={4} placeholder="Kendinden bahset..." value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`}></textarea></div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                {showSuccess && <span className="text-green-600 font-bold flex items-center text-sm animate-pulse"><CheckCircle size={16} className="mr-1"/> Kaydedildi!</span>}
                <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">{isLoading ? "Kaydediliyor..." : <><Save size={18}/> Kaydet</>}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;