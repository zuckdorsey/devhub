"use client";

import { Task } from "@/lib/tasks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Circle, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import { useState } from "react";

interface TaskCardProps {
    task: Task;
    projects?: { id: string; name: string }[];
}

export function TaskCard({ task, projects = [] }: TaskCardProps) {
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
        switch (status) {
            case "Done": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "In Progress": return <Clock className="h-5 w-5 text-blue-500" />;
            default: return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                                    const newStatus = task.status === "Done" ? "Todo" : "Done";
                                    const formData = new FormData();
                                    formData.append("status", newStatus);
                                    // Preserve other fields
                                    formData.append("title", task.title);
                                    formData.append("type", task.type);
                                    formData.append("priority", task.priority);
                                    if (task.description) formData.append("description", task.description);
                                    if (task.due_date) formData.append("due_date", task.due_date);
                                    if (task.project_id) formData.append("project_id", task.project_id);

                                    await updateTaskAction(task.id, formData);
                                }}>
                                    {task.status === "Done" ? (
                                        <>
                                            <Circle className="mr-2 h-4 w-4" />
                                            Mark as Todo
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Mark as Done
                                        </>
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
                                                    // Preserve other fields
                                                    formData.append("title", task.title);
                                                    formData.append("status", task.status);
                                                    formData.append("type", task.type);
                                                    if (task.description) formData.append("description", task.description);
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
                </CardHeader>

                <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description || "No description provided."}
                    </p>
                </CardContent>

                <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </Badge>
                        {task.due_date && (
                            <div className="flex items-center">
                                <CalendarDays className="mr-1 h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                task={task}
                projects={projects}
            />
        </>
    );
}
