const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    language: string;
    open_issues_count: number;
    default_branch: string;
    updated_at: string;
}

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    html_url: string;
}

export interface GitHubContributor {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

export interface GitHubWorkflowRun {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string;
    created_at: string;
    updated_at: string;
    actor: {
        login: string;
        avatar_url: string;
    };
}

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: "open" | "closed";
    html_url: string;
    created_at: string;
    user: {
        login: string;
        avatar_url: string;
    };
    labels?: Array<{ name: string }>;
    pull_request?: {
        url: string;
    };
}

export interface GitHubTag {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}

export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}

async function fetchGitHub<T>(path: string, options?: RequestInit): Promise<T | null> {
    let token = process.env.GITHUB_TOKEN;

    // Fallback to token stored in settings if env is not set
    if (!token) {
        try {
            const { getSetting } = await import("@/lib/settings");
            const storedToken = await getSetting("github_token");
            if (storedToken) {
                token = storedToken;
            }
        } catch (error) {
            console.error("Failed to load GitHub token from settings:", error);
        }
    }

    const headers: HeadersInit = {
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "DevHub",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${GITHUB_API_BASE}${path}`, {
            ...options,
            headers: {
                ...headers,
                ...options?.headers,
            },
            next: { revalidate: options?.method === 'POST' ? 0 : 60 }, // Don't cache POST requests
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            console.error(`GitHub API error: ${response.status} ${response.statusText} for ${path}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching from GitHub:", error);
        return null;
    }
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
            return { owner: parts[0], repo: parts[1] };
        }
    } catch (e) {
        // Invalid URL
    }
    return null;
}

export async function getRepoDetails(repoUrl: string): Promise<GitHubRepo | null> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return null;
    return fetchGitHub<GitHubRepo>(`/repos/${repoInfo.owner}/${repoInfo.repo}`);
}

export async function getCommits(repoUrl: string, limit = 5): Promise<GitHubCommit[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];

    const { owner, repo } = repoInfo;
    const branch = "main"; // default; UI can be extended later to choose branch

    // Try cache first
    try {
        const { getCachedCommits } = await import("@/lib/githubCommitsCache");
        const cached = await getCachedCommits(`${owner}/${repo}`, branch);
        if (cached && cached.length > 0) {
            // Map cached shape back into minimal GitHubCommit-like objects used by UI
            return cached.slice(0, limit).map((c) => ({
                sha: c.sha,
                commit: {
                    message: c.message,
                    author: {
                        name: c.author,
                        date: c.date,
                    },
                },
                author: null,
                html_url: `https://github.com/${owner}/${repo}/commit/${c.sha}`,
            }));
        }
    } catch (error) {
        console.error("Error reading GitHub commits cache:", error);
    }

    // Cache miss or stale: fetch from GitHub
    const path = `/repos/${owner}/${repo}/commits?per_page=${limit}&sha=${branch}`;
    const commits = await fetchGitHub<GitHubCommit[]>(path);

    if (!commits || commits.length === 0) {
        return [];
    }

    // Save minimal subset into cache for future requests
    try {
        const { saveCachedCommits, mapCommitsToCached } = await import("@/lib/githubCommitsCache");
        const minimal = mapCommitsToCached(commits);
        await saveCachedCommits(`${owner}/${repo}`, branch, minimal);
    } catch (error) {
        console.error("Error saving GitHub commits to cache:", error);
    }

    return commits;
}

export async function getContributors(repoUrl: string, limit = 10): Promise<GitHubContributor[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];
    const contributors = await fetchGitHub<GitHubContributor[]>(`/repos/${repoInfo.owner}/${repoInfo.repo}/contributors?per_page=${limit}`);
    return contributors || [];
}

export async function getLanguages(repoUrl: string): Promise<Record<string, number> | null> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return null;
    return fetchGitHub<Record<string, number>>(`/repos/${repoInfo.owner}/${repoInfo.repo}/languages`);
}

export async function getWorkflowRuns(repoUrl: string, limit = 5): Promise<GitHubWorkflowRun[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];
    const response = await fetchGitHub<{ workflow_runs: GitHubWorkflowRun[] }>(`/repos/${repoInfo.owner}/${repoInfo.repo}/actions/runs?per_page=${limit}`);
    return response?.workflow_runs || [];
}

export async function getIssuesAndPRs(repoUrl: string, limit = 5): Promise<GitHubIssue[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];
    const issues = await fetchGitHub<GitHubIssue[]>(`/repos/${repoInfo.owner}/${repoInfo.repo}/issues?per_page=${limit}&sort=updated&direction=desc`);
    return issues || [];
}

export async function fetchIssuesAndPRs(owner: string, repo: string): Promise<GitHubIssue[]> {
    const issues = await fetchGitHub<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?sort=updated&direction=desc`);
    return issues || [];
}

export async function createIssue(owner: string, repo: string, title: string, body: string): Promise<GitHubIssue | null> {
    return fetchGitHub<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
        method: "POST",
        body: JSON.stringify({ title, body }),
    });
}

export async function fetchRepositories(): Promise<GitHubRepo[]> {
    const repos = await fetchGitHub<GitHubRepo[]>("/user/repos?sort=updated&direction=desc&per_page=100");
    return repos || [];
}

export async function closeIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue | null> {
    return fetchGitHub<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: "PATCH",
        body: JSON.stringify({ state: "closed" }),
    });
}

export async function getTags(repoUrl: string, limit = 50): Promise<GitHubTag[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];

    const tags = await fetchGitHub<GitHubTag[]>(`/repos/${repoInfo.owner}/${repoInfo.repo}/tags?per_page=${limit}`);
    return tags || [];
}

export async function getBranches(repoUrl: string, limit = 100): Promise<GitHubBranch[]> {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) return [];

    const branches = await fetchGitHub<GitHubBranch[]>(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/branches?per_page=${limit}`
    );
    return branches || [];
}
