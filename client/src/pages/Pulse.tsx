import React from "react";
import { Activity, Bell, TrendingUp, Users } from "lucide-react";

const mockUsers = [
  { name: "Ali", tasks: 12, completed: 8, avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Ayşe", tasks: 15, completed: 14, avatar: "https://i.pravatar.cc/40?img=2" },
  { name: "Mehmet", tasks: 10, completed: 5, avatar: "https://i.pravatar.cc/40?img=3" },
];

const Pulse = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
       
    
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sol Sütun: Haftanın Nabzı */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg">Haftanın Nabzı</h2>
            
            {mockUsers.map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-slate-700">{user.name}</p>
                    <p className="text-sm text-slate-500">
                      Görevler: {user.completed}/{user.tasks} tamamlandı
                    </p>
                  </div>
                </div>
                <Activity size={20} className="text-slate-400" />
              </div>
            ))}

          </div>

       
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg">Toplam Görevler</h2>
            <p className="text-3xl font-bold text-slate-800">37</p>
            <p className="text-sm text-slate-500 mt-1">Bu hafta tamamlanan görevler</p>
          </div>
        </div>

        {/* Sağ Sütun: Grafik ve Akış */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <TrendingUp size={18} /> Proje Hızı ve Tamamlanma
            </h2>
            <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed rounded-lg">
              {/* Buraya Recharts gelecek */}
              Grafik buraya gelecek
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <Users size={18} /> En Aktif Kullanıcılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-700">{user.name}</p>
                      <p className="text-sm text-slate-500">
                        {user.completed}/{user.tasks} tamamlandı
                      </p>
                    </div>
                  </div>
                  <Activity size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pulse;