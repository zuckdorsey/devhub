import { GoogleConnectButton } from "@/components/GoogleConnectButton";
import { GitHubSettings } from "@/components/GitHubSettings";
import { VercelSettings } from "@/components/VercelSettings";
import { WhatsAppSettings } from "@/components/WhatsAppSettings";
import { WakaTimeSettings } from "@/components/WakaTimeSettings";
import { getIntegrationStatus } from "@/app/actions/settings";
import { getSetting } from "@/lib/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Plug, Palette, User, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
    const status = await getIntegrationStatus();
    const githubToken = await getSetting("github_token");
    const vercelToken = await getSetting("vercel_token");
    const whatsappToken = await getSetting("whatsapp_token");
    const whatsappTarget = await getSetting("whatsapp_target");
    const wakatimeKey = await getSetting("wakatime_api_key");

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Settings</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Manage your application preferences and integrations.</p>
                </div>

                <Tabs defaultValue="integrations" className="flex flex-col md:flex-row gap-8">
                    <aside className="md:w-64 flex-shrink-0">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-2">
                            <TabsTrigger
                                value="general"
                                className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground hover:bg-muted/50 transition-all rounded-xl"
                            >
                                <Settings className="mr-3 h-5 w-5" />
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="integrations"
                                className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground hover:bg-muted/50 transition-all rounded-xl"
                            >
                                <Plug className="mr-3 h-5 w-5" />
                                Integrations
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground hover:bg-muted/50 transition-all rounded-xl"
                            >
                                <Palette className="mr-3 h-5 w-5" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground hover:bg-muted/50 transition-all rounded-xl"
                            >
                                <Bell className="mr-3 h-5 w-5" />
                                Notifications
                            </TabsTrigger>
                        </TabsList>
                    </aside>

                    <div className="flex-1 space-y-8">
                        <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <Card className="border bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>General Settings</CardTitle>
                                    <CardDescription>Manage your general application settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    General settings content will go here.
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="integrations" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <div className="grid gap-6">
                                <GitHubSettings initialToken={githubToken || ""} />
                                <VercelSettings initialToken={vercelToken || ""} />
                                <WakaTimeSettings initialApiKey={wakatimeKey || ""} />
                                <WhatsAppSettings initialToken={whatsappToken || ""} initialTarget={whatsappTarget || ""} />
                                <GoogleConnectButton
                                    isConnected={status.isConnected}
                                    savedClientId={status.clientId}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <Card className="border bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    Appearance settings content will go here.
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <Card className="border bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Configure how you receive notifications.</CardDescription>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    Notification settings content will go here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
