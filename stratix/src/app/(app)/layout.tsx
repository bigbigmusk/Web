import { ProjectProvider } from "@/components/project-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
