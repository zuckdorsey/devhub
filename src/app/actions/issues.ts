"use server";

import {
    getIssues,
    getIssuesByProjectId,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue,
    markIssueAsSynced,
    importGitHubIssue,
} from "@/lib/issues";
import { getProjectById } from "@/lib/projects";
import { createIssue as createGitHubIssue, fetchIssuesAndPRs } from "@/lib/github";
import { revalidatePath } from "next/cache";

export async function getIssuesAction() {
    return await getIssues();
}

export async function getIssuesByProjectAction(projectId: string) {
    return await getIssuesByProjectId(projectId);
}

export async function createIssueAction(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as "open" | "closed") || "open";
    const priority = (formData.get("priority") as string) || "Medium";
    const project_id = formData.get("project_id") as string;
    const labelsStr = formData.get("labels") as string;
    const due_date = formData.get("due_date") as string;
    const syncToGitHub = formData.get("sync_to_github") === "true";

    const labels = labelsStr
        ? labelsStr.split(",").map((l) => l.trim()).filter(Boolean)
        : [];

    if (!title) {
        throw new Error("Title is required");
    }

    let github_issue_number: number | undefined;
    let github_issue_url: string | undefined;

    // If sync to GitHub is requested
    if (syncToGitHub && project_id) {
        const project = await getProjectById(project_id);
        if (project?.github_repo) {
            try {
                const url = new URL(project.github_repo);
                const pathParts = url.pathname.split("/").filter(Boolean);
                if (pathParts.length >= 2) {
                    const [owner, repo] = pathParts;
                    const ghIssue = await createGitHubIssue(owner, repo, title, description || "");
                    if (ghIssue) {
                        github_issue_number = ghIssue.number;
                        github_issue_url = ghIssue.html_url;
                    }
                }
            } catch (error) {
                console.error("Failed to create GitHub issue:", error);
            }
        }
    }

    const issue = await createIssue({
        title,
        description: description || undefined,
        status,
        priority: priority as any,
        project_id: project_id || undefined,
        labels,
        due_date: due_date || undefined,
        github_issue_number,
        github_issue_url,
    });

    revalidatePath("/issues");
    if (project_id) {
        revalidatePath(`/projects/${project_id}`);
    }

    return { success: true, issue };
}

export async function updateIssueAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "open" | "closed";
    const priority = formData.get("priority") as string;
    const project_id = formData.get("project_id") as string;
    const labelsStr = formData.get("labels") as string;
    const due_date = formData.get("due_date") as string;

    const labels = labelsStr
        ? labelsStr.split(",").map((l) => l.trim()).filter(Boolean)
        : undefined;

    const issue = await updateIssue(id, {
        title: title || undefined,
        description: description || undefined,
        status: status || undefined,
        priority: priority as any || undefined,
        project_id: project_id || undefined,
        labels,
        due_date: due_date || undefined,
    });

    revalidatePath("/issues");
    if (issue.project_id) {
        revalidatePath(`/projects/${issue.project_id}`);
    }

    return { success: true, issue };
}

export async function deleteIssueAction(id: string) {
    const issue = await getIssueById(id);
    await deleteIssue(id);

    revalidatePath("/issues");
    if (issue?.project_id) {
        revalidatePath(`/projects/${issue.project_id}`);
    }

    return { success: true };
}

export async function syncIssueToGitHubAction(id: string) {
    const issue = await getIssueById(id);
    if (!issue) {
        throw new Error("Issue not found");
    }

    if (issue.github_issue_number) {
        throw new Error("Issue is already synced to GitHub");
    }

    if (!issue.project_id) {
        throw new Error("Issue must be linked to a project with GitHub repo");
    }

    const project = await getProjectById(issue.project_id);
    if (!project?.github_repo) {
        throw new Error("Project does not have a GitHub repository");
    }

    try {
        const url = new URL(project.github_repo);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            throw new Error("Invalid GitHub repository URL");
        }

        const [owner, repo] = pathParts;
        const ghIssue = await createGitHubIssue(owner, repo, issue.title, issue.description || "");

        if (ghIssue) {
            const updatedIssue = await markIssueAsSynced(id, ghIssue.number, ghIssue.html_url);
            revalidatePath("/issues");
            return { success: true, issue: updatedIssue };
        }

        throw new Error("Failed to create GitHub issue");
    } catch (error) {
        console.error("Failed to sync to GitHub:", error);
        throw error;
    }
}

export async function importGitHubIssuesAction(projectId: string) {
    const project = await getProjectById(projectId);
    if (!project?.github_repo) {
        throw new Error("Project does not have a GitHub repository");
    }

    try {
        const url = new URL(project.github_repo);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            throw new Error("Invalid GitHub repository URL");
        }

        const [owner, repo] = pathParts;
        const ghIssues = await fetchIssuesAndPRs(owner, repo);

        // Filter out PRs, only import issues
        const issues = ghIssues.filter((i: any) => !i.pull_request);

        const imported: any[] = [];
        for (const ghIssue of issues) {
            const localIssue = await importGitHubIssue({
                title: ghIssue.title,
                description: ghIssue.body || undefined,
                status: ghIssue.state as "open" | "closed",
                project_id: projectId,
                github_issue_number: ghIssue.number,
                github_issue_url: ghIssue.html_url,
                labels: ghIssue.labels?.map((l: any) => l.name) || [],
            });
            imported.push(localIssue);
        }

        revalidatePath("/issues");
        revalidatePath(`/projects/${projectId}`);

        return { success: true, imported: imported.length };
    } catch (error) {
        console.error("Failed to import GitHub issues:", error);
        throw error;
    }
}

export async function fetchGitHubIssuesPreviewAction(projectId: string) {
    const project = await getProjectById(projectId);
    if (!project?.github_repo) {
        return [];
    }

    try {
        const url = new URL(project.github_repo);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            return [];
        }

        const [owner, repo] = pathParts;
        const ghIssues = await fetchIssuesAndPRs(owner, repo);

        // Filter out PRs
        return ghIssues
            .filter((i: any) => !i.pull_request)
            .map((i: any) => ({
                number: i.number,
                title: i.title,
                state: i.state,
                html_url: i.html_url,
                labels: i.labels?.map((l: any) => l.name) || [],
            }));
    } catch (error) {
        console.error("Failed to fetch GitHub issues preview:", error);
        return [];
    }
}
