import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 👇 1. ADIM: Mavi Logoyu buradan çağırıyoruz
import Logo from "../components/Logo"; 

const Login = () => {
  // State Tanımları
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  // 👇 Giriş Yap butonuna basınca çalışacak fonksiyon
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Backend'e istek at
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Backend'den dönen user objesini kaydet (data.user veya data)
        const userData = data.user || data;
        localStorage.setItem("user", JSON.stringify(userData)); 
        
        // Dashboard'a yönlendir
        navigate("/dashboard");
        
        // Sayfayı yenile ki Navbar'daki "Giriş Yap" butonu değişsin ve kullanıcı verisi yüklensin
        window.location.reload(); 
      } else {
        alert(data.error || "Giriş başarısız! E-posta veya şifre hatalı.");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Sunucuyla bağlantı kurulamadı.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      {/* Kart Yapısı */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        {/* Başlık ve Logo Kısmı */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* 🔥 LOGO BURADA */}
          <div className="mb-4 transform scale-90">
            <Logo />
          </div>
          <p className="text-gray-500 font-medium">Hesabınıza giriş yapın</p>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* E-posta Input */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              placeholder="ornek@email.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Şifre Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">
                Şifre
              </label>
              {/* Şimdilik görsel link, backend'i olmasa da profesyonel durur */}
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
                Şifremi unuttum?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Giriş Yap Butonu */}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition duration-200 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Giriş Yap
          </button>

        </form>

        {/* Alt Link (Kayıt Ol) */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Henüz bir hesabın yok mu?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Kayıt ol
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;