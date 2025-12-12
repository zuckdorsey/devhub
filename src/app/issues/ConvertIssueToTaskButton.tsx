"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { importTasksFromGitHubAction } from "@/app/actions/github";
import { Check, Loader2, Plus } from "lucide-react";

interface ConvertIssueToTaskButtonProps {
    projectId: string;
    issue: any;
}

export function ConvertIssueToTaskButton({ projectId, issue }: ConvertIssueToTaskButtonProps) {
    const [loading, setLoading] = useState(false);
    const [converted, setConverted] = useState(false);

    const handleConvert = async () => {
        setLoading(true);
        try {
            // Wrap the single issue in an array as expected by the action
            await importTasksFromGitHubAction(projectId, JSON.stringify([issue]));
            setConverted(true);
        } catch (error) {
            console.error("Failed to convert issue to task", error);
        } finally {
            setLoading(false);
        }
    };

    if (converted) {
        return (
            <Button variant="outline" size="sm" disabled className="text-green-600 border-green-200 bg-green-50">
                <Check className="mr-2 h-4 w-4" />
                Task Created
            </Button>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={handleConvert} disabled={loading}>
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Plus className="mr-2 h-4 w-4" />
            )}
            Convert to Task
        </Button>
    );
}
