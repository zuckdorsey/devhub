"use server";

import { revalidatePath } from "next/cache";
import { createProject, updateProject, deleteProject } from "@/lib/projects";

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const status = formData.get("status") as "Idea" | "In Progress" | "Done" | "On Hold";
  const techStack = formData.get("tech_stack") as string;
  const description = formData.get("description") as string;
  const apiEndpoint = formData.get("api_endpoint") as string;
  const githubRepo = formData.get("github_repo") as string;
  const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
  const progress = parseInt(formData.get("progress") as string) || 0;
  const relatedIssues = formData.get("related_issues") as string;
  const relatedTasks = formData.get("related_tasks") as string;
  const tags = formData.get("tags") as string;
  const timeline = formData.get("timeline") as string;

  try {
    await createProject({
      name,
      status,
      tech_stack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
      description,
      api_endpoint: apiEndpoint || undefined,
      github_repo: githubRepo || undefined,
      priority: priority || 'Medium',
      progress,
      related_issues: relatedIssues ? relatedIssues.split(",").map((t) => t.trim()).filter(Boolean) : [],
      related_tasks: relatedTasks ? relatedTasks.split(",").map((t) => t.trim()).filter(Boolean) : [],
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      timeline: timeline || undefined,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const status = formData.get("status") as "Idea" | "In Progress" | "Done" | "On Hold";
  const techStack = formData.get("tech_stack") as string;
  const description = formData.get("description") as string;
  const apiEndpoint = formData.get("api_endpoint") as string;
  const githubRepo = formData.get("github_repo") as string;
  const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
  const progress = parseInt(formData.get("progress") as string) || 0;
  const relatedIssues = formData.get("related_issues") as string;
  const relatedTasks = formData.get("related_tasks") as string;
  const tags = formData.get("tags") as string;
  const timeline = formData.get("timeline") as string;

  try {
    await updateProject(id, {
      name,
      status,
      tech_stack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
      description,
      api_endpoint: apiEndpoint || undefined,
      github_repo: githubRepo || undefined,
      priority: priority || 'Medium',
      progress,
      related_issues: relatedIssues ? relatedIssues.split(",").map((t) => t.trim()).filter(Boolean) : [],
      related_tasks: relatedTasks ? relatedTasks.split(",").map((t) => t.trim()).filter(Boolean) : [],
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      timeline: timeline || undefined,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await deleteProject(id);
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
