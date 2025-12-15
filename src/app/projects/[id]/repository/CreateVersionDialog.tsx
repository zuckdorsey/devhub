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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import type { GitHubCommit } from "@/lib/github";
import { createVersionWithCommitsAction } from "@/app/actions/projectVersions";

interface CreateVersionDialogProps {
    projectId: string;
    repoUrl: string;
    commits: GitHubCommit[];
}

export function CreateVersionDialog({ projectId, repoUrl, commits }: CreateVersionDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedShas, setSelectedShas] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleCommit = (sha: string) => {
        setSelectedShas((prev) =>
            prev.includes(sha) ? prev.filter((s) => s !== sha) : [...prev, sha]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await createVersionWithCommitsAction({
                projectId,
                name: name.trim(),
                description: description.trim() || undefined,
                repoUrl,
                commitShas: selectedShas,
            });
            setOpen(false);
            setName("");
            setDescription("");
            setSelectedShas([]);
        } catch (error) {
            console.error("Failed to create version:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Create Version
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Create Version</DialogTitle>
                        <DialogDescription>
                            Name this version and optionally select related commits.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="version-name">Version name</Label>
                            <Input
                                id="version-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. v1.0.0, Sprint 3, Refactor Auth"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="version-description">Description (optional)</Label>
                            <Textarea
                                id="version-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short summary of what this version represents."
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Related commits (optional)</Label>
                        <ScrollArea className="h-[220px] border rounded-md p-3">
                            {commits.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    No commits available to link yet.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {commits.map((commit) => (
                                        <label
                                            key={commit.sha}
                                            className="flex items-start gap-2 text-xs cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedShas.includes(commit.sha)}
                                                onCheckedChange={() => toggleCommit(commit.sha)}
                                            />
                                            <div className="space-y-0.5">
                                                <div className="font-medium line-clamp-1">
                                                    {commit.commit.message.split("\n")[0]}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground flex gap-2">
                                                    <span className="font-mono">
                                                        {commit.sha.substring(0, 7)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(commit.commit.author.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Version
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
