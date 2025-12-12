"use client";

import { Task } from "@/lib/tasks";
import { TaskCard } from "@/components/TaskCard";

interface ProjectTasksProps {
    tasks: Task[];
    projectId: string;
    projectName: string;
}

export function ProjectTasks({ tasks, projectId, projectName }: ProjectTasksProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                <p className="text-muted-foreground">No tasks found for this project.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    projects={[{ id: projectId, name: projectName }]}
                />
            ))}
        </div>
    );
}
