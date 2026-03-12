import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  id: string | number;
  title: string;
  description: string;
  members?: Member[];
  organization?: {
    id?: string;
    name: string;
  };
}

const ExportProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Giriş yapmanız gerekiyor.");

        const response = await fetch("http://localhost:5000/api/project/my-projects", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Projeler alınamadı.");

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Projeleriniz", 14, 20);
    doc.setFontSize(12);

    let y = 30;
    projects.forEach((p, index) => {
      doc.text(`${index + 1}. ${p.title}`, 14, y);
      y += 7;
      doc.text(`Açıklama: ${p.description || "Yok"}`, 14, y);
      y += 7;
      doc.text(`Üyeler: ${(p.members || []).map(m => m.name).join(", ") || "Yok"}`, 14, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("projects.pdf");
  };

  const handleExport = (format: "json" | "csv" | "pdf") => {
    if (projects.length === 0) return;
    setExporting(format);

    setTimeout(() => {
      if (format === "json") {
        downloadFile(JSON.stringify(projects, null, 2), "projects.json", "application/json");
      } else if (format === "csv") {
        const headers = ["ID", "Title", "Description", "Members"];
        const rows = projects.map(p => [
          p.id,
          `"${p.title}"`,
          `"${p.description}"`,
          `"${(p.members || []).map(m => m.name).join("; ")}"`
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        downloadFile(csvContent, "projects.csv", "text/csv");
      } else if (format === "pdf") {
        exportPDF();
      }

      setExporting(null);
    }, 500);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projeleri Dışa Aktar</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Projelerinizi yedeklemek veya başka bir araca taşımak için dışa aktarabilirsiniz.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-200/50 dark:bg-gray-700/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-red-500 text-center mb-6">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-400 text-center mb-6">
            Görüntülenecek proje bulunamadı.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {projects.map((project) => (
              <li
                key={project.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {project.description || "Açıklama yok."}
                  </p>
                </div>
                <div className="mt-4 text-xs text-gray-400 dark:text-gray-300">
                  Üyeler: {project.members?.length || 0}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          {["json", "csv", "pdf"].map((format) => (
            <button
              key={format}
              disabled={!!exporting || projects.length === 0}
              onClick={() => handleExport(format as "json" | "csv" | "pdf")}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
                exporting === format
                  ? "bg-gray-400 cursor-not-allowed"
                  : format === "json"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : format === "csv"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {exporting === format
                ? `Dışa aktarılıyor (${format.toUpperCase()})...`
                : format === "pdf"
                ? "PDF Olarak Dışa Aktar"
                : `Dışa Aktar (${format.toUpperCase()})`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportProjects;