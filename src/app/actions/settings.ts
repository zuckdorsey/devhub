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

export async function saveVercelToken(formData: FormData) {
    const token = formData.get("token") as string;
    if (!token) throw new Error("Token is required");

    await saveSetting("vercel_token", token);
    revalidatePath("/settings");
}

export async function saveWhatsAppSettings(formData: FormData) {
    const token = formData.get("whatsapp_token") as string;
    const target = formData.get("whatsapp_target") as string;

    if (!token) throw new Error("Token is required");
    if (!target) throw new Error("Target number is required");

    await saveSetting("whatsapp_token", token);
    await saveSetting("whatsapp_target", target);
    revalidatePath("/settings");
}

export async function saveSettingAction(key: string, value: string) {
    if (!key) throw new Error("Key is required");
    if (!value) throw new Error("Value is required");

    await saveSetting(key, value);
    revalidatePath("/settings");
}

export async function saveAISettings(formData: FormData) {
    const provider = formData.get("ai_provider") as string;
    if (!provider) throw new Error("Provider is required");

    await saveSetting("ai_provider", provider);

    if (provider === "gemini") {
        const key = formData.get("gemini_api_key") as string;
        if (key) await saveSetting("gemini_api_key", key);
    } else if (provider === "openrouter") {
        const key = formData.get("openrouter_api_key") as string;
        const model = formData.get("openrouter_model") as string;
        if (key) await saveSetting("openrouter_api_key", key);
        if (model) await saveSetting("openrouter_model", model);
    }

    revalidatePath("/settings");
}
