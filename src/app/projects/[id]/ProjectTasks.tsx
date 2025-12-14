"use client";

import { Task } from "@/lib/tasks";
import { Section } from "@/lib/sections";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, FolderPlus } from "lucide-react";
import { useState } from "react";
import { createSectionAction, deleteSectionAction, updateSectionAction } from "@/app/actions/sections";
import { TaskDialog } from "@/components/TaskDialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { WorkflowStep } from "@/types";

interface ProjectTasksProps {
    tasks: Task[];
    sections: Section[];
    projectId: string;
    projectName: string;
    workflow?: WorkflowStep[];
}

export function ProjectTasks({ tasks, sections, projectId, projectName, workflow }: ProjectTasksProps) {
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Group tasks by section
    const tasksBySection: Record<string, Task[]> = {};
    const unsectionedTasks: Task[] = [];

    tasks.forEach(task => {
        if (task.section_id) {
            if (!tasksBySection[task.section_id]) {
                tasksBySection[task.section_id] = [];
            }
            tasksBySection[task.section_id].push(task);
        } else {
            unsectionedTasks.push(task);
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-2">
                <TaskDialog
                    open={isTaskDialogOpen}
                    onOpenChange={setIsTaskDialogOpen}
                    projects={[{ id: projectId, name: projectName }]}
                    sections={sections}
                    workflow={workflow}
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    }
                />
                <Dialog open={isCreateSectionOpen} onOpenChange={setIsCreateSectionOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form action={async (formData) => {
                            formData.append("project_id", projectId);
                            await createSectionAction(formData);
                            setIsCreateSectionOpen(false);
                        }}>
                            <DialogHeader>
                                <DialogTitle>Create Section</DialogTitle>
                                <DialogDescription>
                                    Add a new section to organize your tasks.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" name="name" className="col-span-3" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Section</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
                    <DialogContent>
                        <form action={async (formData) => {
                            if (editingSection) {
                                await updateSectionAction(editingSection.id, projectId, formData);
                                setEditingSection(null);
                            }
                        }}>
                            <DialogHeader>
                                <DialogTitle>Edit Section</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        defaultValue={editingSection?.name}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Render Sections */}
            {sections.map(section => (
                <div key={section.id} className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {section.name}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {tasksBySection[section.id]?.length || 0}
                            </span>
                        </h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingSection(section)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={async () => {
                                        if (confirm("Delete this section? Tasks will be unsectioned.")) {
                                            await deleteSectionAction(section.id, projectId);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {tasksBySection[section.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasksBySection[section.id].map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    projects={[{ id: projectId, name: projectName }]}
                                    sections={sections}
                                    workflow={workflow}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border rounded-lg bg-muted/5 border-dashed">
                            <p className="text-sm text-muted-foreground">No tasks in this section</p>
                        </div>
                    )}
                </div>
            ))}

            {/* Unsectioned Tasks */}
            {unsectionedTasks.length > 0 && (
                <div className="space-y-4">
                    {sections.length > 0 && (
                        <h3 className="text-lg font-semibold text-muted-foreground">Unsectioned</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unsectionedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                projects={[{ id: projectId, name: projectName }]}
                                sections={sections}
                                workflow={workflow}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tasks.length === 0 && sections.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground">No tasks or sections found.</p>
                </div>
            )}
        </div>
    );
}
