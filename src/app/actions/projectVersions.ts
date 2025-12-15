"use server";

import { createProjectVersion } from "@/lib/projectVersions";
import { revalidatePath } from "next/cache";
import { attachCommitToVersion } from "@/lib/commitLinks";

export async function createProjectVersionAction(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;

    if (!projectId || !name) {
        throw new Error("projectId and name are required to create a project version");
    }

    const version = await createProjectVersion(projectId, name, description || undefined);

    // Revalidate project detail page so any version list UI can update
    revalidatePath(`/projects/${projectId}`);

    return { success: true, versionId: version.id };
}

function getRepoFullNameFromUrl(repoUrl: string): string | null {
    try {
        const url = new URL(repoUrl);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0]}/${parts[1]}`;
        }
    } catch (e) {
        // ignore invalid URL
    }
    return null;
}

export async function createVersionWithCommitsAction(params: {
    projectId: string;
    name: string;
    description?: string;
    repoUrl: string;
    commitShas: string[];
}) {
    const { projectId, name, description, repoUrl, commitShas } = params;

    if (!projectId || !name) {
        throw new Error("projectId and name are required to create a project version");
    }

    const version = await createProjectVersion(projectId, name, description);

    const repoFullName = getRepoFullNameFromUrl(repoUrl);

    if (repoFullName && commitShas.length > 0) {
        for (const sha of commitShas) {
            await attachCommitToVersion(version.id, repoFullName, sha);
        }
    }

    revalidatePath(`/projects/${projectId}`);

    return { success: true, versionId: version.id };
}
