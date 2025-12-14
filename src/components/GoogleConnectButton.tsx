"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initiateGoogleAuth, disconnectGoogleAuth } from "@/app/actions/settings";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface GoogleConnectButtonProps {
    isConnected: boolean;
    savedClientId?: string;
}

export function GoogleConnectButton({ isConnected, savedClientId }: GoogleConnectButtonProps) {
    const [loading, setLoading] = useState(false);

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                        Google Drive Integration
                        {isConnected ? (
                            <span className="text-xs bg-green-500/10 text-green-600 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                            </span>
                        ) : (
                            <span className="text-xs bg-muted text-muted-foreground border px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium">
                                <AlertCircle className="h-3.5 w-3.5" /> Disconnected
                            </span>
                        )}
                    </div>
                </CardTitle>
                <CardDescription className="text-base">
                    Connect your Google Drive to upload files directly to your cloud storage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isConnected ? (
                    <form action={initiateGoogleAuth} onSubmit={() => setLoading(true)} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="clientId" className="text-sm font-medium">Client ID</Label>
                            <Input
                                id="clientId"
                                name="clientId"
                                placeholder="Enter your Google Client ID"
                                defaultValue={savedClientId}
                                required
                                className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="clientSecret" className="text-sm font-medium">Client Secret</Label>
                            <Input
                                id="clientSecret"
                                name="clientSecret"
                                type="password"
                                placeholder="Enter your Google Client Secret"
                                required
                                className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-muted">
                            <p>Redirect URI: <code className="bg-background px-1.5 py-0.5 rounded border text-foreground font-mono">http://localhost:3000/api/oauth/google/callback</code></p>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Connect Google Drive
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-green-500/5 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-green-900">Successfully Connected</h4>
                                <p className="text-sm text-green-700">
                                    Your Google Drive is connected. Files uploaded in Project Assets will be saved to your Drive.
                                </p>
                            </div>
                        </div>
                        <form action={disconnectGoogleAuth}>
                            <Button variant="destructive" type="submit" className="w-full sm:w-auto">
                                Disconnect
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
