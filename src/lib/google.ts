import { google } from 'googleapis';
import { sql } from '@/lib/db';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export async function getGoogleCredentials() {
    const [integration] = await sql`
        SELECT credentials FROM integrations 
        WHERE provider = 'google_drive' AND is_active = TRUE
    `;
    return integration?.credentials;
}

export async function getOAuth2Client() {
    const credentials = await getGoogleCredentials();
    if (!credentials) {
        throw new Error("Google Drive integration not configured");
    }

    const { client_id, client_secret, redirect_uri } = credentials;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
    );

    if (credentials.refresh_token) {
        oAuth2Client.setCredentials({
            refresh_token: credentials.refresh_token,
            access_token: credentials.access_token,
            expiry_date: credentials.expiry_date
        });
    }

    return oAuth2Client;
}

export async function getAuthUrl(clientId: string, clientSecret: string, redirectUri: string) {
    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force refresh token generation
    });
}

export async function saveCredentials(credentials: any) {
    // Check if exists
    const [existing] = await sql`SELECT id FROM integrations WHERE provider = 'google_drive'`;

    if (existing) {
        await sql`
            UPDATE integrations 
            SET credentials = ${credentials}, is_active = TRUE 
            WHERE provider = 'google_drive'
        `;
    } else {
        await sql`
            INSERT INTO integrations (provider, credentials, is_active)
            VALUES ('google_drive', ${credentials}, TRUE)
        `;
    }
}

export async function findOrCreateFolder(drive: any, folderName: string, parentId: string = 'root') {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
    const response = await drive.files.list({
        q,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };

    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });

    return folder.data.id;
}

export async function uploadFileToDrive(fileBase64: string, fileName: string, mimeType: string, projectName?: string) {
    const auth = await getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    let parentId = 'root';

    // 1. Find or Create "DevHub" root folder
    const devHubFolderId = await findOrCreateFolder(drive, 'DevHub', 'root');
    parentId = devHubFolderId;

    // 2. If projectName is provided, Find or Create Project folder inside DevHub
    if (projectName) {
        const projectFolderId = await findOrCreateFolder(drive, projectName, devHubFolderId);
        parentId = projectFolderId;
    }

    const buffer = Buffer.from(fileBase64.split(',')[1], 'base64');

    // Create a readable stream from buffer
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            mimeType: mimeType,
            parents: [parentId],
        },
        media: {
            mimeType: mimeType,
            body: stream,
        },
        fields: 'id, webViewLink, webContentLink',
    });

    // Make file readable by anyone with the link (optional, but good for sharing)
    // Or we rely on the user being logged into Drive. 
    // For now, let's keep it private to the user's drive, but return the link.

    return response.data;
}
