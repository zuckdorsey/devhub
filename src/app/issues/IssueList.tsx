"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Issue } from "@/lib/issues";
import { IssueCard } from "./IssueCard";
import { Search, Filter } from "lucide-react";

interface IssueListProps {
    issues: Issue[];
}

export function IssueList({ issues }: IssueListProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [syncFilter, setSyncFilter] = useState<string>("all");

    const filteredIssues = issues.filter((issue) => {
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            if (
                !issue.title.toLowerCase().includes(searchLower) &&
                !issue.description?.toLowerCase().includes(searchLower)
            ) {
                return false;
            }
        }

        // Status filter
        if (statusFilter !== "all" && issue.status !== statusFilter) {
            return false;
        }

        // Priority filter
        if (priorityFilter !== "all" && issue.priority !== priorityFilter) {
            return false;
        }

        // Sync filter
        if (syncFilter === "synced" && !issue.github_issue_number) {
            return false;
        }
        if (syncFilter === "local" && issue.github_issue_number) {
            return false;
        }

        return true;
    });

    const openIssues = filteredIssues.filter((i) => i.status === "open");
    const closedIssues = filteredIssues.filter((i) => i.status === "closed");

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={syncFilter} onValueChange={setSyncFilter}>
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Sync" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="synced">Synced</SelectItem>
                        <SelectItem value="local">Local Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Open Issues */}
            {openIssues.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Open ({openIssues.length})
                    </h3>
                    <div className="space-y-2">
                        {openIssues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                </div>
            )}

            {/* Closed Issues */}
            {closedIssues.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Closed ({closedIssues.length})
                    </h3>
                    <div className="space-y-2">
                        {closedIssues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredIssues.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">No issues found</p>
                    <p className="text-sm">Create your first issue to get started.</p>
                </div>
            )}
        </div>
    );
}
