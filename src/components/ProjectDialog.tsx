"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Project } from "@/types";
import { createProjectAction, updateProjectAction } from "@/app/actions";
import { Loader2 } from "lucide-react";

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
  timeline: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  mode: "create" | "edit";
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  mode,
}: ProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      timeline: project?.timeline ? project.timeline.split('T')[0] : "",
    },
  });

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
    formData.append("related_issues", data.related_issues || "");
    formData.append("related_tasks", data.related_tasks || "");
    formData.append("tags", data.tags || "");
    formData.append("timeline", data.timeline || "");

    try {
      const result =
        mode === "create"
          ? await createProjectAction(formData)
          : await updateProjectAction(project!.id, formData);

      if (result.success) {
        onOpenChange(false);
        form.reset();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new project to your dashboard."
              : "Update the project details."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Idea">💡 Idea</SelectItem>
                        <SelectItem value="In Progress">🔄 In Progress</SelectItem>
                        <SelectItem value="Done">✅ Done</SelectItem>
                        <SelectItem value="On Hold">⏸️ On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">🟢 Low</SelectItem>
                        <SelectItem value="Medium">🟡 Medium</SelectItem>
                        <SelectItem value="High">🟠 High</SelectItem>
                        <SelectItem value="Critical">🔴 Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Progress - {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_endpoint"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>API Endpoint</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github_repo"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>GitHub Repository</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/user/repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tech_stack"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tech Stack</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Next.js, TypeScript, Tailwind"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate technologies with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="API, Frontend, Backend" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Timeline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="related_issues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Issues</FormLabel>
                    <FormControl>
                      <Input placeholder="#1, #2, #3" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="related_tasks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Tasks</FormLabel>
                    <FormControl>
                      <Input placeholder="Task 1, Task 2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Create Project" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
