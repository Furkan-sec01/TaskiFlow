import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const userId = user.id || user.user?.id;
        if (userId) {
          fetch(`http://localhost:5000/api/notifications?userId=${userId}`)
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error(err));
        }
      } catch (error) {
        console.error("Kullanıcı bilgisi parse hatası:", error);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-800 font-sans">
      
      

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {notifications.length} Yeni
            </span>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                
                {/* İKON SEÇİMİ */}
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                    notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {notif.type === 'success' ? <CheckCircle size={24}/> : 
                   notif.type === 'alert' ? <AlertTriangle size={24}/> : <Info size={24}/>}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{notif.title}</h3>
                    <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-gray-500 mt-1">{notif.message}</p>
                </div>

                <div className="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-10 text-gray-400">Hiç bildirim yok.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;