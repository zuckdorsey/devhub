"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveWhatsAppSettings } from "@/app/actions/settings";
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppSettingsProps {
    initialToken?: string;
    initialTarget?: string;
}

export function WhatsAppSettings({ initialToken, initialTarget }: WhatsAppSettingsProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await saveWhatsAppSettings(formData);
            toast.success("WhatsApp settings saved successfully");
        } catch (error) {
            toast.error("Failed to save WhatsApp settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <MessageCircle className="h-5 w-5 fill-green-500 text-green-500" />
                    </div>
                    WhatsApp Integration (Fonnte)
                </CardTitle>
                <CardDescription className="text-base">
                    Configure Fonnte API to enable WhatsApp notifications.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="whatsapp_token" className="text-sm font-medium">API Token</Label>
                        <Input
                            id="whatsapp_token"
                            name="whatsapp_token"
                            type="password"
                            placeholder="Fonnte API Token"
                            defaultValue={initialToken}
                            required
                            className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                        />
                        <p className="text-xs text-muted-foreground">
                            Get your token from Fonnte dashboard.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="whatsapp_target" className="text-sm font-medium">Default Target Number</Label>
                        <Input
                            id="whatsapp_target"
                            name="whatsapp_target"
                            placeholder="08123456789"
                            defaultValue={initialTarget}
                            required
                            className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                        />
                        <p className="text-xs text-muted-foreground">
                            The default phone number to receive notifications (comma separated for multiple).
                        </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
