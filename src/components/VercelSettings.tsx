"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveVercelToken } from "@/app/actions/settings";
import { useState } from "react";
import { Loader2, Triangle } from "lucide-react";
import { toast } from "sonner";

interface VercelSettingsProps {
    initialToken?: string;
}

export function VercelSettings({ initialToken }: VercelSettingsProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await saveVercelToken(formData);
            toast.success("Vercel token saved successfully");
        } catch (error) {
            toast.error("Failed to save Vercel token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <Triangle className="h-5 w-5 fill-foreground" />
                    </div>
                    Vercel Integration
                </CardTitle>
                <CardDescription className="text-base">
                    Configure your Vercel Access Token to enable deployment tracking.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="token" className="text-sm font-medium">Access Token</Label>
                        <Input
                            id="token"
                            name="token"
                            type="password"
                            placeholder="ey..."
                            defaultValue={initialToken}
                            required
                            className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                        />
                        <p className="text-xs text-muted-foreground">
                            Create a token in your Vercel Account Settings.
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
