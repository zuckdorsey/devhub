import { getProjects } from "@/lib/projects";
import { ProjectCardActions } from "./ProjectCardActions";
import { CreateProjectButton } from "./CreateProjectButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Github } from "lucide-react";
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

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-lg">
            Manage and track your development projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/projects/import">
              <Github className="mr-2 h-4 w-4" />
              Import from GitHub
            </Link>
          </Button>
          <CreateProjectButton />
        </div>
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
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10 border-dashed">
          <div className="bg-muted p-4 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You haven't created any projects yet. Start by creating your first project to track your progress.
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
