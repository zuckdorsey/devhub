"use client";

import { Task } from "@/lib/tasks";
import { TaskCard } from "@/components/TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { updateTaskAction } from "@/app/actions/tasks";

import { WorkflowStep } from "@/types";

interface TaskBoardViewProps {
    tasks: Task[];
    projects: { id: string; name: string; workflow?: WorkflowStep[] }[];
}

export function TaskBoardView({ tasks, projects }: TaskBoardViewProps) {
    const [optimisticTasks, setOptimisticTasks] = useState(tasks);

    // Update optimistic tasks when props change
    useEffect(() => {
        setOptimisticTasks(tasks);
    }, [tasks]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const columnId = destination.droppableId;
        let newStatus = columnId; // Default fallback

        // Find the task and its project to determine the correct status string
        const task = tasks.find(t => t.id === draggableId);
        if (task) {
            const project = projects.find(p => p.id === task.project_id);
            const workflow = project?.workflow;

            if (workflow) {
                let targetStep;
                if (columnId === "Todo") {
                    targetStep = workflow.find(s => s.type === "unstarted") || workflow.find(s => s.type === "backlog");
                } else if (columnId === "In Progress") {
                    targetStep = workflow.find(s => s.type === "started");
                } else if (columnId === "Done") {
                    targetStep = workflow.find(s => s.type === "completed");
                }

                if (targetStep) {
                    newStatus = targetStep.name;
                }
            } else {
                // Fallback mapping if no workflow
                if (columnId === "Todo") newStatus = "Todo";
                else if (columnId === "In Progress") newStatus = "In Progress";
                else if (columnId === "Done") newStatus = "Done";
            }
        }

        // Optimistic update
        const updatedTasks = optimisticTasks.map(t =>
            t.id === draggableId ? { ...t, status: newStatus } : t
        );
        setOptimisticTasks(updatedTasks);

        // Server action
        if (task) {
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
        }
    };

    const getTasksByStatus = (columnId: string) => {
        return optimisticTasks.filter((task) => {
            const project = projects.find(p => p.id === task.project_id);
            const workflow = project?.workflow;

            if (workflow) {
                const step = workflow.find(s => s.name === task.status);
                if (step) {
                    if (columnId === "Todo") return step.type === "backlog" || step.type === "unstarted";
                    if (columnId === "In Progress") return step.type === "started";
                    if (columnId === "Done") return step.type === "completed" || step.type === "canceled";
                }
            }

            // Fallback for legacy or missing workflow
            if (columnId === "Todo") return task.status === "Todo" || task.status === "Backlog";
            if (columnId === "In Progress") return task.status === "In Progress" || task.status === "Review";
            if (columnId === "Done") return task.status === "Done";

            return false;
        });
    };

    const columns = [
        { id: "Todo", title: "To Do", bg: "bg-muted/30", border: "border-muted", text: "text-muted-foreground", badgeBg: "bg-muted", badgeText: "text-muted-foreground" },
        { id: "In Progress", title: "In Progress", bg: "bg-blue-50/30 dark:bg-blue-950/10", border: "border-blue-200/20", text: "text-blue-500", badgeBg: "bg-blue-100 dark:bg-blue-900/30", badgeText: "text-blue-600 dark:text-blue-400" },
        { id: "Done", title: "Done", bg: "bg-green-50/30 dark:bg-green-950/10", border: "border-green-200/20", text: "text-green-500", badgeBg: "bg-green-100 dark:bg-green-900/30", badgeText: "text-green-600 dark:text-green-400" },
    ];

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {columns.map((column) => {
                    const columnTasks = getTasksByStatus(column.id);
                    return (
                        <div key={column.id} className={`flex flex-col h-full ${column.bg} rounded-lg p-4 border ${column.border} border-dashed`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-semibold text-sm ${column.text} uppercase tracking-wider`}>{column.title}</h3>
                                <span className={`${column.badgeBg} ${column.badgeText} text-xs font-medium px-2 py-0.5 rounded-full`}>
                                    {columnTasks.length}
                                </span>
                            </div>
                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <ScrollArea className="flex-1 -mx-2 px-2">
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-3 pb-4 min-h-[100px]"
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <TaskCard
                                                                task={task}
                                                                projects={projects}
                                                                workflow={projects.find(p => p.id === task.project_id)?.workflow}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {columnTasks.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground text-sm italic">
                                                    No tasks
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
