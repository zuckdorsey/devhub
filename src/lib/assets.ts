import { sql } from "@/lib/db";

export type AssetType = 'env' | 'diagram' | 'link' | 'note' | 'file';

export type Asset = {
    id: string;
    project_id: string;
    name: string;
    type: AssetType;
    content: string | null;
    description: string | null;
    created_at: string;
};

export async function getAssetsByProjectId(projectId: string): Promise<Asset[]> {
    try {
        const assets = await sql`
            SELECT * FROM project_assets 
            WHERE project_id = ${projectId}
            ORDER BY created_at DESC
        `;
        return assets as Asset[];
    } catch (error) {
        console.error("Error fetching assets:", error);
        throw error;
    }
}

export async function createAsset(data: {
    project_id: string;
    name: string;
    type: AssetType;
    content?: string;
    description?: string;
}): Promise<Asset> {
    try {
        const [asset] = await sql`
            INSERT INTO project_assets (project_id, name, type, content, description)
            VALUES (
                ${data.project_id}, 
                ${data.name}, 
                ${data.type}, 
                ${data.content || null}, 
                ${data.description || null}
            )
            RETURNING *
        `;
        return asset as Asset;
    } catch (error) {
        console.error("Error creating asset:", error);
        throw error;
    }
}

export async function updateAsset(id: string, data: {
    name?: string;
    content?: string;
    description?: string;
}): Promise<Asset> {
    try {
        const [asset] = await sql`
            UPDATE project_assets
            SET 
                name = COALESCE(${data.name || null}, name),
                content = COALESCE(${data.content || null}, content),
                description = COALESCE(${data.description || null}, description)
            WHERE id = ${id}
            RETURNING *
        `;
        return asset as Asset;
    } catch (error) {
        console.error("Error updating asset:", error);
        throw error;
    }
}

export async function deleteAsset(id: string): Promise<void> {
    try {
        await sql`DELETE FROM project_assets WHERE id = ${id}`;
    } catch (error) {
        console.error("Error deleting asset:", error);
        throw error;
    }
}
