"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSettingAction } from "@/app/actions/settings";
import { Loader2, CheckCircle2, Clock } from "lucide-react";

interface WakaTimeSettingsProps {
    initialApiKey: string;
}

export function WakaTimeSettings({ initialApiKey }: WakaTimeSettingsProps) {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveSettingAction("wakatime_api_key", apiKey);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save WakaTime API Key:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <Clock className="h-5 w-5 text-primary" />
                    </div>
                    WakaTime Integration
                </CardTitle>
                <CardDescription className="text-base">
                    Enter your WakaTime Secret API Key to display your coding stats on the dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="wakatime-key" className="text-sm font-medium">Secret API Key</Label>
                    <Input
                        id="wakatime-key"
                        type="password"
                        placeholder="waka_..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">
                        You can find your Secret API Key in your <a href="https://wakatime.com/settings/account" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">WakaTime Account Settings</a>.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Saved
                        </>
                    ) : (
                        "Save API Key"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
