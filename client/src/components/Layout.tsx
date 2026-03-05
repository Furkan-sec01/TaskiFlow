import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../context/ThemeContext";

export default function Layout() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}