import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectVersions, getProjectVersionTasks } from "@/lib/projectVersions";
import { getCommitLinksForVersion } from "@/lib/commitLinks";
import { Layers, GitCommit, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { getTags, GitHubTag } from "@/lib/github";
import { getSetting } from "@/lib/settings";

interface VersionsTabProps {
    projectId: string;
    repoUrl?: string | null;
}

export async function VersionsTab({ projectId, repoUrl }: VersionsTabProps) {
    const versions = await getProjectVersions(projectId);

    if (versions.length === 0) {
        return (
            <Card className="border-dashed bg-muted/10">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No versions have been created for this project yet.
                </CardContent>
            </Card>
        );
    }

    const tagMappingSetting = await getSetting("automation_show_tag_version_mapping");
    const showTagMapping = tagMappingSetting !== "false";

    let repoFullName: string | null = null;
    if (repoUrl) {
        try {
            const parsed = new URL(repoUrl);
            const parts = parsed.pathname.split("/").filter(Boolean);
            if (parts.length >= 2) {
                repoFullName = `${parts[0]}/${parts[1]}`;
            }
        } catch {
            repoFullName = null;
        }
    }

    let tags: GitHubTag[] = [];
    if (showTagMapping && repoUrl && repoFullName) {
        tags = await getTags(repoUrl);
    }

    const shaToTags = new Map<string, GitHubTag[]>();
    for (const tag of tags) {
        const list = shaToTags.get(tag.commit.sha) || [];
        list.push(tag);
        shaToTags.set(tag.commit.sha, list);
    }

    const versionsWithMeta = await Promise.all(
        versions.map(async (version) => {
            const [tasks, commitLinks] = await Promise.all([
                getProjectVersionTasks(version.id),
                getCommitLinksForVersion(version.id),
            ]);

            let versionTags: GitHubTag[] = [];
            if (showTagMapping && repoFullName && tags.length > 0) {
                const tagMap: Record<string, GitHubTag> = {};
                for (const link of commitLinks) {
                    if (link.repo_full_name !== repoFullName) continue;
                    const mappedTags = shaToTags.get(link.commit_sha) || [];
                    for (const tag of mappedTags) {
                        tagMap[tag.name] = tag;
                    }
                }
                versionTags = Object.values(tagMap);
            }

            return {
                version,
                taskCount: tasks.length,
                doneTasks: tasks.filter((t) => t.status === "Done").length,
                progress:
                    tasks.length > 0
                        ? Math.round(
                            (tasks.filter((t) => t.status === "Done").length / tasks.length) * 100
                          )
                        : 0,
                commitLinks,
                tags: versionTags,
            };
        })
    );

    return (
        <div className="space-y-4">
            {versionsWithMeta.map(({ version, taskCount, doneTasks, progress, commitLinks, tags }) => (
                <Card key={version.id} className="border bg-card/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="space-y-1">
                            <Link href={`/projects/${projectId}/versions/${version.id}`}>
                                <CardTitle className="text-base font-semibold hover:underline">
                                    {version.name}
                                </CardTitle>
                            </Link>
                            {version.description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                    {version.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                            <div className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    {new Date(version.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                <span>
                                    {doneTasks}/{taskCount} tasks done
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Commits:</span>
                            {commitLinks.length === 0 ? (
                                <span className="text-muted-foreground/70">No commits linked</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {commitLinks.map((link) => (
                                        <Badge
                                            key={link.id}
                                            variant="outline"
                                            className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5"
                                        >
                                            <GitCommit className="h-3 w-3" />
                                            <span>{link.commit_sha.substring(0, 7)}</span>
                                            <span className="text-[9px] text-muted-foreground">
                                                {link.repo_full_name}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        {showTagMapping && (
                            <div className="flex items-center gap-2 text-xs mt-1">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    Tags:
                                </span>
                                {tags.length === 0 ? (
                                    <span className="text-muted-foreground/70">No tags mapped</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map((tag) => (
                                            <Badge
                                                key={tag.name}
                                                variant="secondary"
                                                className="text-[10px] px-1.5 py-0.5"
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
