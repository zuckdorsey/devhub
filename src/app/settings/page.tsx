import { GoogleConnectButton } from "@/components/GoogleConnectButton";
import { GitHubSettings } from "@/components/GitHubSettings";
import { getIntegrationStatus } from "@/app/actions/settings";
import { getSetting } from "@/lib/settings";

export default async function SettingsPage() {
    const status = await getIntegrationStatus();
    const githubToken = await getSetting("github_token");

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="grid gap-8">
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold">Integrations</h2>
                    <GitHubSettings initialToken={githubToken || ""} />
                    <GoogleConnectButton
                        isConnected={status.isConnected}
                        savedClientId={status.clientId}
                    />
                </section>
            </div>
        </div>
    );
}
