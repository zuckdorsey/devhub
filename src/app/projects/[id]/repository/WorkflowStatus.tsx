import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitHubWorkflowRun } from "@/lib/github";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface WorkflowStatusProps {
    runs: GitHubWorkflowRun[];
}

export function WorkflowStatus({ runs }: WorkflowStatusProps) {
    const getStatusIcon = (status: string, conclusion: string | null) => {
        if (status !== "completed") return <Clock className="h-4 w-4 text-blue-500" />;
        if (conclusion === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (conclusion === "failure") return <XCircle className="h-4 w-4 text-red-500" />;
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    };

    const getStatusColor = (status: string, conclusion: string | null) => {
        if (status !== "completed") return "bg-blue-500/10 text-blue-600 border-blue-200";
        if (conclusion === "success") return "bg-green-500/10 text-green-600 border-green-200";
        if (conclusion === "failure") return "bg-red-500/10 text-red-600 border-red-200";
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recent Workflows</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {runs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No workflow runs found.</p>
                    ) : (
                        runs.map((run) => (
                            <div key={run.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <Link href={run.html_url} target="_blank" className="text-sm font-medium hover:underline">
                                        {run.name}
                                    </Link>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{new Date(run.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{run.actor.login}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`flex items-center gap-1.5 ${getStatusColor(run.status, run.conclusion)}`}>
                                    {getStatusIcon(run.status, run.conclusion)}
                                    <span className="capitalize">{run.conclusion || run.status}</span>
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
