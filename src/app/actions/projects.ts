"use server";

import { updateProject } from "@/lib/projects";
import { revalidatePath } from "next/cache";

export async function updateProjectAction(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string | null;
    const priority = formData.get("priority") as string | null;
    const progress = formData.get("progress") ? parseInt(formData.get("progress") as string) : undefined;
    const github_repo = formData.get("github_repo") as string;
    const api_endpoint = formData.get("api_endpoint") as string;
    let vercel_project_id = formData.get("vercel_project_id") as string;

    // Handle "none" value from select dropdown
    if (vercel_project_id === "none") {
        vercel_project_id = "";
    }

    await updateProject(id, {
        name: name || undefined,
        description: description || undefined,
        status: status as any || undefined,
        priority: priority as any || undefined,
        progress,
        github_repo: github_repo || undefined,
        api_endpoint: api_endpoint || undefined,
        vercel_project_id: vercel_project_id || undefined,
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
}
