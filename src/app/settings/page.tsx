import { getSetting } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveGithubTokenAction } from "@/app/actions/settings";
import { Github } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const githubToken = await getSetting("github_token");

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Github className="h-6 w-6" />
                        <CardTitle>GitHub Integration</CardTitle>
                    </div>
                    <CardDescription>
                        Connect your GitHub account to import projects and create tasks from issues.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={saveGithubTokenAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">Personal Access Token</Label>
                            <Input
                                id="token"
                                name="token"
                                type="password"
                                placeholder="ghp_..."
                                defaultValue={githubToken || ""}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Generate a token with <code>repo</code> scope access.
                            </p>
                        </div>
                        <Button type="submit">Save Token</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
