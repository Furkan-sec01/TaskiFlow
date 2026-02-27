import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// --- Sayfa Importları ---
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

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Proje from './pages/Proje';
import Members from "./pages/Members";
import Projelerim from "./pages/Projelerim";

import Footer from "./components/Footer";
import Layout from "./components/Layout";

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

          {/* Landing Sayfaları */}
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

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />

          {/* Panel — Sidebar VAR */}
          <Route element={<Layout />}>
            <Route path="/inbox" element={<Notifications />} />
            <Route path="/members" element={<Members />} />
            <Route path="/projects" element={<Projelerim />} />
            <Route path="/projects/:projectId" element={<Proje />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/team" element={<Team />} />
            <Route path="/teams/:id" element={<OrganizationDetail />} />
            <Route path="/organization/:orgId" element={<OrganizationDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/test-projelerim" element={<Projelerim />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;