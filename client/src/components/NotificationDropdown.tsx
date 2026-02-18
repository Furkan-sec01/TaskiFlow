import { useState, useEffect } from "react";
import { Bell, Check, X, Info, Sparkles } from "lucide-react";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (error) {
      console.error("Bildirimler çekilemedi:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (notificationId: string, action: "ACCEPT" | "REJECT") => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications/respond-invite", { // Backend route isminle (respond-invite) eşleştiğinden emin ol
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId, action })
      });

      const data = await res.json(); // Backend'den gelen yanıtı (mesaj ve token) alıyoruz

      if (res.ok) {
        // 1. Bildirimi arayüzden kaldır
        setNotifications(prev => prev.filter(n => n.id !== notificationId));

        if (action === "ACCEPT" && data.token) {
          // 🔥 KRİTİK NOKTA: Eski token'ın üzerine yenisini yazıyoruz!
          localStorage.setItem("token", data.token);
          
          // Opsiyonel: Eğer user objesini de localStorage'da tutuyorsan onu da güncellemen iyi olur
          // Örn: const user = JSON.parse(localStorage.getItem("user") || "{}");
          // user.organizationId = data.newOrganizationId; // Backend'den geliyorsa
          // localStorage.setItem("user", JSON.stringify(user));

          // Sayfayı yenile ki yeni token ile tüm Context/State baştan kurulsun
          window.location.reload();
        } else if (action === "ACCEPT") {
             // Eğer ACCEPT dedik ama token gelmediyse (hata durumu)
             console.error("Yeni token alınamadı.");
        }
      } else {
        alert(data.error || "İşlem başarısız.");
      }
    } catch (error) {
      console.error("İşlem sırasında hata oluştu:", error);
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-[1000] translate-x-3">
      
      {/* ZİL İKONU */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative p-2.5 rounded-2xl transition-all duration-300 ${
          isOpen 
          ? 'bg-blue-50 text-blue-600 shadow-inner' 
          : 'hover:bg-white text-gray-500 hover:text-blue-500 shadow-sm'
        }`}
      >
        <Bell size={24} className={`transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:rotate-12'}`} />
        
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Panel Header */}
            <div className="p-7 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br from-gray-50/50 to-white/50">
              <div>
                <h3 className="font-black text-gray-900 text-lg tracking-tight">Bildirimler</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Sana Özel Mesajlar</p>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-100">
                  <Sparkles size={12} />
                  {notifications.length} Yeni
                </div>
              )}
            </div>

            {/* Bildirim Listesi */}
            <div className="max-h-[30rem] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300">
                    <Info size={36} />
                  </div>
                  <p className="text-gray-600 font-bold">Harika! Her şey yolunda.</p>
                  <p className="text-gray-400 text-xs mt-2 italic">Yeni bildirimler buraya düşecek.</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="group p-5 rounded-[1.5rem] hover:bg-blue-50/40 transition-all duration-300 border border-transparent hover:border-blue-100">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">{n.title}</h4>
                          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{n.message}</p>
                        </div>
                        <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5"></span>
                      </div>
                      
                      {n.type === "ORG_INVITE" && (
                        <div className="flex gap-3 mt-5">
                          <button 
                            disabled={loading}
                            onClick={() => handleAction(n.id, "ACCEPT")}
                            className="flex-1 bg-gray-900 hover:bg-blue-600 text-white text-xs py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-blue-200"
                          >
                            <Check size={14} strokeWidth={3} /> Katıl
                          </button>
                          <button 
                            disabled={loading}
                            onClick={() => handleAction(n.id, "REJECT")}
                            className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                            <X size={14} strokeWidth={3} /> Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Footer */}
            {notifications.length > 0 && (
              <div className="p-5 bg-gray-50/50 border-t border-gray-100 text-center text-[10px] font-black text-gray-400 hover:text-blue-600 cursor-pointer transition-colors uppercase tracking-[0.2em]">
                Tümünü Temizle
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;