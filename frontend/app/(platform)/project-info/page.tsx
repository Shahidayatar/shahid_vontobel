import { ProjectInfoView } from "@/components/project-info/ProjectInfoView";
import { AppShell } from "@/layout/AppShell";

export default function ProjectInfoPage() {
  return (
    <AppShell title="Project Info" subtitle="Architecture, infrastructure, CI/CD, and how this platform was built.">
      <ProjectInfoView />
    </AppShell>
  );
}
