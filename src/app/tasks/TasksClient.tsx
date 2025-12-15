"use client";

import { useState } from "react";
import { Task } from "@/lib/tasks";
import { TaskTableView } from "./components/TaskTableView";
import { TaskBoardView } from "./components/TaskBoardView";
import { ViewSwitcher } from "./components/ViewSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Filter, Search, CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDialog } from "@/components/TaskDialog";
import { Badge } from "@/components/ui/badge";

import { Section } from "@/lib/sections";

import { WorkflowStep } from "@/types";

interface TasksClientProps {
    initialTasks: Task[];
    projects: { id: string; name: string; workflow?: WorkflowStep[] }[];
    sections: Section[];
}

export function TasksClient({ initialTasks, projects, sections }: TasksClientProps) {
    const [view, setView] = useState<"board" | "table">("board");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredTasks = initialTasks.filter((task) => {
        if (selectedProject !== "all" && task.project_id !== selectedProject) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                task.title.toLowerCase().includes(query) ||
                (task.description && task.description.toLowerCase().includes(query)) ||
                (task.project_name && task.project_name.toLowerCase().includes(query))
            );
        }
        return true;
    });

    // Calculate stats
    // Calculate stats
    const todoCount = initialTasks.filter(t => {
        const project = projects.find(p => p.id === t.project_id);
        const workflow = project?.workflow;
        if (workflow) {
            const step = workflow.find(s => s.name === t.status);
            return step?.type === "backlog" || step?.type === "unstarted";
        }
        return t.status === "Todo" || t.status === "Backlog";
    }).length;

    const inProgressCount = initialTasks.filter(t => {
        const project = projects.find(p => p.id === t.project_id);
        const workflow = project?.workflow;
        if (workflow) {
            const step = workflow.find(s => s.name === t.status);
            return step?.type === "started";
        }
        return t.status === "In Progress" || t.status === "Review";
    }).length;

    const doneCount = initialTasks.filter(t => {
        const project = projects.find(p => p.id === t.project_id);
        const workflow = project?.workflow;
        if (workflow) {
            const step = workflow.find(s => s.name === t.status);
            return step?.type === "completed" || step?.type === "canceled";
        }
        return t.status === "Done";
    }).length;

    const totalCount = initialTasks.length;

    const stats = [
        { label: "Total", value: totalCount, icon: ListTodo, color: "bg-primary/10 text-primary" },
        { label: "To Do", value: todoCount, icon: AlertCircle, color: "bg-orange-500/10 text-orange-500" },
        { label: "In Progress", value: inProgressCount, icon: Clock, color: "bg-blue-500/10 text-blue-500" },
        { label: "Done", value: doneCount, icon: CheckCircle2, color: "bg-green-500/10 text-green-500" },
    ];

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        Tasks
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your tasks with clear start times and deadlines.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    Add Task
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-br from-card to-card/50"
                    >
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                <div className="flex flex-1 items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 h-10 bg-muted/30 border-muted focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[180px] h-10 bg-muted/30 border-muted">
                            <SelectValue placeholder="Project" />
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

                <ViewSwitcher view={view} onViewChange={setView} />
            </div>

            {/* Task Views */}
            <div className="flex-1 min-h-0">
                {view === "board" ? (
                    <TaskBoardView tasks={filteredTasks} projects={projects} />
                ) : (
                    <TaskTableView tasks={filteredTasks} projects={projects} />
                )}
            </div>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projects={projects}
                sections={sections}
            />
        </div>
    );
}
