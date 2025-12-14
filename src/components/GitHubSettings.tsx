"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveGitHubToken } from "@/app/actions/settings";
import { useState } from "react";
import { Loader2, CheckCircle2, Github } from "lucide-react";
import { toast } from "sonner";

interface GitHubSettingsProps {
    initialToken?: string;
}

export function GitHubSettings({ initialToken }: GitHubSettingsProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await saveGitHubToken(formData);
            toast.success("GitHub token saved successfully");
        } catch (error) {
            toast.error("Failed to save GitHub token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <Github className="h-5 w-5" />
                    </div>
                    GitHub Integration
                </CardTitle>
                <CardDescription className="text-base">
                    Configure your GitHub Personal Access Token to enable repository syncing and issue management.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="token" className="text-sm font-medium">Personal Access Token</Label>
                        <Input
                            id="token"
                            name="token"
                            type="password"
                            placeholder="ghp_..."
                            defaultValue={initialToken}
                            required
                            className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Required scopes: <code className="bg-muted px-1 py-0.5 rounded text-foreground">repo</code>, <code className="bg-muted px-1 py-0.5 rounded text-foreground">user</code>
                        </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Token
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
