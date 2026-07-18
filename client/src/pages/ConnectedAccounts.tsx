import React, { useEffect, useState } from "react";
import { Link2, CheckCircle2 } from "lucide-react";

type ProviderKey = "google" | "microsoft" | "github";

type Provider = {
  key: ProviderKey;
  name: string;
  description: string;
  icon: string;
};

const PROVIDERS: Provider[] = [
  { key: "google", name: "Google", description: "Google hesabınızla tek tıkla giriş yapın", icon: "🔵" },
  { key: "microsoft", name: "Microsoft", description: "Microsoft / Outlook hesabınızı bağlayın", icon: "🟦" },
  { key: "github", name: "GitHub", description: "GitHub hesabınızı bağlayarak projelerinizi senkronize edin", icon: "⬛" },
];

const STORAGE_KEY = "connectedAccounts";

const ConnectedAccounts: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [connected, setConnected] = useState<Record<ProviderKey, boolean>>({
    google: false,
    microsoft: false,
    github: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.email) setUserEmail(data.email);
        })
        .catch((err) => console.error("Kullanıcı bilgisi alınamadı:", err));
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setConnected(JSON.parse(saved));
    } catch (err) {
      console.error("Bağlı hesap bilgisi okunamadı:", err);
    }
  }, []);

  const toggleProvider = (key: ProviderKey) => {
    setConnected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Bağlı Hesaplar
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {userEmail
            ? `${userEmail} hesabına bağlı üçüncü parti girişleri yönetin.`
            : "Üçüncü parti hesaplarınızı yönetin."}
        </p>

        <ul className="space-y-4">
          {PROVIDERS.map((provider) => {
            const isConnected = connected[provider.key];
            return (
              <li
                key={provider.key}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full text-2xl bg-gray-100 dark:bg-gray-700">
                    {provider.icon}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">
                        {provider.name}
                      </p>
                      {isConnected && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 size={14} /> Bağlı
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <button
                  className={`mt-3 sm:mt-0 sm:ml-4 px-4 py-2 rounded-lg border text-sm font-semibold transition flex items-center gap-2 ${
                    isConnected
                      ? "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-700 dark:hover:text-white"
                      : "border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-700 dark:hover:text-white"
                  }`}
                  onClick={() => toggleProvider(provider.key)}
                >
                  {!isConnected && <Link2 size={14} />}
                  {isConnected ? "Bağlantıyı Kaldır" : "Bağla"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
