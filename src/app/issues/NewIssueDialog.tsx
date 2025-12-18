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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createIssueAction } from "@/app/actions/issues";
import { Loader2, Plus, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/index";

interface NewIssueDialogProps {
    projects: Project[];
}

export function NewIssueDialog({ projects }: NewIssueDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [syncToGitHub, setSyncToGitHub] = useState(false);
    const router = useRouter();

    // Projects that have GitHub repo (for sync option)
    const projectsWithRepo = projects.filter((p) => p.github_repo);
    const selectedProjectHasRepo = projectsWithRepo.some(
        (p) => p.id === selectedProject
    );

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            if (selectedProject) {
                formData.append("project_id", selectedProject);
            }
            formData.append("sync_to_github", syncToGitHub ? "true" : "false");

            await createIssueAction(formData);
            setOpen(false);
            setSelectedProject("");
            setSyncToGitHub(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to create issue", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>
                        Create a new issue. Optionally sync to GitHub if linked to a
                        project.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Issue title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe the issue..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project (optional)</Label>
                            <Select
                                value={selectedProject}
                                onValueChange={setSelectedProject}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="No project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No project</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                            {project.github_repo && " 🔗"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" defaultValue="Medium">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">🟢 Low</SelectItem>
                                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                                    <SelectItem value="High">🟠 High</SelectItem>
                                    <SelectItem value="Critical">🔴 Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="labels">Labels</Label>
                        <Input
                            id="labels"
                            name="labels"
                            placeholder="bug, feature, docs (comma-separated)"
                        />
                    </div>

                    {selectedProjectHasRepo && (
                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 border">
                            <Checkbox
                                id="sync_to_github"
                                checked={syncToGitHub}
                                onCheckedChange={(checked) =>
                                    setSyncToGitHub(checked as boolean)
                                }
                            />
                            <div className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                <Label htmlFor="sync_to_github" className="text-sm cursor-pointer">
                                    Also create on GitHub
                                </Label>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Issue
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
