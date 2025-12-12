"use client";

import { Task } from "@/lib/tasks";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { TaskDialog } from "@/components/TaskDialog";
import { deleteTaskAction } from "@/app/actions/tasks";
import { useState } from "react";

interface TaskTableViewProps {
    tasks: Task[];
    projects: { id: string; name: string }[];
}

export function TaskTableView({ tasks, projects }: TaskTableViewProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "text-red-500 bg-red-500/10 border-red-200";
            case "High": return "text-orange-500 bg-orange-500/10 border-orange-200";
            case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-200";
            case "Low": return "text-green-500 bg-green-500/10 border-green-200";
            default: return "text-muted-foreground bg-muted";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Done": return <Badge variant="outline" className="border-green-500 text-green-500">Done</Badge>;
            case "In Progress": return <Badge variant="outline" className="border-blue-500 text-blue-500">In Progress</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground">Todo</Badge>;
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{task.title}</span>
                                        {task.description && (
                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                {task.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(task.status)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {task.project_name ? (
                                        <Link href={`/projects/${task.project_id}`} className="hover:underline text-sm text-muted-foreground">
                                            {task.project_name}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.due_date ? (
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <TaskActions task={task} projects={projects} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function TaskActions({ task, projects }: { task: Task; projects: { id: string; name: string }[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Edit task</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                            if (confirm("Are you sure you want to delete this task?")) {
                                await deleteTaskAction(task.id);
                            }
                        }}
                    >
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                task={task}
                projects={projects}
            />
        </>
    );
}
