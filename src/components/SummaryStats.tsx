import { Stats } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, Lightbulb, Layers } from "lucide-react"

interface SummaryStatsProps {
  stats: Stats;
}

const SummaryStats = ({ stats }: SummaryStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Projects
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            All time
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            In progress
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedProjects}</div>
          <p className="text-xs text-muted-foreground">
            Shipped
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ideas
          </CardTitle>
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ideaProjects}</div>
          <p className="text-xs text-muted-foreground">
            Brainstorming
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SummaryStats;
