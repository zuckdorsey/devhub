import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleDot, ArrowRight, GitPullRequest, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Issue {
    id: number;
    title: string;
    state: string;
    html_url: string;
    pull_request?: { url: string };
}

interface ProjectIssues {
    project: { id: string; name: string };
    issues: Issue[];
}

interface IssuesSummaryProps {
    issuesByProject: ProjectIssues[];
}

export function IssuesSummary({ issuesByProject }: IssuesSummaryProps) {
    const totalIssues = issuesByProject.reduce((acc, curr) => acc + curr.issues.filter(i => !i.pull_request).length, 0);
    const totalPRs = issuesByProject.reduce((acc, curr) => acc + curr.issues.filter(i => i.pull_request).length, 0);

    // Get recent issues across all projects
    const allIssues = issuesByProject
        .flatMap(p => p.issues.map(i => ({ ...i, projectName: p.project.name })))
        .filter(i => !i.pull_request)
        .slice(0, 5);

    return (
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CircleDot className="h-5 w-5 text-primary" />
                        Open Issues
                    </CardTitle>
                    <Link href="/issues">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                            View All
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-3 rounded-lg bg-violet-500/10">
                        <div className="text-2xl font-bold text-violet-500">{totalIssues}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Issues</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cyan-500/10">
                        <div className="text-2xl font-bold text-cyan-500">{totalPRs}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pull Requests</div>
                    </div>
                </div>

                {/* Issue List */}
                <div className="space-y-2">
                    {allIssues.length > 0 ? (
                        allIssues.map((issue) => (
                            <a
                                key={issue.id}
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                            >
                                <CircleDot className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate group-hover:text-primary transition-colors">
                                        {issue.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {issue.projectName}
                                    </p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <CircleDot className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No open issues</p>
                            <p className="text-xs mt-1">Connect GitHub repos to track issues</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
