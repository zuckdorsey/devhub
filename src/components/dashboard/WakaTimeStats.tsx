import { getWakaTimeStats } from "@/lib/wakatime";
import { WakaTimeStatsClient } from "./WakaTimeStatsClient";

export async function WakaTimeStats() {
    const stats = await getWakaTimeStats();
    return <WakaTimeStatsClient stats={stats} />;
}
