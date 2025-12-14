"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, GitCommit, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { VercelDeployment } from "@/lib/vercel";
import { formatDistanceToNow } from "date-fns";

interface DeploymentsTabProps {
    deployments: VercelDeployment[];
    projectId?: string;
}

export function DeploymentsTab({ deployments, projectId }: DeploymentsTabProps) {
    if (!projectId) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
                    <p>Vercel Project ID not configured.</p>
                    <p className="text-sm">Go to Settings tab to link this project.</p>
                </CardContent>
            </Card>
        );
    }

    if (deployments.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No deployments found.</p>
                </CardContent>
            </Card>
        );
    }

    const getStatusIcon = (state: string) => {
        switch (state) {
            case "READY": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "ERROR": return <XCircle className="h-4 w-4 text-red-500" />;
            case "BUILDING": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case "READY": return "bg-green-500/10 text-green-600 border-green-200";
            case "ERROR": return "bg-red-500/10 text-red-600 border-red-200";
            case "BUILDING": return "bg-blue-500/10 text-blue-600 border-blue-200";
            default: return "bg-gray-500/10 text-gray-600 border-gray-200";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Latest updates from Vercel.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {deployments.map((deployment) => (
                            <div key={deployment.uid} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{deployment.url}</span>
                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 border-0 ${getStatusColor(deployment.state)}`}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(deployment.state)}
                                                {deployment.state}
                                            </span>
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(deployment.created), { addSuffix: true })}
                                        </span>
                                        {deployment.meta?.githubCommitMessage && (
                                            <span className="flex items-center gap-1 max-w-[300px] truncate" title={deployment.meta.githubCommitMessage}>
                                                <GitCommit className="h-3 w-3" />
                                                {deployment.meta.githubCommitMessage}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={`https://${deployment.url}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
