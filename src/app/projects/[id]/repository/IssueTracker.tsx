import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitHubIssue } from "@/lib/github";
import { CircleDot, GitPullRequest } from "lucide-react";
import Link from "next/link";

interface IssueTrackerProps {
    issues: GitHubIssue[];
}

export function IssueTracker({ issues }: IssueTrackerProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {issues.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent issues or PRs.</p>
                    ) : (
                        issues.map((issue) => (
                            <div key={issue.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                                {issue.pull_request ? (
                                    <GitPullRequest className="h-5 w-5 text-purple-500 mt-0.5" />
                                ) : (
                                    <CircleDot className="h-5 w-5 text-green-500 mt-0.5" />
                                )}
                                <div className="space-y-1 flex-1">
                                    <Link href={issue.html_url} target="_blank" className="text-sm font-medium hover:underline line-clamp-1">
                                        {issue.title}
                                    </Link>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>#{issue.number}</span>
                                        <span>•</span>
                                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>by {issue.user.login}</span>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="capitalize text-xs">
                                    {issue.state}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
