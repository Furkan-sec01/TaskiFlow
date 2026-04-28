import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { LayoutDashboard, CheckSquare, Users, Settings, Moon, Sun, Save, User, CheckCircle, BarChart2} from "lucide-react";

const SettingsPage = () => {
  const { darkMode, setDarkMode } = useTheme();
  
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    id: number | null;
  }>({
    name: "",
    email: "", 
    id: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verileri Çek
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/users/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Veri çekilemedi");
        return res.json();
      })
      .then(data => {
        if(!data.error) {
          setProfile({ 
            name: data.name || "", 
            email: data.email || "", 
            id: data.id 
          });
        }
      })
      .catch(err => console.error("Hata:", err));
  }, []);

  // Kaydet
  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: profile.name }) // Sadece name gönderiyoruz
      });

      const data = await res.json();

      if (res.ok) {
        // LocalStorage güncelle
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, name: profile.name }));
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(data.error || "Güncelleme başarısız.");
      }
    } catch (error) {
      alert("Sunucu hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      

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
              
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Ad Soyad</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">E-Posta</label>
                    <input type="email" value={profile.email} disabled className={`w-full p-3 rounded-xl border outline-none opacity-60 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`} />
                </div>
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