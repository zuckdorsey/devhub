import { getProjectById } from "@/lib/projects";
import { getTasksByProjectId } from "@/lib/tasks";
import { getSections } from "@/lib/sections";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Github, Globe, ArrowLeft, Clock, Rocket, Settings, Sparkles, AlertTriangle, Layers, Database, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { ProjectTasks } from "./ProjectTasks";
import { Separator } from "@/components/ui/separator";
import { ImportTasksDialog } from "./ImportTasksDialog";
import { getAssetsByProjectId } from "@/lib/assets";
import { AssetsTab } from "./assets/AssetsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDeployments, fetchProjects, VercelDeployment, VercelProject } from "@/lib/vercel";
import { DeploymentsTab } from "./deployments/DeploymentsTab";
import { ProjectSettings } from "./settings/ProjectSettings";
import { ShareProjectButton } from "@/components/ShareProjectButton";
import { RepositoryTab } from "./repository/RepositoryTab";
import { VersionsTab } from "./VersionsTab";
import { getProjectVersions } from "@/lib/projectVersions";
import { getSetting } from "@/lib/settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
            case "Active": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
            case "Done": return "text-blue-400 border-blue-500/30 bg-blue-500/10";
            case "Idea": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
            case "On Hold": return "text-orange-400 border-orange-500/30 bg-orange-500/10";
            default: return "text-muted-foreground border-border bg-muted/50";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "High": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "Low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-muted text-muted-foreground border-transparent";
        }
    };

    const getDeploymentStatusColor = (state: string) => {
        switch (state) {
            case "READY": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "ERROR": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "BUILDING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl animate-in fade-in duration-500">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/projects" className="hover:text-foreground transition-colors flex items-center">
                    <Layers className="h-4 w-4 mr-1" />
                    Projects
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">{project.name}</span>
            </nav>

            {/* Hero Section */}
            <div className="relative mb-10 rounded-3xl overflow-hidden border bg-card/40 shadow-2xl backdrop-blur-xl">
                {/* Dynamic Gradient Background */}
                <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${project.status === 'In Progress' ? 'from-blue-500 via-indigo-500 to-transparent' :
                        project.status === 'Done' ? 'from-emerald-500 via-teal-500 to-transparent' :
                            project.status === 'Idea' ? 'from-amber-500 via-orange-500 to-transparent' :
                                'from-gray-500 via-slate-500 to-transparent'
                    }`} />

                <div className="relative p-8 md:p-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                        {/* Left Column: Title & Main Actions */}
                        <div className="flex-1 space-y-6">
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

                            <div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
                                    {project.name}
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                    {project.description || "No description provided for this project."}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <ShareProjectButton projectId={project.id} />
                                {project.github_repo ? (
                                    <>
                                        <ImportTasksDialog projectId={project.id} githubRepo={project.github_repo} />
                                        <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 hover:text-foreground transition-all" asChild>
                                            <a href={project.github_repo} target="_blank" rel="noopener noreferrer">
                                                <Github className="mr-2 h-4 w-4" />
                                                Repository
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" className="rounded-full border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground">
                                        <Github className="mr-2 h-4 w-4" />
                                        Link Repo in Settings
                                    </Button>
                                )}
                                {project.api_endpoint && (
                                    <Button className="rounded-full bg-primary/90 hover:bg-primary shadow-lg hover:shadow-primary/25 transition-all" asChild>
                                        <a href={project.api_endpoint} target="_blank" rel="noopener noreferrer">
                                            <Globe className="mr-2 h-4 w-4" />
                                            Live Demo
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Key Stats & Metadata */}
                        <div className="lg:w-80 space-y-6 bg-background/30 rounded-2xl p-6 border border-white/5 backdrop-blur-md">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Progress</span>
                                    <span className="text-foreground font-bold">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Priority</span>
                                    <Badge variant="outline" className={`w-fit px-3 py-1 rounded-md ${getPriorityColor(project.priority || 'Medium')}`}>
                                        {project.priority || 'Medium'}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Timeline</span>
                                    <div className="flex items-center text-sm font-medium">
                                        <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-3">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tech Stack</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tech_stack?.length > 0 ? (
                                        project.tech_stack.slice(0, 5).map((tech, i) => (
                                            <Badge key={i} variant="secondary" className="bg-background/50 hover:bg-background/80 text-xs px-2.5 py-0.5 border border-white/5">
                                                {tech}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">None defined</span>
                                    )}
                                    {project.tech_stack?.length > 5 && (
                                        <Badge variant="secondary" className="bg-background/50 text-xs px-2.5 py-0.5">+{project.tech_stack.length - 5}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Version Suggestion Alert */}
            {showVersionSuggestion && (
                <Alert className="mb-8 border-primary/20 bg-primary/5 rounded-xl">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary font-medium">Ready for Release?</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        All tasks are complete! Consider creating a <strong>version snapshot</strong> to document this milestone.
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Tabs Navigation */}
            <Tabs defaultValue="tasks" className="w-full space-y-6">
                <div className="sticky top-4 z-40 bg-background/80 backdrop-blur-xl rounded-full border border-border/50 shadow-sm p-1.5 mb-8 max-w-fit mx-auto md:mx-0">
                    <TabsList className="h-10 bg-transparent gap-1">
                        <TabsTrigger value="tasks" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Layers className="h-4 w-4 mr-2" />
                            Tasks
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[1.25rem] bg-primary/20 text-primary hover:bg-primary/20">{tasks.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="repository" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Github className="h-4 w-4 mr-2" />
                            Repository
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Database className="h-4 w-4 mr-2" />
                            Assets
                        </TabsTrigger>
                        <TabsTrigger value="versions" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Clock className="h-4 w-4 mr-2" />
                            Versions
                        </TabsTrigger>
                        <TabsTrigger value="deployments" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Rocket className="h-4 w-4 mr-2" />
                            Deployments
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-full px-5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-all">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="min-h-[500px]">
                    <TabsContent value="tasks" className="space-y-6 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <ProjectTasks tasks={tasks} sections={sections} projectId={project.id} projectName={project.name} workflow={project.workflow} />
                    </TabsContent>
                    <TabsContent value="repository" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {project.github_repo ? (
                            <RepositoryTab repoUrl={project.github_repo} projectId={project.id} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/5 border-dashed">
                                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                    <Github className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Connect GitHub Repository</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Link a GitHub repository to access the file tree, commit history, and issue tracking.
                                </p>
                                <Button asChild>
                                    <Link href="?tab=settings">Go to Settings</Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="assets" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <AssetsTab assets={assets} projectId={project.id} />
                    </TabsContent>
                    <TabsContent value="versions" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <VersionsTab projectId={project.id} repoUrl={project.github_repo} />
                    </TabsContent>
                    <TabsContent value="deployments" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <DeploymentsTab deployments={deployments} projectId={project.vercel_project_id} />
                    </TabsContent>
                    <TabsContent value="settings" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="max-w-4xl mx-auto">
                            <ProjectSettings project={project} vercelProjects={vercelProjects} />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
