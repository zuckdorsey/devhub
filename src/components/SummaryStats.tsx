"use client";

import { Stats } from "../types";
import { Card, CardContent } from "@/components/ui/card"
import { Activity, CheckCircle2, Lightbulb, Layers, TrendingUp } from "lucide-react"

interface SummaryStatsProps {
  stats: Stats;
}

const statCards = [
  {
    key: "totalProjects",
    title: "Total Projects",
    icon: Layers,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
    subtitle: "All time",
  },
  {
    key: "activeProjects",
    title: "Active",
    icon: Activity,
    gradient: "from-emerald-500 to-green-600",
    bgGradient: "from-emerald-500/10 to-green-600/10",
    subtitle: "In progress",
  },
  {
    key: "completedProjects",
    title: "Completed",
    icon: CheckCircle2,
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-600/10",
    subtitle: "Shipped",
  },
  {
    key: "ideaProjects",
    title: "Ideas",
    icon: Lightbulb,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-600/10",
    subtitle: "Brainstorming",
  },
];

const SummaryStats = ({ stats }: SummaryStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key as keyof Stats];

        return (
          <Card
            key={card.key}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Decorative elements */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">
                      {value}
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    {card.subtitle}
                  </p>
                </div>

                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default SummaryStats;
