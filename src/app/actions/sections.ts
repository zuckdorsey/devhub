"use server";

import { createSection, deleteSection, updateSection } from "@/lib/sections";
import { revalidatePath } from "next/cache";

export async function createSectionAction(formData: FormData) {
    const project_id = formData.get("project_id") as string;
    const name = formData.get("name") as string;

    if (!project_id || !name) {
        throw new Error("Missing required fields");
    }

    const section = await createSection({
        project_id,
        name,
    });

    try {
        revalidatePath(`/projects/${project_id}`);
    } catch (error) {
        console.warn("revalidatePath failed (expected in test script):", error);
    }

    return section;
}

export async function updateSectionAction(id: string, projectId: string, formData: FormData) {
    const name = formData.get("name") as string;

    await updateSection(id, {
        name: name || undefined,
    });

    try {
        revalidatePath(`/projects/${projectId}`);
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}

export async function deleteSectionAction(id: string, projectId: string) {
    await deleteSection(id);
    try {
        revalidatePath(`/projects/${projectId}`);
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}
