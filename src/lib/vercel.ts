import { getSetting } from "./settings";

const VERCEL_API_BASE = "https://api.vercel.com";

export interface VercelDeployment {
    uid: string;
    name: string;
    url: string;
    created: number;
    state: "READY" | "BUILDING" | "ERROR" | "QUEUED" | "CANCELED";
    meta?: {
        githubCommitMessage?: string;
        githubCommitRef?: string;
        githubCommitSha?: string;
    };
}

export async function getVercelToken(): Promise<string | null> {
    return await getSetting("vercel_token");
}

async function fetchVercel(endpoint: string, token: string) {
    const response = await fetch(`${VERCEL_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
    }

    return await response.json();
}

export async function fetchDeployments(projectId: string, limit: number = 5): Promise<VercelDeployment[]> {
    const token = await getVercelToken();
    if (!token) {
        throw new Error("Vercel token not found");
    }

    const data = await fetchVercel(`/v6/deployments?projectId=${projectId}&limit=${limit}`, token);
    return data.deployments;
}

export async function fetchProject(projectId: string) {
    const token = await getVercelToken();
    if (!token) {
        throw new Error("Vercel token not found");
    }

    return await fetchVercel(`/v9/projects/${projectId}`, token);
}

export interface VercelProject {
    id: string;
    name: string;
    updatedAt: number;
}

export async function fetchProjects(): Promise<VercelProject[]> {
    const token = await getVercelToken();
    if (!token) {
        return [];
    }

    try {
        const data = await fetchVercel("/v9/projects", token);
        return data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            updatedAt: p.updatedAt,
        }));
    } catch (error) {
        console.error("Failed to fetch Vercel projects:", error);
        return [];
    }
}
