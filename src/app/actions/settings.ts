"use server";

import { getAuthUrl, saveCredentials } from "@/lib/google";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function initiateGoogleAuth(formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const clientSecret = formData.get("clientSecret") as string;

    // Construct redirect URI dynamically based on current host would be ideal, 
    // but for now let's assume standard localhost or production URL.
    // In a real app, this should be an env var or constructed from headers.
    // For this dev environment, we'll try to infer or hardcode for now.
    const redirectUri = "http://localhost:3000/api/oauth/google/callback";

    // Save partial credentials
    await saveCredentials({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
    });

    const url = await getAuthUrl(clientId, clientSecret, redirectUri);
    redirect(url);
}

export async function disconnectGoogleAuth() {
    await sql`DELETE FROM integrations WHERE provider = 'google_drive'`;
    redirect("/settings");
}

export async function getIntegrationStatus() {
    const [integration] = await sql`
        SELECT is_active, credentials FROM integrations 
        WHERE provider = 'google_drive'
    `;

    return {
        isConnected: !!integration?.is_active,
        clientId: integration?.credentials?.client_id || ""
    };
}

import { saveSetting } from "@/lib/settings";

export async function saveGitHubToken(formData: FormData) {
    const token = formData.get("token") as string;
    if (!token) throw new Error("Token is required");

    await saveSetting("github_token", token);
    revalidatePath("/settings");
}
