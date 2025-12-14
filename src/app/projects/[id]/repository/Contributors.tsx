import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubContributor } from "@/lib/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface ContributorsProps {
    contributors: GitHubContributor[];
}

export function Contributors({ contributors }: ContributorsProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Contributors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {contributors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No contributors found.</p>
                    ) : (
                        <TooltipProvider>
                            {contributors.map((contributor) => (
                                <Tooltip key={contributor.id}>
                                    <TooltipTrigger asChild>
                                        <Link href={contributor.html_url} target="_blank">
                                            <Avatar className="h-8 w-8 border-2 border-background hover:scale-110 transition-transform">
                                                <AvatarImage src={contributor.avatar_url} />
                                                <AvatarFallback>{contributor.login.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{contributor.login}</p>
                                        <p className="text-xs text-muted-foreground">{contributor.contributions} contributions</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
