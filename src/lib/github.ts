import { getSetting } from "./settings";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    topics: string[];
}

interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
    pull_request?: object;
}

export async function getGitHubToken(): Promise<string | null> {
    return await getSetting("github_token");
}

async function fetchGitHub(endpoint: string, token: string) {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
}

export async function fetchRepositories(): Promise<GitHubRepo[]> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error("GitHub token not found");
    }

    // Fetch user's repos (including private ones if scope allows)
    // sort by updated to show recent ones first
    return await fetchGitHub("/user/repos?sort=updated&per_page=100", token);
}

export async function fetchIssuesAndPRs(owner: string, repo: string): Promise<GitHubIssue[]> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error("GitHub token not found");
    }

    return await fetchGitHub(`/repos/${owner}/${repo}/issues?state=open&per_page=50`, token);
}

export async function createIssue(owner: string, repo: string, title: string, body: string): Promise<GitHubIssue> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error("GitHub token not found");
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
}

export async function closeIssue(owner: string, repo: string, issueNumber: number): Promise<void> {
    const token = await getGitHubToken();
    if (!token) {
        throw new Error("GitHub token not found");
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "closed" }),
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }
}
