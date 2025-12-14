import { projects as mockProjects, stats as mockStats } from "../data/mockData";
import SummaryStats from "../components/SummaryStats";
import ProjectCard from "../components/ProjectCard";
import { sql } from "../lib/db";
import { Project, Stats } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus, ArrowRight, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { WakaTimeStats } from "@/components/dashboard/WakaTimeStats";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { IssuesSummary } from "@/components/dashboard/IssuesSummary";
import { auth } from "@/auth";
import { getSetting } from "@/lib/settings";
import { getTasks } from "@/lib/tasks";
import { getProjects } from "@/lib/projects";
import { fetchIssuesAndPRs } from "@/lib/github";

// Force dynamic rendering to ensure we get fresh data
export const dynamic = "force-dynamic";

async function getDbProjects() {
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
    activeProjects: projects.filter((p) => p.status === "In Progress").length,
    completedProjects: projects.filter((p) => p.status === "Done").length,
    ideaProjects: projects.filter((p) => p.status === "Idea").length,
  };
}

async function getIssuesByProject() {
  try {
    const projects = await getProjects();
    const projectsWithRepo = projects.filter(p => p.github_repo);

    const issuesByProject = await Promise.all(
      projectsWithRepo.slice(0, 5).map(async (project) => {
        try {
          if (!project.github_repo) return { project: { id: project.id, name: project.name }, issues: [] };
          const url = new URL(project.github_repo);
          const pathParts = url.pathname.split("/").filter(Boolean);
          if (pathParts.length < 2) return { project: { id: project.id, name: project.name }, issues: [] };

          const [owner, repo] = pathParts;
          const issues = await fetchIssuesAndPRs(owner, repo);
          return { project: { id: project.id, name: project.name }, issues: issues.slice(0, 10) };
        } catch (e) {
          return { project: { id: project.id, name: project.name }, issues: [] };
        }
      })
    );

    return issuesByProject;
  } catch (e) {
    console.error("Error fetching issues:", e);
    return [];
  }
}

export default async function Home() {
  const dbProjects = await getDbProjects();
  const session = await auth();
  const userName = await getSetting("user_name") || session?.user?.name || "Developer";

  // Fetch tasks and issues
  let tasks: any[] = [];
  let issuesByProject: any[] = [];

  try {
    tasks = await getTasks();
  } catch (e) {
    console.error("Error fetching tasks:", e);
  }

  try {
    issuesByProject = await getIssuesByProject();
  } catch (e) {
    console.error("Error fetching issues:", e);
  }

  // Fallback to mock data if DB connection fails or returns no data (for demo purposes)
  const projects = (dbProjects && dbProjects.length > 0) ? dbProjects : mockProjects;
  const stats = (dbProjects && dbProjects.length > 0) ? calculateStats(dbProjects) : mockStats;

  // Get recent projects (first 3-5)
  const recentProjects = projects.slice(0, 4);

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 p-4 md:p-8 pt-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-border/50">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{greeting}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              Here&apos;s what&apos;s happening with your projects today. Stay productive!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/projects?action=new">
              <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {!dbProjects && (
          <Alert variant="destructive" className="mt-6 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Connection Issue</AlertTitle>
            <AlertDescription>
              Could not connect to database. Showing demo data.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Section */}
      <SummaryStats stats={stats} />

      {/* Activity Section - Tasks, Issues, WakaTime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTasks tasks={tasks} />
        <IssuesSummary issuesByProject={issuesByProject} />
        <WakaTimeStats />
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Recent Projects
            </h2>
            <p className="text-sm text-muted-foreground">Your latest work at a glance</p>
          </div>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2 group">
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
