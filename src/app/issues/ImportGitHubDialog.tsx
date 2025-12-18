"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    importGitHubIssuesAction,
    fetchGitHubIssuesPreviewAction,
} from "@/app/actions/issues";
import { Loader2, Download, Github, CircleDot, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/index";

interface ImportGitHubDialogProps {
    projects: Project[];
}

interface GitHubIssuePreview {
    number: number;
    title: string;
    state: string;
    html_url: string;
    labels: string[];
}

export function ImportGitHubDialog({ projects }: ImportGitHubDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [preview, setPreview] = useState<GitHubIssuePreview[]>([]);
    const router = useRouter();

    // Only projects with GitHub repo
    const projectsWithRepo = projects.filter((p) => p.github_repo);

    const handleProjectChange = async (projectId: string) => {
        setSelectedProject(projectId);
        if (!projectId) {
            setPreview([]);
            return;
        }

        setLoading(true);
        try {
            const issues = await fetchGitHubIssuesPreviewAction(projectId);
            setPreview(issues);
        } catch (error) {
            console.error("Failed to fetch preview:", error);
            setPreview([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedProject) return;

        setImporting(true);
        try {
            const result = await importGitHubIssuesAction(selectedProject);
            if (result.success) {
                setOpen(false);
                setSelectedProject("");
                setPreview([]);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to import:", error);
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Import from GitHub
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Import Issues from GitHub
                    </DialogTitle>
                    <DialogDescription>
                        Import existing GitHub issues as local issues. They will be linked
                        to the original GitHub issue.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Project</label>
                        <Select value={selectedProject} onValueChange={handleProjectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a project with GitHub repo" />
                            </SelectTrigger>
                            <SelectContent>
                                {projectsWithRepo.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && preview.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Found {preview.length} issues to import
                            </label>
                            <div className="max-h-[250px] overflow-y-auto space-y-2 border rounded-lg p-2">
                                {preview.map((issue) => (
                                    <div
                                        key={issue.number}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                                    >
                                        {issue.state === "open" ? (
                                            <CircleDot className="h-4 w-4 text-green-500 shrink-0" />
                                        ) : (
                                            <CircleCheck className="h-4 w-4 text-purple-500 shrink-0" />
                                        )}
                                        <span className="text-muted-foreground text-sm shrink-0">
                                            #{issue.number}
                                        </span>
                                        <span className="truncate text-sm">{issue.title}</span>
                                        {issue.labels.length > 0 && (
                                            <div className="flex gap-1 shrink-0">
                                                {issue.labels.slice(0, 2).map((label) => (
                                                    <Badge
                                                        key={label}
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        {label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && selectedProject && preview.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No issues found in this repository.
                        </div>
                    )}

                    {projectsWithRepo.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No projects with GitHub repositories found.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={importing || preview.length === 0}
                    >
                        {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import {preview.length} Issues
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
