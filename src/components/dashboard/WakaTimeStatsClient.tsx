"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Code2, Terminal, BarChart3, PieChart, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

interface WakaTimeData {
    total_seconds: number;
    daily_average: number;
    languages: { name: string; percent: number; total_seconds: number }[];
    editors: { name: string; percent: number; total_seconds: number }[];
}

interface WakaTimeStatsClientProps {
    stats: WakaTimeData | null;
}

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

export function WakaTimeStatsClient({ stats }: WakaTimeStatsClientProps) {
    if (!stats) {
        return (
            <Card className="h-full border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        Coding Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[280px] text-muted-foreground text-center p-6">
                    <Clock className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium">No WakaTime data available</p>
                    <p className="text-sm mt-2 text-muted-foreground/70">
                        Configure your API key in Settings
                    </p>
                </CardContent>
            </Card>
        );
    }

    const languageData = stats.languages.map((lang, index) => ({
        name: lang.name,
        value: lang.percent,
        time: formatTime(lang.total_seconds),
        fill: COLORS[index % COLORS.length],
    }));

    const editorData = stats.editors.map((editor, index) => ({
        name: editor.name,
        value: editor.percent,
        time: formatTime(editor.total_seconds),
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <Card className="h-full border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Coding Activity
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">Last 7 Days</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-8 mb-4">
                        <TabsTrigger value="overview" className="text-xs gap-1.5">
                            <Activity className="h-3 w-3" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="languages" className="text-xs gap-1.5">
                            <PieChart className="h-3 w-3" />
                            Languages
                        </TabsTrigger>
                        <TabsTrigger value="editors" className="text-xs gap-1.5">
                            <BarChart3 className="h-3 w-3" />
                            Editors
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20">
                                <p className="text-sm text-muted-foreground">Total Time</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                                    {formatTime(stats.total_seconds)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/20">
                                <p className="text-sm text-muted-foreground">Daily Average</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                                    {formatTime(stats.daily_average)}
                                </p>
                            </div>
                        </div>

                        {/* Quick Language Summary */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Code2 className="h-3.5 w-3.5" />
                                Top Languages
                            </p>
                            <div className="space-y-1.5">
                                {stats.languages.slice(0, 3).map((lang, index) => (
                                    <div key={lang.name} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium">{lang.name}</span>
                                            <span className="text-muted-foreground">{lang.percent.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${lang.percent}%`,
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="languages" className="mt-0">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie
                                        data={languageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                        labelLine={false}
                                    >
                                        {languageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-popover border rounded-lg p-2 shadow-lg">
                                                        <p className="font-medium">{data.name}</p>
                                                        <p className="text-sm text-muted-foreground">{data.time}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="editors" className="mt-0">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={editorData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-popover border rounded-lg p-2 shadow-lg">
                                                        <p className="font-medium">{data.name}</p>
                                                        <p className="text-sm text-muted-foreground">{data.time}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {editorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
