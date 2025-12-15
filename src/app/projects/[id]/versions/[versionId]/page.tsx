import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectVersionById, getProjectVersionTasks } from "@/lib/projectVersions";
import { getCommitLinksForVersion } from "@/lib/commitLinks";
import { getCachedCommitsMap } from "@/lib/githubCommitsCache";
import { GitCommit, Layers, ArrowLeft, Clock } from "lucide-react";

interface VersionDetailPageProps {
    params: Promise<{
        id: string;
        versionId: string;
    }>;
}

export default async function VersionDetailPage({ params }: VersionDetailPageProps) {
    const { id: projectId, versionId } = await params;

    const version = await getProjectVersionById(versionId);
    if (!version || version.project_id !== projectId) {
        notFound();
    }

    const [tasks, commitLinks] = await Promise.all([
        getProjectVersionTasks(versionId),
        getCommitLinksForVersion(versionId),
    ]);

    // Group commit links by repo_full_name so we can reuse cached commits per repo
    const commitsByRepo: Record<string, { sha: string }[]> = {};
    for (const link of commitLinks) {
        if (!commitsByRepo[link.repo_full_name]) {
            commitsByRepo[link.repo_full_name] = [];
        }
        commitsByRepo[link.repo_full_name].push({ sha: link.commit_sha });
    }

    type EnrichedCommit = {
        sha: string;
        repoFullName: string;
        message: string;
        date: string;
    };

    const enrichedCommits: EnrichedCommit[] = [];

    for (const [repoFullName, links] of Object.entries(commitsByRepo)) {
        const cacheMap = await getCachedCommitsMap(repoFullName, "main");
        for (const { sha } of links) {
            const cached = cacheMap[sha];
            enrichedCommits.push({
                sha,
                repoFullName,
                message: cached?.message || sha,
                date: cached?.date || "",
            });
        }
    }

    // Simple changelog derived from commit messages (newest first by insertion order)
    const changelogMessages = enrichedCommits.map((c) => c.message.split("\n")[0]);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "Done").length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href={`/projects/${projectId}`}
                        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Back to project
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">Version: {version.name}</h1>
                    {version.description && (
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {version.description}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created {new Date(version.created_at).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {doneTasks}/{totalTasks} tasks done ({progress}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Commits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {enrichedCommits.length === 0 ? (
                            <p className="text-muted-foreground">No commits linked to this version.</p>
                        ) : (
                            enrichedCommits.map((commit) => (
                                <div key={`${commit.repoFullName}-${commit.sha}`} className="flex items-start gap-3">
                                    <GitCommit className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Link
                                            href={`https://github.com/${commit.repoFullName}/commit/${commit.sha}`}
                                            target="_blank"
                                            className="font-medium hover:underline"
                                        >
                                            {commit.message.split("\n")[0]}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                                            <span>•</span>
                                            <span>{commit.repoFullName}</span>
                                            {commit.date && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Changelog</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {changelogMessages.length === 0 ? (
                            <p className="text-muted-foreground">No changelog available.</p>
                        ) : (
                            <ul className="list-disc pl-4 space-y-1">
                                {changelogMessages.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Task Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {tasks.length === 0 ? (
                        <p className="text-muted-foreground">No tasks were in this project at the time of this version.</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between rounded-md border bg-card/50 px-3 py-2"
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-sm">{task.title}</div>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-xs">
                                        <Badge variant="outline">{task.status}</Badge>
                                        <span className="text-muted-foreground">{task.priority}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
