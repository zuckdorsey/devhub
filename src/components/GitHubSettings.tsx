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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Integration
                </CardTitle>
                <CardDescription>
                    Configure your GitHub Personal Access Token to enable repository syncing and issue management.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token">Personal Access Token</Label>
                        <Input
                            id="token"
                            name="token"
                            type="password"
                            placeholder="ghp_..."
                            defaultValue={initialToken}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Required scopes: <code>repo</code>, <code>user</code>
                        </p>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Token
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
