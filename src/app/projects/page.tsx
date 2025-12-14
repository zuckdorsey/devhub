import { getProjects } from "@/lib/projects";
import { ProjectCardActions } from "./ProjectCardActions";
import { CreateProjectButton } from "./CreateProjectButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Github, FolderKanban, CheckCircle2, Lightbulb, Clock } from "lucide-react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let error = null;

  try {
    projects = await getProjects();
  } catch (e) {
    error = "Failed to load projects from database.";
    console.error(e);
  }

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "In Progress").length;
  const completedProjects = projects.filter(p => p.status === "Done").length;
  const ideaProjects = projects.filter(p => p.status === "Idea").length;

  const stats = [
    { label: "Total", value: totalProjects, icon: FolderKanban, color: "text-primary" },
    { label: "Active", value: activeProjects, icon: Clock, color: "text-green-500" },
    { label: "Completed", value: completedProjects, icon: CheckCircle2, color: "text-blue-500" },
    { label: "Ideas", value: ideaProjects, icon: Lightbulb, color: "text-purple-500" },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Projects
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and track your development projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/projects/import">
              <Github className="h-4 w-4" />
              Import from GitHub
            </Link>
          </Button>
          <CreateProjectButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-shadow"
          >
            <div className={`p-2.5 rounded-lg bg-muted/50 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border-dashed">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-5 rounded-2xl mb-6">
            <FolderKanban className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Create your first project to start tracking your progress and managing your development workflow.
          </p>
          <CreateProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCardActions key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
