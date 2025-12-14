import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubCommit } from "@/lib/github";
import { GitCommit } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommitHistoryProps {
    commits: GitHubCommit[];
}

export function CommitHistory({ commits }: CommitHistoryProps) {
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
                        commits.map((commit) => (
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
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
