import { Task } from "@/lib/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ListTodo, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface RecentTasksProps {
    tasks: Task[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
    const todoCount = tasks.filter(t => t.status === "Todo").length;
    const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
    const doneCount = tasks.filter(t => t.status === "Done").length;

    const recentTasks = tasks.slice(0, 5);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Critical": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "High": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "Medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Todo": return <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />;
            case "In Progress": return <Clock className="h-3.5 w-3.5 text-amber-500" />;
            case "Done": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
            default: return null;
        }
    };

    return (
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ListTodo className="h-5 w-5 text-primary" />
                        Recent Tasks
                    </CardTitle>
                    <Link href="/tasks">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                            View All
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Summary */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold">{todoCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Todo</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-500/10">
                        <div className="text-lg font-bold text-amber-500">{inProgressCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                        <div className="text-lg font-bold text-emerald-500">{doneCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Done</div>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-2">
                    {recentTasks.length > 0 ? (
                        recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                {getStatusIcon(task.status)}
                                <span className="flex-1 text-sm truncate">{task.title}</span>
                                <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No tasks yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
