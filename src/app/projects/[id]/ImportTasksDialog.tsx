"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { importTasksFromGitHubAction, fetchIssuesAction } from "@/app/actions/github";
import { fetchIssuesAndPRs } from "@/lib/github";
import { Github, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImportTasksDialogProps {
    projectId: string;
    githubRepo: string;
}

export function ImportTasksDialog({ projectId, githubRepo }: ImportTasksDialogProps) {
    const [open, setOpen] = useState(false);
    const [issues, setIssues] = useState<any[]>([]);
    const [selectedIssues, setSelectedIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (open && githubRepo) {
            setLoading(true);
            // Extract owner and repo from URL
            // Example: https://github.com/owner/repo
            try {
                const url = new URL(githubRepo);
                const pathParts = url.pathname.split("/").filter(Boolean);
                if (pathParts.length >= 2) {
                    const owner = pathParts[0];
                    const repo = pathParts[1];

                    // We need a server action or API route to fetch issues because of the token
                    // For now, let's assume we can call the library function directly if it was a server component,
                    // but this is a client component. We need a server action to fetch issues.
                    // Let's create a server action for fetching issues as well.
                    fetchIssues(owner, repo);
                }
            } catch (e) {
                console.error("Invalid GitHub URL", e);
                setLoading(false);
            }
        }
    }, [open, githubRepo]);

    const fetchIssues = async (owner: string, repo: string) => {
        try {
            // This needs to be a server action call
            const data = await fetchIssuesAction(owner, repo);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            await importTasksFromGitHubAction(projectId, JSON.stringify(selectedIssues));
            setOpen(false);
            setSelectedIssues([]);
        } catch (error) {
            console.error("Failed to import tasks", error);
        } finally {
            setImporting(false);
        }
    };

    const toggleIssue = (issue: any) => {
        if (selectedIssues.find((i) => i.id === issue.id)) {
            setSelectedIssues(selectedIssues.filter((i) => i.id !== issue.id));
        } else {
            setSelectedIssues([...selectedIssues, issue]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    Import Tasks
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Tasks from GitHub</DialogTitle>
                    <DialogDescription>
                        Select issues or pull requests to import as tasks.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[300px] border rounded-md p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : issues.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No open issues found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {issues.map((issue) => (
                                <div key={issue.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={`issue-${issue.id}`}
                                        checked={!!selectedIssues.find((i) => i.id === issue.id)}
                                        onCheckedChange={() => toggleIssue(issue)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`issue-${issue.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            <span className="text-muted-foreground mr-2">#{issue.number}</span>
                                            {issue.title}
                                        </label>
                                        <div className="flex gap-2">
                                            {issue.pull_request ? <Badge variant="outline" className="text-[10px] px-1 py-0">PR</Badge> : <Badge variant="outline" className="text-[10px] px-1 py-0">Issue</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={selectedIssues.length === 0 || importing}>
                        {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import {selectedIssues.length} Tasks
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


