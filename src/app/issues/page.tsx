import { getProjects } from "@/lib/projects";
import { fetchIssuesAndPRs } from "@/lib/github";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, CircleDot, GitPullRequest } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

import { NewIssueDialog } from "./NewIssueDialog";
import { ConvertIssueToTaskButton } from "./ConvertIssueToTaskButton";
import { IssueCard } from "./IssueCard";
import { IssueList } from "./IssueList";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
    const projects = await getProjects();
    const projectsWithRepo = projects.filter(p => p.github_repo);

    const issuesByProject = await Promise.all(
        projectsWithRepo.map(async (project) => {
            try {
                if (!project.github_repo) return { project, issues: [] };
                const url = new URL(project.github_repo);
                const pathParts = url.pathname.split("/").filter(Boolean);
                if (pathParts.length < 2) return { project, issues: [] };

                const [owner, repo] = pathParts;
                const issues = await fetchIssuesAndPRs(owner, repo);
                return { project, issues };
            } catch (e) {
                console.error(`Failed to fetch issues for ${project.name}`, e);
                return { project, issues: [] };
            }
        })
    );

    const totalIssues = issuesByProject.reduce((acc, curr) => acc + curr.issues.length, 0);

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CircleDot className="h-8 w-8" />
                        Issue Tracker
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage issues across all your connected projects.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                        {totalIssues} Open Issues
                    </Badge>
                    <NewIssueDialog projects={projects} />
                </div>
            </div>

            <IssueList issuesByProject={issuesByProject} />
        </div>
    );
}
