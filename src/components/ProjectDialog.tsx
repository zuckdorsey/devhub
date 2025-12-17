"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Project } from "@/types";
import { Task } from "@/lib/tasks";
import { createProjectAction, updateProjectAction } from "@/app/actions";
import {
  fetchGitHubReposAction,
  fetchVercelProjectsAction,
  fetchGitHubIssuesForRepoAction,
} from "@/app/actions/github";
import {
  Loader2,
  X,
  Plus,
  Github,
  Globe,
  Settings,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  status: z.enum(["Idea", "In Progress", "Done", "On Hold"]),
  tech_stack: z.string().min(1, "At least one technology is required"),
  description: z.string().optional(),
  api_endpoint: z.string().optional(),
  github_repo: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  progress: z.number().min(0).max(100),
  related_issues: z.string().optional(),
  related_tasks: z.string().optional(),
  tags: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  documentation_links: z.string().optional(),
  vercel_project_id: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

interface VercelProject {
  id: string;
  name: string;
  updatedAt: number;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  mode: "create" | "edit";
  tasks?: Task[];
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  mode,
  tasks = [],
}: ProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [vercelProjects, setVercelProjects] = useState<VercelProject[]>([]);
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingVercel, setIsLoadingVercel] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [repoPopoverOpen, setRepoPopoverOpen] = useState(false);
  const [vercelPopoverOpen, setVercelPopoverOpen] = useState(false);
  const [tasksPopoverOpen, setTasksPopoverOpen] = useState(false);
  const [issuesPopoverOpen, setIssuesPopoverOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      status: project?.status || "Idea",
      tech_stack: project?.tech_stack?.join(", ") || "",
      description: project?.description || "",
      api_endpoint: project?.api_endpoint || "",
      github_repo: project?.github_repo || "",
      priority: project?.priority || "Medium",
      progress: project?.progress || 0,
      related_issues: project?.related_issues?.join(", ") || "",
      related_tasks: project?.related_tasks?.join(", ") || "",
      tags: project?.tags?.join(", ") || "",
      start_date: project?.start_date ? project.start_date.split("T")[0] : "",
      end_date: project?.end_date ? project.end_date.split("T")[0] : "",
      documentation_links: project?.documentation_links?.join(", ") || "",
      vercel_project_id: project?.vercel_project_id || "",
    },
  });

  const selectedGithubRepo = form.watch("github_repo");

  useEffect(() => {
    if (open) {
      setIsLoadingRepos(true);
      setIsLoadingVercel(true);

      fetchGitHubReposAction()
        .then(setGithubRepos)
        .finally(() => setIsLoadingRepos(false));

      fetchVercelProjectsAction()
        .then(setVercelProjects)
        .finally(() => setIsLoadingVercel(false));

      if (project?.related_tasks) {
        setSelectedTasks(project.related_tasks);
      }
      if (project?.related_issues) {
        setSelectedIssues(project.related_issues);
      }
    }
  }, [open, project]);

  useEffect(() => {
    if (selectedGithubRepo) {
      setIsLoadingIssues(true);
      fetchGitHubIssuesForRepoAction(selectedGithubRepo)
        .then(setGithubIssues)
        .finally(() => setIsLoadingIssues(false));
    } else {
      setGithubIssues([]);
    }
  }, [selectedGithubRepo]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleIssue = (issueNumber: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueNumber)
        ? prev.filter((num) => num !== issueNumber)
        : [...prev, issueNumber]
    );
  };

  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("status", data.status);
    formData.append("tech_stack", data.tech_stack);
    formData.append("description", data.description || "");
    formData.append("api_endpoint", data.api_endpoint || "");
    formData.append("github_repo", data.github_repo || "");
    formData.append("priority", data.priority);
    formData.append("progress", data.progress.toString());
    formData.append("related_issues", selectedIssues.join(", "));
    formData.append("related_tasks", selectedTasks.join(", "));
    formData.append("tags", data.tags || "");
    formData.append("start_date", data.start_date || "");
    formData.append("end_date", data.end_date || "");
    formData.append("documentation_links", data.documentation_links || "");
    formData.append("vercel_project_id", data.vercel_project_id || "");

    try {
      const result =
        mode === "create"
          ? await createProjectAction(formData)
          : await updateProjectAction(project!.id, formData);

      if (result.success) {
        onOpenChange(false);
        form.reset();
        setSelectedTasks([]);
        setSelectedIssues([]);
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{mode === "create" ? "Create Project" : "Edit Project"}</DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Add a new project to your dashboard."
                  : "Make changes to your project here."}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="related">Related Items</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="My Project"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Idea">💡 Idea</SelectItem>
                        <SelectItem value="In Progress">🔄 In Progress</SelectItem>
                        <SelectItem value="Done">✅ Done</SelectItem>
                        <SelectItem value="On Hold">⏸️ On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe your project..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={form.watch("priority")}
                      onValueChange={(value) => form.setValue("priority", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">🟢 Low</SelectItem>
                        <SelectItem value="Medium">🟡 Medium</SelectItem>
                        <SelectItem value="High">🟠 High</SelectItem>
                        <SelectItem value="Critical">🔴 Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Progress</Label>
                      <span className="text-sm text-muted-foreground">{form.watch("progress")}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[form.watch("progress")]}
                      onValueChange={(vals) => form.setValue("progress", vals[0])}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tech_stack">Tech Stack</Label>
                    <Input
                      id="tech_stack"
                      {...form.register("tech_stack")}
                      placeholder="Next.js, TypeScript, Tailwind"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      {...form.register("tags")}
                      placeholder="API, Frontend"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...form.register("start_date")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...form.register("end_date")}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* GitHub Repository */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </Label>
                    <Popover open={repoPopoverOpen} onOpenChange={setRepoPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !form.watch("github_repo") && "text-muted-foreground"
                          )}
                        >
                          {isLoadingRepos ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</>
                          ) : form.watch("github_repo") ? (
                            <span className="truncate">
                              {githubRepos.find((r) => r.html_url === form.watch("github_repo"))?.full_name ||
                                form.watch("github_repo")}
                            </span>
                          ) : (
                            "Select repository"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No repository found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem onSelect={() => { form.setValue("github_repo", ""); setRepoPopoverOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", !form.watch("github_repo") ? "opacity-100" : "opacity-0")} />
                                None
                              </CommandItem>
                              {githubRepos.map((repo) => (
                                <CommandItem
                                  key={repo.id}
                                  value={repo.full_name}
                                  onSelect={() => { form.setValue("github_repo", repo.html_url); setRepoPopoverOpen(false); }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", form.watch("github_repo") === repo.html_url ? "opacity-100" : "opacity-0")} />
                                  {repo.full_name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Vercel Project */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Vercel Project
                    </Label>
                    <Popover open={vercelPopoverOpen} onOpenChange={setVercelPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !form.watch("vercel_project_id") && "text-muted-foreground"
                          )}
                        >
                          {isLoadingVercel ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</>
                          ) : form.watch("vercel_project_id") ? (
                            vercelProjects.find((p) => p.id === form.watch("vercel_project_id"))?.name ||
                            form.watch("vercel_project_id")
                          ) : (
                            "Select project"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem onSelect={() => { form.setValue("vercel_project_id", ""); setVercelPopoverOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", !form.watch("vercel_project_id") ? "opacity-100" : "opacity-0")} />
                                None
                              </CommandItem>
                              {vercelProjects.map((proj) => (
                                <CommandItem
                                  key={proj.id}
                                  value={proj.name}
                                  onSelect={() => { form.setValue("vercel_project_id", proj.id); setVercelPopoverOpen(false); }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", form.watch("vercel_project_id") === proj.id ? "opacity-100" : "opacity-0")} />
                                  {proj.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_endpoint" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      API Endpoint
                    </Label>
                    <Input
                      id="api_endpoint"
                      {...form.register("api_endpoint")}
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentation_links">Documentation Links</Label>
                    <Input
                      id="documentation_links"
                      {...form.register("documentation_links")}
                      placeholder="https://docs.example.com"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated</p>
                  </div>
                </div>
              </TabsContent>

              {/* Related Tab */}
              <TabsContent value="related" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Related Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Related Tasks</Label>
                      <span className="text-xs text-muted-foreground">{selectedTasks.length} selected</span>
                    </div>

                    {selectedTasks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedTasks.map((taskId) => {
                          const task = tasks.find((t) => t.id === taskId);
                          return task ? (
                            <Badge key={taskId} variant="secondary" className="text-xs">
                              {task.title.slice(0, 25)}{task.title.length > 25 ? "..." : ""}
                              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleTask(taskId)} />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}

                    <Popover open={tasksPopoverOpen} onOpenChange={setTasksPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add tasks
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search tasks..." />
                          <CommandList>
                            <CommandEmpty>No tasks found.</CommandEmpty>
                            <CommandGroup>
                              {tasks.map((task) => (
                                <CommandItem key={task.id} value={task.title} onSelect={() => toggleTask(task.id)}>
                                  <Checkbox checked={selectedTasks.includes(task.id)} className="mr-2" />
                                  <span className="truncate">{task.title}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Related Issues */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Related Issues</Label>
                      <span className="text-xs text-muted-foreground">{selectedIssues.length} selected</span>
                    </div>

                    {selectedIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedIssues.map((num) => (
                          <Badge key={num} variant="secondary" className="text-xs">
                            #{num}
                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleIssue(num)} />
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Popover open={issuesPopoverOpen} onOpenChange={setIssuesPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={!selectedGithubRepo}
                        >
                          {isLoadingIssues ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</>
                          ) : !selectedGithubRepo ? (
                            "Select GitHub repo first"
                          ) : (
                            <><Plus className="h-4 w-4 mr-2" /> Add issues</>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search issues..." />
                          <CommandList>
                            <CommandEmpty>No issues found.</CommandEmpty>
                            <CommandGroup>
                              {githubIssues.map((issue) => (
                                <CommandItem
                                  key={issue.id}
                                  value={`#${issue.number} ${issue.title}`}
                                  onSelect={() => toggleIssue(issue.number.toString())}
                                >
                                  <Checkbox checked={selectedIssues.includes(issue.number.toString())} className="mr-2" />
                                  <span className="truncate">#{issue.number} {issue.title}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!selectedGithubRepo && (
                      <p className="text-xs text-muted-foreground">
                        Link a GitHub repository in the Integrations tab to see issues.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Project" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
