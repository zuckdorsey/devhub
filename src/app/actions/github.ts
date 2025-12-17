"use server";

import { createProject } from "@/lib/projects";
import { fetchIssuesAndPRs, createIssue, fetchRepositories, getIssuesAndPRs } from "@/lib/github";
import { fetchProjects as fetchVercelProjects } from "@/lib/vercel";
import { createTask as createProjectTask } from "@/lib/tasks";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function importProjectAction(formData: FormData) {
    const repoJson = formData.get("repo") as string;

    if (!repoJson) {
        throw new Error("Repository data is required");
    }

    const repo = JSON.parse(repoJson);

    await createProject({
        name: repo.name,
        description: repo.description || `Imported from ${repo.full_name}`,
        github_repo: repo.html_url,
        tech_stack: repo.language ? [repo.language] : [],
        tags: repo.topics || [],
        status: "In Progress", // Default status for imported projects
        priority: "Medium",
    });

    revalidatePath("/projects");
    redirect("/projects");
}

export async function fetchIssuesAction(owner: string, repo: string) {
    return await fetchIssuesAndPRs(owner, repo);
}

export async function importTasksFromGitHubAction(projectId: string, issuesJson: string) {
    const issues = JSON.parse(issuesJson);

    for (const issue of issues) {
        await createProjectTask({
            title: issue.title,
            description: issue.body || "",
            status: "Todo",
            priority: "Medium", // Default priority
            project_id: projectId,
            github_issue_number: issue.number,
            due_date: undefined,
        });
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function createIssueAction(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoUrl = formData.get("repoUrl") as string;

    if (!title || !repoUrl) {
        throw new Error("Title and Repository URL are required");
    }

    try {
        const url = new URL(repoUrl);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            throw new Error("Invalid Repository URL");
        }

        const [owner, repo] = pathParts;
        await createIssue(owner, repo, title, description);

        revalidatePath("/issues");
        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        }
    } catch (error) {
        console.error("Failed to create issue:", error);
        throw error;
    }
}

export async function fetchGitHubReposAction() {
    try {
        const repos = await fetchRepositories();
        return repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
        }));
    } catch (error) {
        console.error("Failed to fetch GitHub repos:", error);
        return [];
    }
}

export async function fetchVercelProjectsAction() {
    try {
        const projects = await fetchVercelProjects();
        return projects;
    } catch (error) {
        console.error("Failed to fetch Vercel projects:", error);
        return [];
    }
}

export async function fetchGitHubIssuesForRepoAction(repoUrl: string) {
    try {
        const issues = await getIssuesAndPRs(repoUrl, 50);
        return issues.map(issue => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            state: issue.state,
        }));
    } catch (error) {
        console.error("Failed to fetch GitHub issues:", error);
        return [];
    }
}
