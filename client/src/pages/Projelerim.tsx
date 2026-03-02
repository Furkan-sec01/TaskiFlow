import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  id: string | number;
  title: string;
  description: string;
  organization?: {
    id?: string;
    name: string;
  };
  members?: Member[];
}

const getTeamColor = (teamName: string) => {
  const colors = [
    "bg-blue-50 text-blue-600 border-blue-100",
    "bg-purple-50 text-purple-600 border-purple-100",
    "bg-green-50 text-green-600 border-green-100",
    "bg-amber-50 text-amber-600 border-amber-100",
    "bg-pink-50 text-pink-600 border-pink-100",
  ];

  let hash = 0;
  const name = teamName || "Genel";
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();

  const displayTeam = project.organization?.name || "Genel Ekip";
  const teamStyle = getTeamColor(displayTeam);
  const projectMembers = project.members || [];

  const handleGoProject = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 border border-gray-100 flex flex-col h-full relative overflow-hidden">
      
      <div className="flex flex-col mb-5">
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${teamStyle}`}>
            {displayTeam}
          </div>
        </div>
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {project.title || "İsimsiz Proje"}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {project.description || "Detay açıklaması girilmemiş."}
        </p>
      </div>

      <div className="mt-8 pt-5 border-t border-gray-50 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {projectMembers.length > 0 ? (
            projectMembers.slice(0, 3).map((member, index) => (
              <div 
                key={member.id || index}
                title={member.name}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 cursor-help"
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              </div>
            ))
          ) : (
            <div className="text-[10px] text-gray-400 italic">Üye atanmadı</div>
          )}

          {projectMembers.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-500">
              +{projectMembers.length - 3}
            </div>
          )}
        </div>

        <button
          onClick={handleGoProject}
          className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-md active:scale-95"
        >
          Projeye Git
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Projelerim: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Giriş yapmanız gerekiyor.");

        const response = await fetch(
          "http://localhost:5000/api/project/my-projects",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Veriler alınamadı.");

        const data = await response.json();
        const finalData = data.projects || [];

        setProjects(finalData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 min-h-screen bg-[#FAFAFB]">
      <header className="text-center mb-14">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Projelerim
        </h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Yönettiğiniz veya dahil olduğunuz aktif işler
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-60 bg-gray-200/50 animate-pulse rounded-2xl"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-white border border-red-100 rounded-3xl shadow-sm max-w-md mx-auto">
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 text-sm">
          Görüntülenecek proje bulunamadı.
        </div>
      )}
    </div>
  );
};

export default Projelerim;