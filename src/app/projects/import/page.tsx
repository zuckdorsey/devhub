import { fetchRepositories, GitHubRepo } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { importProjectAction } from "@/app/actions/github";
import { Github, GitFork, Star, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function ImportProjectPage(props: {
    searchParams: Promise<{ q?: string }>;
}) {
    let repos: GitHubRepo[] = [];
    let error = null;

    try {
        repos = await fetchRepositories();
    } catch (e) {
        error = "Failed to fetch repositories. Please check your GitHub token in Settings.";
    }

    const { q } = await props.searchParams;
    const query = q?.toLowerCase().trim() || "";
    const filteredRepos = query
        ? repos.filter((repo) => {
              const name = repo.name?.toLowerCase() || "";
              const fullName = repo.full_name?.toLowerCase() || "";
              const desc = repo.description?.toLowerCase() || "";
              return (
                  name.includes(query) ||
                  fullName.includes(query) ||
                  desc.includes(query)
              );
          })
        : repos;

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-4xl">
            <div className="mb-8">
                <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                    <Link href="/projects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Import from GitHub</h1>
                <p className="text-muted-foreground mt-2">Search and select a repository to import as a new project.</p>
            </div>

            {error ? (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
                    {error} <Link href="/settings" className="underline font-medium">Go to Settings</Link>
                </div>
            ) : (
                <>
                    <form
                        className="mb-4 flex items-center gap-2 max-w-md"
                        action="/projects/import"
                        method="GET"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="q"
                                placeholder="Search repositories by name or description..."
                                defaultValue={q || ""}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                        {query && (
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                            >
                                <Link href="/projects/import">Clear</Link>
                            </Button>
                        )}
                    </form>

                    <ScrollArea className="h-[540px] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRepos.length === 0 ? (
                                <p className="text-sm text-muted-foreground col-span-2">
                                    No repositories found for "{query}".
                                </p>
                            ) : (
                                filteredRepos.map((repo) => (
                            <Card key={repo.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 truncate">
                                        <Github className="h-4 w-4 shrink-0" />
                                        <span className="truncate" title={repo.full_name}>{repo.name}</span>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 h-10">
                                        {repo.description || "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                                        <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                                            {repo.stargazers_count > 0 && (
                                                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                                            )}
                                            {repo.forks_count > 0 && (
                                                <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks_count}</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <form action={importProjectAction} className="w-full">
                                        <input type="hidden" name="repo" value={JSON.stringify(repo)} />
                                        <Button type="submit" className="w-full">Import Project</Button>
                                    </form>
                                </CardFooter>
                            </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );
}
