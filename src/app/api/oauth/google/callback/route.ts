import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { saveCredentials } from "@/lib/google";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/settings?error=" + error, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/settings?error=no_code", request.url));
    }

    try {
        // We need to fetch the client_id and client_secret from DB (temporarily stored or passed via state? 
        // Actually, usually these are env vars, but here we are allowing user to input them.
        // So we should probably fetch the pending configuration.
        // For simplicity, let's assume we stored the partial config in the DB before redirecting.

        const [integration] = await sql`SELECT credentials FROM integrations WHERE provider = 'google_drive'`;

        if (!integration || !integration.credentials) {
            return NextResponse.redirect(new URL("/settings?error=no_config", request.url));
        }

        const { client_id, client_secret, redirect_uri } = integration.credentials;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uri
        );

        const { tokens } = await oAuth2Client.getToken(code);

        // Merge new tokens with existing credentials
        const newCredentials = {
            ...integration.credentials,
            ...tokens,
        };

        await saveCredentials(newCredentials);

        return NextResponse.redirect(new URL("/settings?success=true", request.url));
    } catch (err) {
        console.error("OAuth Error:", err);
        return NextResponse.redirect(new URL("/settings?error=auth_failed", request.url));
    }
}
