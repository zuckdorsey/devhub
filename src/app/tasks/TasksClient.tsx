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
import { Plus, Filter, Layers, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDialog } from "@/components/TaskDialog";

interface TasksClientProps {
    initialTasks: Task[];
    projects: { id: string; name: string }[];
}

export function TasksClient({ initialTasks, projects }: TasksClientProps) {
    const [view, setView] = useState<"board" | "table">("board");
    const [filterType, setFilterType] = useState<"all" | "Daily" | "Weekly">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredTasks = initialTasks.filter((task) => {
        // Filter by Type
        if (filterType !== "all" && task.type !== filterType) return false;

        // Filter by Project
        if (selectedProject !== "all" && task.project_id !== selectedProject) return false;

        // Filter by Search Query
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

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 space-y-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Layers className="h-8 w-8" />
                        Tasks
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your daily and weekly tasks efficiently.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-9" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                <div className="flex flex-1 items-center gap-4 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[180px] h-9">
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
                                <Filter className="h-3.5 w-3.5" />
                                {filterType === 'all' ? 'All Types' : filterType}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={filterType === 'all'}
                                onCheckedChange={() => setFilterType('all')}
                            >
                                All Tasks
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filterType === 'Daily'}
                                onCheckedChange={() => setFilterType('Daily')}
                            >
                                Daily Tasks
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filterType === 'Weekly'}
                                onCheckedChange={() => setFilterType('Weekly')}
                            >
                                Weekly Tasks
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <ViewSwitcher view={view} onViewChange={setView} />
            </div>

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
            />
        </div>
    );
}
