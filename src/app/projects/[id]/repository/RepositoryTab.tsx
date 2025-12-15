import {
    getRepoDetails,
    getLanguages,
    getWorkflowRuns,
    getIssuesAndPRs,
    getCommits,
    getContributors
} from "@/lib/github";
import { RepoStats } from "./RepoStats";
import { LanguageChart } from "./LanguageChart";
import { WorkflowStatus } from "./WorkflowStatus";
import { IssueTracker } from "./IssueTracker";
import { CommitHistory } from "./CommitHistory";
import { Contributors } from "./Contributors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getCommitRelationsForProject } from "@/lib/commitLinks";
import { getProjectVersions } from "@/lib/projectVersions";
import { CreateVersionDialog } from "./CreateVersionDialog";
import { getSetting } from "@/lib/settings";

interface RepositoryTabProps {
    repoUrl: string;
    projectId: string;
}

export async function RepositoryTab({ repoUrl, projectId }: RepositoryTabProps) {
    const repo = await getRepoDetails(repoUrl);

    if (!repo) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load repository data. Please check the URL and try again.
                </AlertDescription>
            </Alert>
        );
    }

    // Fetch all other data in parallel
    const [languages, workflows, issues, commits, contributors, versions, warnSetting] = await Promise.all([
        getLanguages(repoUrl),
        getWorkflowRuns(repoUrl),
        getIssuesAndPRs(repoUrl),
        getCommits(repoUrl),
        getContributors(repoUrl),
        getProjectVersions(projectId),
        getSetting("automation_warn_commits_without_task_reference"),
    ]);

    const commitRelations = await getCommitRelationsForProject(projectId, repoUrl, commits);
    const showUnlinkedCommitWarning = warnSetting !== "false";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <RepoStats repo={repo} />

            <div className="flex justify-end">
                <CreateVersionDialog projectId={projectId} repoUrl={repoUrl} commits={commits} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {languages && Object.keys(languages).length > 0 && (
                    <LanguageChart languages={languages} />
                )}
                <WorkflowStatus runs={workflows} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <CommitHistory
                        commits={commits}
                        tasksBySha={commitRelations.tasksBySha}
                        versionsBySha={commitRelations.versionsBySha}
                        versions={versions}
                        projectId={projectId}
                        repoFullName={commitRelations.repoFullName ?? ""}
                        showUnlinkedCommitWarning={showUnlinkedCommitWarning}
                    />
                </div>
                <div className="space-y-6">
                    <Contributors contributors={contributors} />
                    <IssueTracker issues={issues} />
                </div>
            </div>
        </div>
    );
}
