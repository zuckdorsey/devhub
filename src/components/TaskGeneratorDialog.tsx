"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Plus, AlertCircle, Wand2, Check, X } from "lucide-react";
import { generateTasksAction, GeneratedTask } from "@/app/actions/ai";
import { createTaskAction } from "@/app/actions/tasks";
import { createSectionAction } from "@/app/actions/sections";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Section } from "@/lib/sections";
import { WorkflowStep } from "@/types";

interface Project {
    id: string;
    name: string;
    workflow?: WorkflowStep[];
}

interface TaskGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
    sectionId?: string;
    projects: Project[];
    sections: Section[];
}

export function TaskGeneratorDialog({
    open,
    onOpenChange,
    projectId = "all",
    sectionId,
    projects,
    sections: initialSections
}: TaskGeneratorDialogProps) {
    // Generation State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Selection State
    const [targetProjectId, setTargetProjectId] = useState<string>(projectId);
    const [targetSectionId, setTargetSectionId] = useState<string>(sectionId || "unclassified");

    // Section Creation State
    const [localSections, setLocalSections] = useState<Section[]>(initialSections);
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");
    const [isSavingSection, setIsSavingSection] = useState(false);

    const [isSavingTasks, setIsSavingTasks] = useState(false);

    // Update local sections when prop changes
    useEffect(() => {
        setLocalSections(initialSections);
    }, [initialSections]);

    // Update defaults when dialog opens or props change
    useEffect(() => {
        if (open) {
            setTargetProjectId(projectId);
            setTargetSectionId(sectionId || "unclassified");
        }
    }, [open, projectId, sectionId]);

    // Derived sections for the selected project
    const projectSections = useMemo(() => {
        return localSections.filter(s => s.project_id === targetProjectId);
    }, [localSections, targetProjectId]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedTasks([]);
        setSelectedIndices([]);

        try {
            const tasks = await generateTasksAction(prompt);
            setGeneratedTasks(tasks);
            // Auto-select all by default
            setSelectedIndices(tasks.map((_, i) => i));
        } catch (err: any) {
            setError(err.message || "Failed to generate tasks");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleToggleTask = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIndices(generatedTasks.map((_, i) => i));
        } else {
            setSelectedIndices([]);
        }
    };

    const handleCreateSection = async () => {
        if (!newSectionName.trim() || targetProjectId === "all") return;

        setIsSavingSection(true);
        try {
            const formData = new FormData();
            formData.append("project_id", targetProjectId);
            formData.append("name", newSectionName);

            await createSectionAction(formData);

            toast.success("Section created");
            setNewSectionName("");
            setIsCreatingSection(false);

        } catch (err) {
            toast.error("Failed to create section");
        } finally {
            setIsSavingSection(false);
        }
    };

    const handleSaveSelected = async () => {
        if (selectedIndices.length === 0) return;

        setIsSavingTasks(true);
        try {
            const tasksToSave = selectedIndices.map(i => generatedTasks[i]);

            await Promise.all(tasksToSave.map(task => {
                const formData = new FormData();
                formData.append("title", task.title);
                formData.append("description", task.description);
                formData.append("priority", task.priority);
                formData.append("status", "Todo");

                if (targetProjectId && targetProjectId !== "all") {
                    formData.append("project_id", targetProjectId);
                }

                if (targetSectionId && targetSectionId !== "unclassified") {
                    formData.append("section_id", targetSectionId);
                }

                return createTaskAction(formData);
            }));

            toast.success(`Successfully created ${tasksToSave.length} tasks`);
            onOpenChange(false);
            setPrompt("");
            setGeneratedTasks([]);
            setSelectedIndices([]);
        } catch (err) {
            toast.error("Failed to save tasks");
        } finally {
            setIsSavingTasks(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Generate Tasks with AI</DialogTitle>
                    <DialogDescription>
                        Describe your goal or project, and we'll break it down into actionable tasks.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
                    <div className="space-y-2">
                        <Label>What do you want to achieve?</Label>
                        <Textarea
                            placeholder="E.g., Plan a marketing campaign for product launch..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isGenerating || generatedTasks.length > 0}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {generatedTasks.length > 0 && (
                        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
                            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/40">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Project</Label>
                                        <Select value={targetProjectId} onValueChange={setTargetProjectId}>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select Project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Inbox (No Project)</SelectItem>
                                                {projects.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Section</Label>
                                        <div className="flex items-center gap-2">
                                            {isCreatingSection ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        value={newSectionName}
                                                        onChange={(e) => setNewSectionName(e.target.value)}
                                                        placeholder="Name"
                                                        className="h-9 bg-background"
                                                        autoFocus
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-green-500" onClick={handleCreateSection} disabled={isSavingSection}>
                                                        {isSavingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => setIsCreatingSection(false)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Select value={targetSectionId} onValueChange={setTargetSectionId} disabled={targetProjectId === "all"}>
                                                        <SelectTrigger className="bg-background w-full">
                                                            <SelectValue placeholder="Select Section" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unclassified">Unclassified</SelectItem>
                                                            {projectSections.map(s => (
                                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-9 w-9 shrink-0"
                                                        title="Create New Section"
                                                        disabled={targetProjectId === "all"}
                                                        onClick={() => setIsCreatingSection(true)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedIndices.length === generatedTasks.length && generatedTasks.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <Label htmlFor="select-all" className="cursor-pointer">
                                            Select all tasks
                                        </Label>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {selectedIndices.length} selected
                                    </span>
                                </div>
                            </div>

                            <ScrollArea className="h-[350px] rounded-md border p-1">
                                <div className="space-y-2 p-3">
                                    {generatedTasks.map((task, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                                            <Checkbox
                                                id={`task-${index}`}
                                                checked={selectedIndices.includes(index)}
                                                onCheckedChange={() => handleToggleTask(index)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1.5 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label htmlFor={`task-${index}`} className="font-medium cursor-pointer leading-none">
                                                        {task.title}
                                                    </Label>
                                                    <Badge variant={
                                                        task.priority === "High" ? "destructive" :
                                                            task.priority === "Medium" ? "secondary" : "outline"
                                                    } className="text-[10px] h-5">
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {task.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    {generatedTasks.length === 0 ? (
                        <div className="flex justify-between w-full items-center">
                            <span className="text-xs text-muted-foreground">Powered by Advanced AI</span>
                            <Button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Tasks
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setGeneratedTasks([]);
                                    setSelectedIndices([]);
                                    setError(null);
                                }}
                                className="text-muted-foreground"
                            >
                                Clear
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSavingTasks}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveSelected} disabled={selectedIndices.length === 0 || isSavingTasks}>
                                    {isSavingTasks ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add {selectedIndices.length} Tasks
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
