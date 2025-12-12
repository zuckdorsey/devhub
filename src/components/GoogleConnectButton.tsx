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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Google Drive Integration
                    {isConnected ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                    ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Disconnected
                        </span>
                    )}
                </CardTitle>
                <CardDescription>
                    Connect your Google Drive to upload files directly to your cloud storage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isConnected ? (
                    <form action={initiateGoogleAuth} onSubmit={() => setLoading(true)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client ID</Label>
                            <Input
                                id="clientId"
                                name="clientId"
                                placeholder="Enter your Google Client ID"
                                defaultValue={savedClientId}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientSecret">Client Secret</Label>
                            <Input
                                id="clientSecret"
                                name="clientSecret"
                                type="password"
                                placeholder="Enter your Google Client Secret"
                                required
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <p>Redirect URI: <code className="bg-muted p-0.5 rounded">http://localhost:3000/api/oauth/google/callback</code></p>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Connect Google Drive
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Your Google Drive is connected. Files uploaded in Project Assets will be saved to your Drive.
                        </p>
                        <form action={disconnectGoogleAuth}>
                            <Button variant="destructive" type="submit">
                                Disconnect
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
