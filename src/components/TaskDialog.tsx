"use client";

import { Button } from "@/components/ui/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { createSubtaskAction, deleteSubtaskAction, toggleSubtaskAction, fetchSubtasksAction } from "@/app/actions/subtasks";
import { useState, useEffect } from "react";
import { Task } from "@/lib/tasks";
import { Subtask, getSubtasks } from "@/lib/subtasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { linkTaskToBranchAction, unlinkTaskFromBranchAction, fetchTaskBranchLinksAction, fetchRepoBranchesForTaskAction } from "@/app/actions/branchLinks";
import type { TaskBranchLink } from "@/lib/branchLinks";

import { WorkflowStep } from "@/types";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task;
    projects?: { id: string; name: string; workflow?: WorkflowStep[] }[];
    sections?: { id: string; name: string; project_id: string }[];
    trigger?: React.ReactNode;
    workflow?: WorkflowStep[];
}

export function TaskDialog({ open, onOpenChange, task, projects, sections = [], trigger, workflow }: TaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>(task?.project_id || "");
    const [selectedSectionId, setSelectedSectionId] = useState<string>(task?.section_id || "");
    const [branchLinks, setBranchLinks] = useState<TaskBranchLink[]>([]);
    const [newBranchName, setNewBranchName] = useState("");
    const [availableBranches, setAvailableBranches] = useState<string[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);

    const activeWorkflow = workflow || projects?.find(p => p.id === selectedProjectId)?.workflow;

    useEffect(() => {
        if (task && open) {
            fetchSubtasksAction(task.id).then(setSubtasks);
            setSelectedProjectId(task.project_id || "");
            setSelectedSectionId(task.section_id || "");
            fetchTaskBranchLinksAction(task.id)
                .then(setBranchLinks)
                .catch(() => setBranchLinks([]));

            setIsLoadingBranches(true);
            fetchRepoBranchesForTaskAction(task.id)
                .then((branches) => {
                    setAvailableBranches(branches || []);
                })
                .catch(() => {
                    setAvailableBranches([]);
                })
                .finally(() => {
                    setIsLoadingBranches(false);
                });
        }
    }, [task, open]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);

        try {
            if (task) {
                await updateTaskAction(task.id, formData);
            } else {
                await createTaskAction(formData);
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save task:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
                        <DialogDescription>
                            {task ? "Make changes to your task here." : "Add a new task to your list."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={task?.title}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue={task?.status || (activeWorkflow ? activeWorkflow[0].name : "Todo")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeWorkflow ? (
                                            activeWorkflow.map((step) => (
                                                <SelectItem key={step.id} value={step.name}>
                                                    {step.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value="Todo">Todo</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Done">Done</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={task?.description || ""}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select name="priority" defaultValue={task?.priority || "Medium"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    name="due_date"
                                    type="date"
                                    defaultValue={task?.due_date
                                        ? new Date(task.due_date).toISOString().split("T")[0]
                                        : ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="project_id">Project</Label>
                                <Select
                                    name="project_id"
                                    defaultValue={task?.project_id || ""}
                                    onValueChange={(value) => {
                                        setSelectedProjectId(value);
                                        setSelectedSectionId("none");
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {projects?.map((project) => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="section_id">Section</Label>
                                <Select
                                    name="section_id"
                                    value={selectedSectionId}
                                    onValueChange={setSelectedSectionId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select section (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {sections
                                            .filter(section => !selectedProjectId || selectedProjectId === "none" || section.project_id === selectedProjectId)
                                            .map((section) => (
                                                <SelectItem key={section.id} value={section.id}>
                                                    {section.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Subtasks Section */}
                        {task && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="space-y-1">
                                        <Label>Subtasks</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {subtasks.length === 0 ? "No subtasks yet" :
                                                `${Math.round((subtasks.filter(s => s.is_completed).length / subtasks.length) * 100)}% completed`}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                                        {subtasks.filter(s => s.is_completed).length}/{subtasks.length}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                {subtasks.length > 0 && (
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500 ease-in-out"
                                            style={{ width: `${(subtasks.filter(s => s.is_completed).length / subtasks.length) * 100}%` }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 mt-4">
                                    {subtasks.map(subtask => (
                                        <div
                                            key={subtask.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group transition-colors border border-transparent hover:border-border"
                                        >
                                            <Checkbox
                                                checked={subtask.is_completed}
                                                onCheckedChange={async () => {
                                                    setSubtasks(prev => prev.map(s =>
                                                        s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s
                                                    ));
                                                    await toggleSubtaskAction(subtask.id, task.project_id || undefined);
                                                }}
                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <span className={`text-sm flex-1 transition-all ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {subtask.title}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                onClick={async () => {
                                                    setSubtasks(prev => prev.filter(s => s.id !== subtask.id));
                                                    await deleteSubtaskAction(subtask.id, task.project_id || undefined);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Input
                                        placeholder="Add a subtask..."
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        className="flex-1"
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

                                                const updated = await fetchSubtasksAction(task.id);
                                                setSubtasks(updated);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={async () => {
                                            if (!newSubtaskTitle.trim()) return;

                                            const formData = new FormData();
                                            formData.append("task_id", task.id);
                                            formData.append("title", newSubtaskTitle);
                                            if (task.project_id) formData.append("project_id", task.project_id);

                                            await createSubtaskAction(formData);
                                            setNewSubtaskTitle("");

                                            const updated = await fetchSubtasksAction(task.id);
                                            setSubtasks(updated);
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Branch links (optional) */}
                        {task && (
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4" />
                                        <Label>Linked branches</Label>
                                    </div>
                                </div>
                                {branchLinks.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {branchLinks.map((link) => (
                                            <button
                                                key={`${link.repo_full_name}-${link.branch_name}`}
                                                type="button"
                                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                                                onClick={async () => {
                                                    await unlinkTaskFromBranchAction(task.id, link.repo_full_name, link.branch_name);
                                                    const updated = await fetchTaskBranchLinksAction(task.id);
                                                    setBranchLinks(updated);
                                                }}
                                            >
                                                <span>{link.branch_name}</span>
                                                <span className="text-[10px] text-muted-foreground">×</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No branches linked yet.</p>
                                )}
                                <div className="flex gap-2 items-center">
                                    <Select
                                        value={newBranchName || undefined}
                                        onValueChange={(value) => setNewBranchName(value)}
                                        disabled={isLoadingBranches || availableBranches.length === 0}
                                    >
                                        <SelectTrigger className="h-8 text-sm w-full">
                                            <SelectValue
                                                placeholder={
                                                    isLoadingBranches
                                                        ? "Loading branches from GitHub..."
                                                        : availableBranches.length > 0
                                                            ? "Select branch to link"
                                                            : "No branches available"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableBranches.map((branch) => (
                                                <SelectItem key={branch} value={branch}>
                                                    {branch}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!newBranchName || isLoadingBranches}
                                        onClick={async () => {
                                            const value = newBranchName.trim();
                                            if (!value || !task) return;
                                            const fd = new FormData();
                                            fd.append("task_id", task.id);
                                            fd.append("branch_name", value);
                                            try {
                                                await linkTaskToBranchAction(fd);
                                                setNewBranchName("");
                                                const updated = await fetchTaskBranchLinksAction(task.id);
                                                setBranchLinks(updated);
                                            } catch (err) {
                                                console.error("Failed to link branch:", err);
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Linking a branch is optional and uses the project's GitHub repository, if configured.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
