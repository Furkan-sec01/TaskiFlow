import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// --- Sayfa Importları ---
// Genel Sayfalar
import Index from "./pages/Index";
import Features from "./pages/Features";
import Solutions from "./pages/Solutions";
import Plans from "./pages/Plans";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import OrganizationDetail from "./pages/OrganizationDetail"; 


// Auth (Giriş/Kayıt) Sayfaları
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";

// Panel (Dashboard) Sayfaları
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Roadmap from "./pages/Roadmap";
import Proje from './pages/Proje'
import Members from "./pages/Members";


// Components
import Footer from "./components/Footer";
import Layout from "./components/Layout"; // ← YENİ (1)
import Projelerim from "./pages/Projelerim";

// Landing sayfaları için Footer sarmalayıcı
function WithFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* Ana Sayfa ve Landing Sayfaları — Footer var, Sidebar yok */}

          
          <Route path="/" element={<WithFooter><Index /></WithFooter>} />
          <Route path="/features" element={<WithFooter><Features /></WithFooter>} />
          <Route path="/solutions" element={<WithFooter><Solutions /></WithFooter>} />
          <Route path="/plans" element={<WithFooter><Plans /></WithFooter>} />
          <Route path="/resources" element={<WithFooter><Resources /></WithFooter>} />
          <Route path="/contact" element={<WithFooter><Contact /></WithFooter>} />
          <Route path="/terms" element={<WithFooter><Terms /></WithFooter>} />
          <Route path="/privacy" element={<WithFooter><Privacy /></WithFooter>} />
          <Route path="/payment" element={<WithFooter><Payment /></WithFooter>} />
          <Route path="/payment-success" element={<WithFooter><PaymentSuccess /></WithFooter>} />

          {/* Kimlik Doğrulama — Sidebar yok, Footer yok */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />


          {/* Yönetim Paneli — Sidebar VAR */}
          <Route element={<Layout />}>
          <Route path="/inbox" element={<Notifications />} /> 
          <Route path="/members" element={<Members />} />
          <Route path="/projects" element={<Proje />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} /> {/* Eğer genel görevler sayfan varsa burası kalsın */}
            
            {/* YENİ EKLENEN ROTA: Proje Detay / Kanban Sayfası */}
            <Route path="/projects/:projectId" element={<Proje />} />
            
            <Route path="/team" element={<Team />} />
            <Route path="/organization/:orgId" element={<OrganizationDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/test-projelerim" element={<Projelerim />} />
          </Route>

        </Routes>

              
            

        

      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;