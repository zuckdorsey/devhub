"use server";

import { createAsset, deleteAsset, updateAsset, AssetType } from "@/lib/assets";
import { revalidatePath } from "next/cache";
import { getGoogleCredentials, uploadFileToDrive } from "@/lib/google";
import { getProjectById } from "@/lib/projects";

export async function createAssetAction(formData: FormData) {
    const project_id = formData.get("project_id") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as AssetType;
    let content = formData.get("content") as string;
    let description = formData.get("description") as string;

    if (!project_id || !name || !type) {
        throw new Error("Missing required fields");
    }

    // Check for Google Drive integration if type is file
    if (type === 'file' && content) {
        const credentials = await getGoogleCredentials();
        if (credentials) {
            try {
                // Infer mime type from base64 header or default
                const mimeTypeMatch = content.match(/^data:(.*);base64,/);
                const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

                // Fetch project name for folder organization
                const project = await getProjectById(project_id);
                const projectName = project?.name || "Unknown Project";

                const driveFile = await uploadFileToDrive(content, name, mimeType, projectName);

                if (driveFile.webViewLink) {
                    content = driveFile.webViewLink;
                    description = (description ? description + " " : "") + "(Saved to Google Drive)";
                }
            } catch (error) {
                console.error("Failed to upload to Google Drive:", error);
                // Fallback to base64 storage or throw error? 
                // Let's throw for now so user knows it failed.
                throw new Error("Failed to upload to Google Drive");
            }
        }
    }

    await createAsset({
        project_id,
        name,
        type,
        content,
        description,
    });

    revalidatePath(`/projects/${project_id}`);
}

export async function updateAssetAction(id: string, projectId: string, formData: FormData) {
    const name = formData.get("name") as string;
    const content = formData.get("content") as string;
    const description = formData.get("description") as string;

    await updateAsset(id, {
        name: name || undefined,
        content: content || undefined,
        description: description || undefined,
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteAssetAction(id: string, projectId: string) {
    await deleteAsset(id);
    revalidatePath(`/projects/${projectId}`);
}
