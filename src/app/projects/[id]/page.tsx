import { getProjectById } from "@/lib/projects";
import { getTasksByProjectId } from "@/lib/tasks";
import { getSections } from "@/lib/sections";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Github, Globe, ArrowLeft, Clock, CheckCircle2, AlertCircle, Layers, Rocket, Settings } from "lucide-react";
import Link from "next/link";
import { ProjectTasks } from "./ProjectTasks";
import { Separator } from "@/components/ui/separator";
import { ImportTasksDialog } from "./ImportTasksDialog";
import { getAssetsByProjectId } from "@/lib/assets";
import { AssetsTab } from "./assets/AssetsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";
import { fetchDeployments, fetchProjects, VercelDeployment, VercelProject } from "@/lib/vercel";
import { DeploymentsTab } from "./deployments/DeploymentsTab";
import { ProjectSettings } from "./settings/ProjectSettings";

import { ShareProjectButton } from "@/components/ShareProjectButton";
import { RepositoryTab } from "./repository/RepositoryTab";
import { VersionsTab } from "./VersionsTab";
import { getProjectVersions } from "@/lib/projectVersions";
import { getSetting } from "@/lib/settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProjectPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    // Fetch related tasks and assets
    const tasks = await getTasksByProjectId(id);
    const sections = await getSections(id);
    const assets = await getAssetsByProjectId(id);

    // Fetch Vercel deployments if configured
    let deployments: VercelDeployment[] = [];
    let latestDeploymentStatus = null;
    let vercelProjects: VercelProject[] = [];

    // Always fetch available projects for the settings dropdown
    try {
        vercelProjects = await fetchProjects();
    } catch (error) {
        console.error("Failed to fetch Vercel projects list:", error);
    }

    const allTasksDone = tasks.length > 0 && tasks.every((task) => task.status === "Done");
    let showVersionSuggestion = false;

    if (allTasksDone) {
        const [suggestSetting, versions] = await Promise.all([
            getSetting("automation_suggest_version_on_all_done"),
            getProjectVersions(id),
        ]);

        const suggestEnabled = suggestSetting !== "false";
        showVersionSuggestion = suggestEnabled && versions.length === 0;
    }

    if (project.vercel_project_id) {
        try {
            deployments = await fetchDeployments(project.vercel_project_id);
            if (deployments.length > 0) {
                latestDeploymentStatus = deployments[0].state;
            }
        } catch (error) {
            console.error("Failed to fetch Vercel deployments:", error);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "text-green-500 border-green-500 bg-green-500/10";
            case "Done": return "text-blue-500 border-blue-500 bg-blue-500/10";
            case "Idea": return "text-purple-500 border-purple-500 bg-purple-500/10";
            case "On Hold": return "text-orange-500 border-orange-500 bg-orange-500/10";
            default: return "text-muted-foreground border-muted-foreground bg-muted";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "bg-red-500/10 text-red-600 border-red-200";
            case "High": return "bg-orange-500/10 text-orange-600 border-orange-200";
            case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
            case "Low": return "bg-green-500/10 text-green-600 border-green-200";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const getDeploymentStatusColor = (state: string) => {
        switch (state) {
            case "READY": return "bg-green-500/10 text-green-600 border-green-200";
            case "ERROR": return "bg-red-500/10 text-red-600 border-red-200";
            case "BUILDING": return "bg-blue-500/10 text-blue-600 border-blue-200";
            default: return "bg-gray-500/10 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-6xl">
            <div className="relative mb-12 rounded-3xl overflow-hidden border bg-background/50 shadow-2xl">
                {/* Dynamic Gradient Background */}
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${project.status === 'In Progress' ? 'from-blue-500 via-purple-500 to-pink-500' :
                    project.status === 'Done' ? 'from-green-400 via-emerald-500 to-teal-500' :
                        project.status === 'Idea' ? 'from-yellow-400 via-orange-500 to-red-500' :
                            'from-gray-400 via-gray-500 to-gray-600'
                    }`} />

                <div className="relative p-8 md:p-10 backdrop-blur-sm">
                    <Button variant="ghost" size="sm" asChild className="mb-8 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors">
                        <Link href="/projects">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Link>
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className={`text-sm font-medium px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </Badge>
                                {latestDeploymentStatus && (
                                    <Badge variant="outline" className={`text-sm font-medium px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${getDeploymentStatusColor(latestDeploymentStatus)}`}>
                                        <Rocket className="mr-1.5 h-3 w-3" />
                                        {latestDeploymentStatus}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                {project.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center px-3 py-1.5 rounded-full bg-background/40 border backdrop-blur-sm">
                                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                                    Created {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Unknown'}
                                </div>
                                {project.timeline && (
                                    <div className="flex items-center px-3 py-1.5 rounded-full bg-background/40 border backdrop-blur-sm">
                                        <Clock className="mr-2 h-4 w-4 text-primary" />
                                        Target: {new Date(project.timeline).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <ShareProjectButton projectId={project.id} />
                            {project.github_repo && (
                                <>
                                    <ImportTasksDialog projectId={project.id} githubRepo={project.github_repo} />
                                    <Button variant="outline" size="lg" className="rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300" asChild>
                                        <a href={project.github_repo} target="_blank" rel="noopener noreferrer">
                                            <Github className="mr-2 h-5 w-5" />
                                            Repository
                                        </a>
                                    </Button>
                                </>
                            )}
                            {project.api_endpoint && (
                                <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:scale-105" asChild>
                                    <a href={project.api_endpoint} target="_blank" rel="noopener noreferrer">
                                        <Globe className="mr-2 h-5 w-5" />
                                        Live Demo
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {project.description || "No description provided for this project."}
                            </p>
                        </div>
                    </section>

                    <Separator />

                    <section className="space-y-6">
                        {showVersionSuggestion && (
                            <Alert className="border-dashed border-primary/40 bg-primary/5">
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>All tasks are done</AlertTitle>
                                <AlertDescription>
                                    Capture the current state as a project version snapshot.
                                    You can create a version from the Repository tab using the
                                    commit history, or from the Versions tab.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Tabs defaultValue="tasks" className="w-full">
                            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
                                <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-full border">
                                    <TabsTrigger value="tasks" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Layers className="h-4 w-4 mr-2" />
                                        Tasks
                                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[1.25rem] bg-primary/10 text-primary">{tasks.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="assets" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Database className="h-4 w-4 mr-2" />
                                        Assets
                                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[1.25rem] bg-primary/10 text-primary">{assets.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="deployments" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Rocket className="h-4 w-4 mr-2" />
                                        Deploys
                                    </TabsTrigger>
                                    <TabsTrigger value="versions" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Layers className="h-4 w-4 mr-2" />
                                        Versions
                                    </TabsTrigger>
                                    <TabsTrigger value="repository" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Github className="h-4 w-4 mr-2" />
                                        Repository
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 py-2.5">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="mt-8 min-h-[500px]">
                                <TabsContent value="tasks" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    <ProjectTasks tasks={tasks} sections={sections} projectId={project.id} projectName={project.name} workflow={project.workflow} />
                                </TabsContent>
                                <TabsContent value="assets" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    <AssetsTab assets={assets} projectId={project.id} />
                                </TabsContent>
                                <TabsContent value="deployments" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    <DeploymentsTab deployments={deployments} projectId={project.vercel_project_id} />
                                </TabsContent>
                                <TabsContent value="versions" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    <VersionsTab projectId={project.id} repoUrl={project.github_repo} />
                                </TabsContent>
                                <TabsContent value="repository" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    {project.github_repo ? (
                                        <RepositoryTab repoUrl={project.github_repo} projectId={project.id} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/10 border-dashed">
                                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                                                <Github className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">No Repository Linked</h3>
                                            <p className="text-muted-foreground max-w-sm">
                                                Link a GitHub repository in the project settings to view stats, commits, and issues.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="settings" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                    <ProjectSettings project={project} vercelProjects={vercelProjects} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-3xl border bg-card/50 backdrop-blur-xl text-card-foreground shadow-xl space-y-8 sticky top-24 transition-all hover:shadow-2xl duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Project Details</h3>
                                <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-3 border-b border-border/50">
                                    <span className="text-sm font-medium text-muted-foreground">Priority</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${getPriorityColor(project.priority || 'Medium')}`}>
                                        {project.priority || 'Medium'}
                                    </span>
                                </div>

                                <div className="space-y-3 py-2 border-b border-border/50">
                                    <div className="flex justify-between text-sm items-end">
                                        <span className="font-medium text-muted-foreground">Progress</span>
                                        <span className="font-bold text-2xl text-primary">{project.progress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 py-2">
                                    <span className="text-sm font-medium text-muted-foreground block">Tech Stack</span>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack?.length > 0 ? (
                                            project.tech_stack.map((tech, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 text-xs font-medium bg-secondary/50 hover:bg-secondary hover:scale-105 transition-all duration-300 cursor-default border-transparent hover:border-primary/20"
                                                >
                                                    {tech}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic text-sm">No tech stack specified.</p>
                                        )}
                                    </div>
                                </div>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="space-y-4 py-4 border-t border-border/50">
                                        <span className="text-sm font-medium text-muted-foreground block">Tags</span>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs font-normal text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
