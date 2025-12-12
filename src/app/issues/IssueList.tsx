"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueCard } from "./IssueCard";
import { Github, CircleDot, Search, Filter } from "lucide-react";
import Link from "next/link";

interface IssueListProps {
    issuesByProject: {
        project: any;
        issues: any[];
    }[];
}

export function IssueList({ issuesByProject }: IssueListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState<string>("all");

    // Get all unique projects that have issues or are in the list
    const projects = issuesByProject.map((item) => item.project);

    // Filter logic
    const filteredGroups = issuesByProject
        .map((group) => {
            // 1. Filter by Project
            if (selectedProject !== "all" && group.project.id !== selectedProject) {
                return null;
            }

            // 2. Filter issues by search query
            const filteredIssues = group.issues.filter((issue) => {
                const query = searchQuery.toLowerCase();
                return (
                    issue.title.toLowerCase().includes(query) ||
                    issue.number.toString().includes(query) ||
                    issue.user?.login?.toLowerCase().includes(query)
                );
            });

            if (filteredIssues.length === 0) return null;

            return {
                project: group.project,
                issues: filteredIssues,
            };
        })
        .filter(Boolean) as { project: any; issues: any[] }[];

    const hasIssues = issuesByProject.some((g) => g.issues.length > 0);

    if (!hasIssues) {
        return (
            <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
                <h3 className="text-xl font-semibold mb-2">No linked projects found</h3>
                <p className="text-muted-foreground mb-6">
                    Connect your projects to GitHub repositories to see issues here.
                </p>
                <Button asChild>
                    <Link href="/projects">Go to Projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filter by Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Results */}
            {filteredGroups.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/5">
                    <CircleDot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No issues found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search or filters.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedProject("all");
                        }}
                    >
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="grid gap-8">
                    {filteredGroups.map(({ project, issues }) => (
                        <div key={project.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold tracking-tight">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="hover:underline"
                                        >
                                            {project.name}
                                        </Link>
                                    </h2>
                                    <Badge variant="outline" className="text-xs">
                                        {issues.length}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    asChild
                                >
                                    <a
                                        href={project.github_repo!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        {project.github_repo?.split("/").slice(-2).join("/")}
                                    </a>
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                {issues.map((issue) => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        projectId={project.id}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
