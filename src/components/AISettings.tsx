"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAISettings } from "@/app/actions/settings";
import { useState } from "react";
import { Loader2, Sparkles, Key, Bot, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AISettingsProps {
    initialProvider?: string;
    initialGeminiKey?: string;
    initialOpenRouterKey?: string;
    initialOpenRouterModel?: string;
}

export function AISettings({
    initialProvider = "gemini",
    initialGeminiKey,
    initialOpenRouterKey,
    initialOpenRouterModel
}: AISettingsProps) {
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState(initialProvider);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            // Append provider manually since tabs/radio might not submit if not part of form directly or controlled
            formData.append("ai_provider", provider);
            await saveAISettings(formData);
            toast.success("AI Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save AI Settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-full bg-background border shadow-sm">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                    </div>
                    AI Integration
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                        Beta
                    </Badge>
                </CardTitle>
                <CardDescription className="text-base">
                    Configure your AI provider to enable smart features like task generation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Label>AI Provider</Label>
                        <Tabs value={provider} onValueChange={setProvider} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="gemini" className="flex items-center gap-2">
                                    <Bot className="h-4 w-4" />
                                    Google Gemini
                                </TabsTrigger>
                                <TabsTrigger value="openrouter" className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4" />
                                    OpenRouter
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="gemini" className="space-y-4 pt-4 animate-in fade-in-50">
                                <div className="space-y-3">
                                    <Label htmlFor="gemini_api_key" className="text-sm font-medium">Gemini API Key</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="gemini_api_key"
                                            name="gemini_api_key"
                                            type="password"
                                            placeholder="AIzaSy..."
                                            defaultValue={initialGeminiKey}
                                            className="pl-9 bg-background/50"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Uses free tier of Gemini 1.5 Flash. Fast and reliable.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="openrouter" className="space-y-4 pt-4 animate-in fade-in-50">
                                <div className="space-y-3">
                                    <Label htmlFor="openrouter_api_key" className="text-sm font-medium">OpenRouter API Key</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="openrouter_api_key"
                                            name="openrouter_api_key"
                                            type="password"
                                            placeholder="sk-or-..."
                                            defaultValue={initialOpenRouterKey}
                                            className="pl-9 bg-background/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="openrouter_model" className="text-sm font-medium">Model ID</Label>
                                    <Input
                                        id="openrouter_model"
                                        name="openrouter_model"
                                        placeholder="meta-llama/llama-3-70b-instruct"
                                        defaultValue={initialOpenRouterModel || "meta-llama/llama-3.3-70b-instruct:free"}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter any OpenRouter model ID. Defaults to Llama 3.3 70B (Free).
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
