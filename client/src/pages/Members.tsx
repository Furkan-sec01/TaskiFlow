import { useState, useEffect } from "react";
import { Users, Mail, Shield, Crown, Search } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      const orgId = user.organizationId || localStorage.getItem("activeOrgId");

      if (orgId) {
        fetch(`http://localhost:5000/api/organizations/${orgId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setMembers(Array.isArray(data) ? data : data.members || []);
            setLoading(false);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const getRoleIcon = (role: string) => {
    if (role === "OWNER") return <Crown size={14} className="text-yellow-500" />;
    if (role === "ADMIN") return <Shield size={14} className="text-blue-500" />;
    return <Users size={14} className="text-gray-400" />;
  };

  const getRoleBadge = (role: string) => {
    if (role === "OWNER") return "bg-yellow-100 text-yellow-700";
    if (role === "ADMIN") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-[#F3F4F6] min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Üyeler</h1>
              <p className="text-sm text-gray-400">{members.length} üye</p>
            </div>
          </div>
        </div>

        {/* Arama */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Üye bulunamadı</p>
            </div>
          ) : (
            filtered.map((member, i) => (
              <div
                key={member.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                  i !== filtered.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(member.name || member.email)}
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{member.name || "—"}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Mail size={12} />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>

                {/* Rol */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                  {getRoleIcon(member.role)}
                  {member.role}
                </div>

                {/* Durum */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  member.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {member.status === "active" ? "Aktif" : "Pasif"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Members;