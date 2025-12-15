import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubCommit } from "@/lib/github";
import { GitCommit, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Task } from "@/lib/tasks";
import type { ProjectVersion } from "@/lib/projectVersions";
import { Badge } from "@/components/ui/badge";
import { attachCommitToVersionAction, detachCommitFromVersionAction } from "@/app/actions/commitLinks";

interface CommitHistoryProps {
    commits: GitHubCommit[];
    tasksBySha: Record<string, Task[]>;
    versionsBySha: Record<string, ProjectVersion[]>;
    versions: ProjectVersion[];
    projectId: string;
    repoFullName: string;
    showUnlinkedCommitWarning: boolean;
}

export function CommitHistory({ commits, tasksBySha, versionsBySha, versions, projectId, repoFullName, showUnlinkedCommitWarning }: CommitHistoryProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Commit History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {commits.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No commits found.</p>
                    ) : (
                        commits.map((commit) => {
                            const linkedTasks = tasksBySha[commit.sha] || [];
                            const linkedVersions = versionsBySha[commit.sha] || [];

                            return (
                            <div key={commit.sha} className="flex gap-4 relative">
                                <div className="absolute left-[19px] top-8 bottom-[-24px] w-px bg-border last:hidden" />
                                <div className="relative z-10">
                                    <Avatar className="h-10 w-10 border-2 border-background">
                                        <AvatarImage src={commit.author?.avatar_url} />
                                        <AvatarFallback>{commit.commit.author.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 space-y-1 pt-1">
                                    <p className="text-sm font-medium leading-none">
                                        <Link href={commit.html_url} target="_blank" className="hover:underline">
                                            {commit.commit.message.split('\n')[0]}
                                        </Link>
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <GitCommit className="h-3 w-3" />
                                        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                                        <span>•</span>
                                        <span>{commit.commit.author.name}</span>
                                        <span>•</span>
                                        <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                                    </div>
                                    {showUnlinkedCommitWarning && linkedTasks.length === 0 && (
                                        <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>No tasks are linked to this commit yet.</span>
                                        </p>
                                    )}
                                    {linkedTasks.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2 text-xs">
                                            <span className="text-muted-foreground">Linked tasks:</span>
                                            {linkedTasks.map((task) => (
                                                <Badge key={task.id} variant="secondary" className="text-[10px]">
                                                    {task.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-3 space-y-2">
                                        {linkedVersions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 text-xs items-center">
                                                <span className="text-muted-foreground">Linked versions:</span>
                                                {linkedVersions.map((version) => (
                                                    <form
                                                        key={version.id}
                                                        action={detachCommitFromVersionAction}
                                                        className="inline-flex"
                                                    >
                                                        <input type="hidden" name="projectId" value={projectId} />
                                                        <input type="hidden" name="projectVersionId" value={version.id} />
                                                        <input type="hidden" name="commitSha" value={commit.sha} />
                                                        <input type="hidden" name="repoFullName" value={repoFullName} />
                                                        <button
                                                            type="submit"
                                                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/40 transition-colors"
                                                        >
                                                            {version.name} ✕
                                                        </button>
                                                    </form>
                                                ))}
                                            </div>
                                        )}
                                        {versions.length > 0 && (
                                            <form
                                                action={attachCommitToVersionAction}
                                                className="flex items-center gap-2 text-xs mt-1"
                                            >
                                                <input type="hidden" name="projectId" value={projectId} />
                                                <input type="hidden" name="commitSha" value={commit.sha} />
                                                <input type="hidden" name="repoFullName" value={repoFullName} />
                                                <select
                                                    name="projectVersionId"
                                                    className="h-7 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        Attach to version…
                                                    </option>
                                                    {versions.map((version) => (
                                                        <option key={version.id} value={version.id}>
                                                            {version.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="submit"
                                                    className="px-2 py-1 rounded-md bg-muted text-[11px] hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/40 transition-colors"
                                                >
                                                    Attach
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
