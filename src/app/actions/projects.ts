"use server";

import { updateProject } from "@/lib/projects";
import { revalidatePath } from "next/cache";

export async function updateProjectAction(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as any;
    const priority = formData.get("priority") as any;
    const progress = formData.get("progress") ? parseInt(formData.get("progress") as string) : undefined;
    const vercel_project_id = formData.get("vercel_project_id") as string;

    await updateProject(id, {
        name,
        description,
        status,
        priority,
        progress,
        vercel_project_id,
    });

    revalidatePath(`/projects/${id}`);
}
