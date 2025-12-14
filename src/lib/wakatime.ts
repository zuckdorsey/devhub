import { getSetting } from "./settings";

const WAKATIME_API_BASE = "https://wakatime.com/api/v1";

export interface WakaTimeStats {
    total_seconds: number;
    daily_average: number;
    languages: { name: string; percent: number; total_seconds: number }[];
    editors: { name: string; percent: number; total_seconds: number }[];
}

export async function getWakaTimeStats(): Promise<WakaTimeStats | null> {
    try {
        const apiKey = await getSetting("wakatime_api_key");
        if (!apiKey) return null;

        const encodedKey = Buffer.from(apiKey).toString("base64");
        const response = await fetch(`${WAKATIME_API_BASE}/users/current/stats/last_7_days`, {
            headers: {
                Authorization: `Basic ${encodedKey}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`WakaTime API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const stats = data.data;

        return {
            total_seconds: stats.total_seconds,
            daily_average: stats.daily_average,
            languages: stats.languages.slice(0, 5), // Top 5 languages
            editors: stats.editors.slice(0, 3), // Top 3 editors
        };
    } catch (error) {
        console.error("Error fetching WakaTime stats:", error);
        return null;
    }
}
