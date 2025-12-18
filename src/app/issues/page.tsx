import { getProjects } from "@/lib/projects";
import { getIssues } from "@/lib/issues";
import { Badge } from "@/components/ui/badge";
import { CircleDot } from "lucide-react";
import { NewIssueDialog } from "./NewIssueDialog";
import { IssueList } from "./IssueList";
import { ImportGitHubDialog } from "./ImportGitHubDialog";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
    const projects = await getProjects();
    const issues = await getIssues();

    const openIssues = issues.filter((i) => i.status === "open");
    const syncedIssues = issues.filter((i) => i.github_issue_number);
    const localIssues = issues.filter((i) => !i.github_issue_number);

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CircleDot className="h-8 w-8" />
                        Issue Tracker
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage issues. Optionally sync to GitHub.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-3 py-1">
                            {openIssues.length} Open
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            {syncedIssues.length} Synced
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 text-muted-foreground">
                            {localIssues.length} Local
                        </Badge>
                    </div>
                    <ImportGitHubDialog projects={projects} />
                    <NewIssueDialog projects={projects} />
                </div>
            </div>

            <IssueList issues={issues} />
        </div>
    );
}
