import { currentUser, projects as mockProjects, stats as mockStats } from "../data/mockData";
import SummaryStats from "../components/SummaryStats";
import ProjectCard from "../components/ProjectCard";
import { sql } from "../lib/db";
import { Project, Stats } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to ensure we get fresh data
export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    const data = await sql`
      SELECT * FROM projects 
      ORDER BY created_at DESC
    `;

    return data as Project[];
  } catch (e) {
    console.error("Error fetching projects:", e);
    return null;
  }
}

function calculateStats(projects: Project[]): Stats {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Active").length,
    completedProjects: projects.filter((p) => p.status === "Done").length,
    ideaProjects: projects.filter((p) => p.status === "Idea").length,
  };
}

export default async function Home() {
  const dbProjects = await getProjects();

  // Fallback to mock data if DB connection fails or returns no data (for demo purposes)
  const projects = (dbProjects && dbProjects.length > 0) ? dbProjects : mockProjects;
  const stats = (dbProjects && dbProjects.length > 0) ? calculateStats(dbProjects) : mockStats;

  // Get recent projects (first 3-5)
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8 p-4 md:p-8 pt-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser.name}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
        {!dbProjects && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Could not connect to Neon database. Showing mock data. Check your DATABASE_URL environment variable.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Section */}
      <SummaryStats stats={stats} />

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
