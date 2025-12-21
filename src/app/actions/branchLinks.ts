"use server";

import { revalidatePath } from "next/cache";
import { linkTaskToBranch, unlinkTaskFromBranch } from "@/lib/branchLinks";
import { getProjectById } from "@/lib/projects";
import { getTaskById } from "@/lib/tasks";
import { getBranches } from "@/lib/github";

function getRepoFullNameFromUrl(repoUrl: string): string | null {
  try {
    const parsed = new URL(repoUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function linkTaskToBranchAction(formData: FormData) {
  const taskId = formData.get("task_id") as string;
  const branchName = (formData.get("branch_name") as string | null)?.trim();

  if (!taskId || !branchName) {
    throw new Error("Missing task_id or branch_name");
  }

  const task = await getTaskById(taskId);
  if (!task || !task.project_id) {
    throw new Error("Task must belong to a project to link a branch");
  }

  const project = await getProjectById(task.project_id);
  if (!project || !project.github_repo) {
    throw new Error("Project does not have a linked GitHub repository");
  }

  const repoFullName = getRepoFullNameFromUrl(project.github_repo);
  if (!repoFullName) {
    throw new Error("Invalid GitHub repository URL on project");
  }

  await linkTaskToBranch(taskId, repoFullName, branchName, "manual");

  try {
    revalidatePath("/tasks");
    revalidatePath(`/projects/${task.project_id}`);
  } catch {
    // ignore revalidate errors in server actions
  }
}

export async function unlinkTaskFromBranchAction(
  taskId: string,
  repoFullName: string,
  branchName: string
) {
  const task = await getTaskById(taskId);
  if (!task || !task.project_id) {
    return;
  }

  await unlinkTaskFromBranch(taskId, repoFullName, branchName);

  try {
    revalidatePath("/tasks");
    revalidatePath(`/projects/${task.project_id}`);
  } catch {
    // ignore
  }
}

export async function fetchTaskBranchLinksAction(taskId: string) {
  const { getBranchesForTask } = await import("@/lib/branchLinks");
  return await getBranchesForTask(taskId);
}

export async function fetchRepoBranchesForTaskAction(taskId: string) {
  const task = await getTaskById(taskId);
  if (!task || !task.project_id) {
    return [] as string[];
  }

  const project = await getProjectById(task.project_id);
  if (!project || !project.github_repo) {
    return [] as string[];
  }

  try {
    const branches = await getBranches(project.github_repo, 100);
    return branches.map((b) => b.name);
  } catch (error) {
    console.error("Failed to fetch GitHub branches for project:", error);
    return [] as string[];
  }
}
