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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createIssueAction } from "@/app/actions/github";
import { Loader2, Plus } from "lucide-react";

import { Project } from "@/types/index";

interface NewIssueDialogProps {
    projects: Project[];
}

export function NewIssueDialog({ projects }: NewIssueDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            // Find the selected project to get the repo URL
            const project = projects.find(p => p.id === selectedProject);
            if (project && project.github_repo) {
                formData.append("repoUrl", project.github_repo);
                formData.append("projectId", project.id);
                await createIssueAction(formData);
                setOpen(false);
                setSelectedProject("");
            }
        } catch (error) {
            console.error("Failed to create issue", error);
        } finally {
            setLoading(false);
        }
    };

    const validProjects = projects.filter(p => p.github_repo);

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
                        Create a new issue on GitHub for one of your projects.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {validProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Issue title" required />
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading || !selectedProject}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Issue
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
