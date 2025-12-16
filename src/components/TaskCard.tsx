"use client";

import { Task } from "@/lib/tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Circle, Clock, MoreVertical, Pencil, Trash2, GitBranch } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTaskAction, deleteTaskAction } from "@/app/actions/tasks";
import Link from "next/link";
import { TaskDialog } from "@/components/TaskDialog";
import { useEffect, useState } from "react";
import { WorkflowStep } from "@/types";
import { createSubtaskAction, deleteSubtaskAction, toggleSubtaskAction, fetchSubtasksAction } from "@/app/actions/subtasks";
import { Subtask } from "@/lib/subtasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { fetchTaskBranchLinksAction } from "@/app/actions/branchLinks";
import type { TaskBranchLink } from "@/lib/branchLinks";

interface TaskCardProps {
    task: Task;
    projects?: { id: string; name: string }[];
    sections?: { id: string; name: string; project_id: string }[];
    workflow?: WorkflowStep[];
}

export function TaskCard({ task, projects = [], sections = [], workflow }: TaskCardProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "text-red-500 bg-red-500/10 border-red-200";
            case "High": return "text-orange-500 bg-orange-500/10 border-orange-200";
            case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-200";
            case "Low": return "text-green-500 bg-green-500/10 border-green-200";
            default: return "text-muted-foreground bg-muted";
        }
    };

    const getStatusIcon = (status: string) => {
        if (workflow) {
            const step = workflow.find(s => s.name === status);
            if (step) {
                // Map type to icon/color
                switch (step.type) {
                    case "completed": return <CheckCircle2 className={`h-5 w-5 text-${step.color}-500`} />;
                    case "started": return <Clock className={`h-5 w-5 text-${step.color}-500`} />;
                    default: return <Circle className={`h-5 w-5 text-${step.color}-500`} />;
                }
            }
        }

        // Fallback
        switch (status) {
            case "Done": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "In Progress": return <Clock className="h-5 w-5 text-blue-500" />;
            default: return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
    const [branchLinks, setBranchLinks] = useState<TaskBranchLink[]>([]);

    useEffect(() => {
        let cancelled = false;
        fetchTaskBranchLinksAction(task.id)
            .then((links) => {
                if (!cancelled) setBranchLinks(links || []);
            })
            .catch(() => {
                if (!cancelled) setBranchLinks([]);
            });
        return () => {
            cancelled = true;
        };
    }, [task.id]);

    const toggleExpand = async () => {
        if (!isExpanded) {
            setIsLoadingSubtasks(true);
            try {
                const fetchedSubtasks = await fetchSubtasksAction(task.id);
                setSubtasks(fetchedSubtasks);
            } catch (error) {
                console.error("Failed to fetch subtasks:", error);
            } finally {
                setIsLoadingSubtasks(false);
            }
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <Card className="hover:shadow-md transition-all duration-300 group border-muted/60">
                <CardHeader className="pb-3 space-y-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">{getStatusIcon(task.status)}</div>
                            <div className="space-y-1">
                                <CardTitle className={`text-base font-semibold leading-none ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                </CardTitle>
                                {task.project_name && (
                                    <Link href={`/projects/${task.project_id}`} className="inline-block">
                                        <Badge variant="outline" className="text-[10px] font-normal hover:bg-accent transition-colors cursor-pointer">
                                            {task.project_name}
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={toggleExpand}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={async () => {
                                        let newStatus = "Todo";
                                        if (workflow) {
                                            // Find next status or toggle between first and last?
                                            // Simple toggle: if completed, go to first step. Else go to last step (completed).
                                            const currentStep = workflow.find(s => s.name === task.status);
                                            const completedStep = workflow.find(s => s.type === "completed");
                                            const firstStep = workflow[0];

                                            if (currentStep?.type === "completed") {
                                                newStatus = firstStep.name;
                                            } else if (completedStep) {
                                                newStatus = completedStep.name;
                                            }
                                        } else {
                                            newStatus = task.status === "Done" ? "Todo" : "Done";
                                        }

                                        const formData = new FormData();
                                        formData.append("status", newStatus);
                                        formData.append("title", task.title);
                                        formData.append("priority", task.priority);
                                        if (task.description) formData.append("description", task.description);
                                        if (task.start_time) formData.append("start_time", task.start_time);
                                        if (task.due_date) formData.append("due_date", task.due_date);
                                        if (task.project_id) formData.append("project_id", task.project_id);

                                        await updateTaskAction(task.id, formData);
                                    }}>
                                        {workflow ? (
                                            workflow.find(s => s.name === task.status)?.type === "completed" ? (
                                                <>
                                                    <Circle className="mr-2 h-4 w-4" />
                                                    Mark as {workflow[0].name}
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Mark as {workflow.find(s => s.type === "completed")?.name || "Done"}
                                                </>
                                            )
                                        ) : (
                                            task.status === "Done" ? (
                                                <>
                                                    <Circle className="mr-2 h-4 w-4" />
                                                    Mark as Todo
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Mark as Done
                                                </>
                                            )
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <div className="flex items-center">
                                                <span className="mr-2">Set Priority</span>
                                            </div>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            {["Low", "Medium", "High", "Critical"].map((priority) => (
                                                <DropdownMenuItem
                                                    key={priority}
                                                    onClick={async () => {
                                                        const formData = new FormData();
                                                        formData.append("priority", priority);
                                                        formData.append("title", task.title);
                                                        formData.append("status", task.status);
                                                        if (task.description) formData.append("description", task.description);
                                                        if (task.start_time) formData.append("start_time", task.start_time);
                                                        if (task.due_date) formData.append("due_date", task.due_date);
                                                        if (task.project_id) formData.append("project_id", task.project_id);

                                                        await updateTaskAction(task.id, formData);
                                                    }}
                                                >
                                                    {priority}
                                                    {task.priority === priority && <CheckCircle2 className="ml-2 h-3 w-3" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to delete this task?")) {
                                                await deleteTaskAction(task.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pb-3 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description || "No description provided."}
                    </p>

                    {isExpanded && (
                        <div className="space-y-3 pt-2 border-t animate-in slide-in-from-top-2 duration-200">
                            {isLoadingSubtasks ? (
                                <div className="text-xs text-muted-foreground text-center py-2">Loading subtasks...</div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {subtasks.map(subtask => (
                                            <div key={subtask.id} className="flex items-center gap-2 group">
                                                <Checkbox
                                                    checked={subtask.is_completed}
                                                    onCheckedChange={async () => {
                                                        // Optimistic update
                                                        setSubtasks(prev => prev.map(s =>
                                                            s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s
                                                        ));
                                                        await toggleSubtaskAction(subtask.id, task.project_id || undefined);
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                                <span className={`text-sm flex-1 transition-all ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                    {subtask.title}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                    onClick={async () => {
                                                        setSubtasks(prev => prev.filter(s => s.id !== subtask.id));
                                                        await deleteSubtaskAction(subtask.id, task.project_id || undefined);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add subtask..."
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            className="h-8 text-sm"
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (!newSubtaskTitle.trim()) return;

                                                    const formData = new FormData();
                                                    formData.append("task_id", task.id);
                                                    formData.append("title", newSubtaskTitle);
                                                    if (task.project_id) formData.append("project_id", task.project_id);

                                                    await createSubtaskAction(formData);
                                                    setNewSubtaskTitle("");

                                                    // Refresh subtasks
                                                    const updated = await fetchSubtasksAction(task.id);
                                                    setSubtasks(updated);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={async () => {
                                                if (!newSubtaskTitle.trim()) return;

                                                const formData = new FormData();
                                                formData.append("task_id", task.id);
                                                formData.append("title", newSubtaskTitle);
                                                if (task.project_id) formData.append("project_id", task.project_id);

                                                await createSubtaskAction(formData);
                                                setNewSubtaskTitle("");

                                                // Refresh subtasks
                                                const updated = await fetchSubtasksAction(task.id);
                                                setSubtasks(updated);
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </Badge>
                        {task.start_time && (
                            <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {new Date(task.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        {task.due_date && (
                            <div className="flex items-center">
                                <CalendarDays className="mr-1 h-3 w-3" />
                                {new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        {(task.subtask_count || 0) > 0 && (
                            <div className="flex items-center" title={`${task.completed_subtask_count}/${task.subtask_count} subtasks completed`}>
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {task.completed_subtask_count}/{task.subtask_count}
                            </div>
                        )}
                    </div>
                    {branchLinks.length > 0 && (
                        <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <div className="flex flex-wrap gap-1">
                                {branchLinks.slice(0, 2).map((link) => (
                                    <Badge
                                        key={`${link.repo_full_name}-${link.branch_name}`}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 h-5"
                                    >
                                        {link.branch_name}
                                    </Badge>
                                ))}
                                {branchLinks.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        +{branchLinks.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                task={task}
                projects={projects}
                sections={sections}
                workflow={workflow}
            />
        </>
    );
}
