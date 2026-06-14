"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PROJECTS, DEFAULT_PROJECT_ID } from "@/lib/mock/data";
import type { Project } from "@/lib/types";

interface ProjectContextValue {
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;
  setActiveProjectId: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState(DEFAULT_PROJECT_ID);
  const activeProject =
    PROJECTS.find((p) => p.id === activeProjectId) ?? PROJECTS[0];

  return (
    <ProjectContext.Provider
      value={{ projects: PROJECTS, activeProjectId, activeProject, setActiveProjectId }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
