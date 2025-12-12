"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConvertIssueToTaskButton } from "./ConvertIssueToTaskButton";
import { CircleDot, GitPullRequest, ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IssueCardProps {
    issue: any;
    projectId: string;
}

export function IssueCard({ issue, projectId }: IssueCardProps) {
    const isPR = !!issue.pull_request;
    const createdDate = new Date(issue.created_at);
    const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

    return (
        <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200">
            <div className="flex items-start gap-4 overflow-hidden">
                <div className="mt-1 shrink-0">
                    {isPR ? (
                        <GitPullRequest className="h-5 w-5 text-purple-500" />
                    ) : (
                        <CircleDot className="h-5 w-5 text-green-500" />
                    )}
                </div>

                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-base hover:underline truncate block"
                        >
                            {issue.title}
                        </a>
                        <span className="text-muted-foreground text-sm shrink-0">#{issue.number}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={issue.user?.avatar_url} />
                                <AvatarFallback>{issue.user?.login?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{issue.user?.login}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>opened {timeAgo}</span>
                        </div>
                        {issue.labels && issue.labels.length > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex gap-1">
                                    {issue.labels.map((label: any) => (
                                        <span
                                            key={label.id}
                                            className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            style={{
                                                backgroundColor: `#${label.color}20`,
                                                borderColor: `#${label.color}40`,
                                                color: `#${label.color}`
                                            }}
                                        >
                                            {label.name}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-4">
                <ConvertIssueToTaskButton projectId={projectId} issue={issue} />
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" title="View on GitHub">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </Button>
            </div>
        </div>
    );
}
