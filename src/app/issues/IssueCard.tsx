"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Issue } from "@/lib/issues";
import { deleteIssueAction, syncIssueToGitHubAction, updateIssueAction } from "@/app/actions/issues";
import {
    CircleDot,
    CircleCheck,
    ExternalLink,
    MoreVertical,
    Trash2,
    Github,
    Cloud,
    CloudOff,
    Pencil,
    Loader2,
    Calendar,
    AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow, format, isPast, isToday } from "date-fns";
import { useRouter } from "next/navigation";

interface IssueCardProps {
    issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const createdDate = new Date(issue.created_at);
    const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
    const isSynced = !!issue.github_issue_number;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteIssueAction(issue.id);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete issue:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleSyncToGitHub = async () => {
        setIsSyncing(true);
        try {
            await syncIssueToGitHubAction(issue.id);
            router.refresh();
        } catch (error) {
            console.error("Failed to sync to GitHub:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleToggleStatus = async () => {
        const formData = new FormData();
        formData.append("status", issue.status === "open" ? "closed" : "open");
        try {
            await updateIssueAction(issue.id, formData);
            router.refresh();
        } catch (error) {
            console.error("Failed to update issue:", error);
        }
    };

    const priorityColors = {
        Low: "bg-green-500/10 text-green-500 border-green-500/20",
        Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        Critical: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <>
            <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200">
                <div className="flex items-start gap-4 overflow-hidden">
                    <button
                        onClick={handleToggleStatus}
                        className="mt-1 shrink-0 hover:scale-110 transition-transform"
                        title={issue.status === "open" ? "Mark as closed" : "Mark as open"}
                    >
                        {issue.status === "open" ? (
                            <CircleDot className="h-5 w-5 text-green-500" />
                        ) : (
                            <CircleCheck className="h-5 w-5 text-purple-500" />
                        )}
                    </button>

                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-base truncate block">
                                {issue.title}
                            </span>
                            {isSynced ? (
                                <Badge variant="outline" className="text-xs gap-1 shrink-0">
                                    <Github className="h-3 w-3" />
                                    #{issue.github_issue_number}
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="text-xs gap-1 shrink-0 text-muted-foreground"
                                >
                                    <CloudOff className="h-3 w-3" />
                                    Local
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span>{timeAgo}</span>
                            {issue.project_name && (
                                <>
                                    <span>•</span>
                                    <span>{issue.project_name}</span>
                                </>
                            )}
                            <span>•</span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${priorityColors[issue.priority]}`}
                            >
                                {issue.priority}
                            </Badge>
                            {issue.due_date && (
                                <>
                                    <span>•</span>
                                    <div className={`flex items-center gap-1 ${isPast(new Date(issue.due_date)) && issue.status === "open"
                                            ? "text-red-500"
                                            : isToday(new Date(issue.due_date))
                                                ? "text-yellow-500"
                                                : ""
                                        }`}>
                                        {isPast(new Date(issue.due_date)) && issue.status === "open" && (
                                            <AlertTriangle className="h-3 w-3" />
                                        )}
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(issue.due_date), "MMM d")}</span>
                                    </div>
                                </>
                            )}
                            {issue.labels && issue.labels.length > 0 && (
                                <>
                                    <span>•</span>
                                    <div className="flex gap-1">
                                        {issue.labels.slice(0, 3).map((label, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="text-[10px] px-1.5"
                                            >
                                                {label}
                                            </Badge>
                                        ))}
                                        {issue.labels.length > 3 && (
                                            <span className="text-[10px]">
                                                +{issue.labels.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-4">
                    {!isSynced && issue.project_id && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={handleSyncToGitHub}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Cloud className="h-4 w-4" />
                                    Sync
                                </>
                            )}
                        </Button>
                    )}

                    {isSynced && issue.github_issue_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a
                                href={issue.github_issue_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on GitHub"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleToggleStatus}>
                                {issue.status === "open" ? (
                                    <>
                                        <CircleCheck className="h-4 w-4 mr-2" />
                                        Close issue
                                    </>
                                ) : (
                                    <>
                                        <CircleDot className="h-4 w-4 mr-2" />
                                        Reopen issue
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{issue.title}&quot;? This will only
                            delete the local issue, not the GitHub issue if synced.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
