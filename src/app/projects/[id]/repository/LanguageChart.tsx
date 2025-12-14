"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LanguageChartProps {
    languages: Record<string, number>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function LanguageChart({ languages }: LanguageChartProps) {
    const data = Object.entries(languages).map(([name, value]) => ({ name, value }));
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    // Calculate percentages
    const dataWithPercent = data.map(item => ({
        ...item,
        percent: ((item.value / total) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataWithPercent}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataWithPercent.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${((value / total) * 100).toFixed(1)}%`, 'Usage']}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {dataWithPercent.slice(0, 6).map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium">{entry.name}</span>
                            <span className="text-muted-foreground ml-auto">{entry.percent}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
