import { getProjectById } from "@/lib/projects";
import { getTasksByProjectId } from "@/lib/tasks";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Github, Globe, ArrowLeft, Clock, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import Link from "next/link";
import { ProjectTasks } from "./ProjectTasks";
import { Separator } from "@/components/ui/separator";
import { ImportTasksDialog } from "./ImportTasksDialog";
import { getAssetsByProjectId } from "@/lib/assets";
import { AssetsTab } from "./assets/AssetsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    // Fetch related tasks and assets
    const tasks = await getTasksByProjectId(id);
    const assets = await getAssetsByProjectId(id);

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

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-6xl">
            <div className="mb-8">
                <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                    <Link href="/projects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                            <Badge variant="outline" className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                                {project.status}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <CalendarDays className="mr-1.5 h-4 w-4" />
                                Created {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Unknown'}
                            </div>
                            {project.timeline && (
                                <div className="flex items-center">
                                    <Clock className="mr-1.5 h-4 w-4" />
                                    Target: {new Date(project.timeline).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {project.github_repo && (
                            <>
                                <ImportTasksDialog projectId={project.id} githubRepo={project.github_repo} />
                                <Button variant="outline" size="sm" asChild>
                                    <a href={project.github_repo} target="_blank" rel="noopener noreferrer">
                                        <Github className="mr-2 h-4 w-4" />
                                        Repository
                                    </a>
                                </Button>
                            </>
                        )}
                        {project.api_endpoint && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={project.api_endpoint} target="_blank" rel="noopener noreferrer">
                                    <Globe className="mr-2 h-4 w-4" />
                                    Live Demo
                                </a>
                            </Button>
                        )}
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

                    <section className="space-y-4">
                        <Tabs defaultValue="tasks" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tasks" className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    Tasks
                                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 min-w-[1.25rem]">{tasks.length}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="assets" className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    Project Vault
                                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 min-w-[1.25rem]">{assets.length}</Badge>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="tasks" className="mt-6 space-y-6">
                                <ProjectTasks tasks={tasks} projectId={project.id} projectName={project.name} />
                            </TabsContent>
                            <TabsContent value="assets" className="mt-6">
                                <AssetsTab assets={assets} projectId={project.id} />
                            </TabsContent>
                        </Tabs>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-6 sticky top-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Project Details</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Priority</span>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityColor(project.priority || 'Medium')}`}>
                                        {project.priority || 'Medium'}
                                    </span>
                                </div>

                                <div className="space-y-2 py-2 border-b">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 py-2">
                                    <span className="text-sm text-muted-foreground block">Tech Stack</span>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack?.length > 0 ? (
                                            project.tech_stack.map((tech, index) => (
                                                <Badge key={index} variant="secondary" className="px-2.5 py-0.5 text-xs font-normal">
                                                    {tech}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic text-sm">No tech stack specified.</p>
                                        )}
                                    </div>
                                </div>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="space-y-3 py-2 border-t">
                                        <span className="text-sm text-muted-foreground block">Tags</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs font-normal text-muted-foreground">
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
