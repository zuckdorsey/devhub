import { Project } from "../types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "In Progress":
        return {
          badge: <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            In Progress
          </Badge>,
          accent: "group-hover:shadow-emerald-500/10",
        };
      case "Done":
        return {
          badge: <Badge className="gap-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Completed
          </Badge>,
          accent: "group-hover:shadow-blue-500/10",
        };
      case "Idea":
        return {
          badge: <Badge className="gap-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Idea
          </Badge>,
          accent: "group-hover:shadow-amber-500/10",
        };
      case "On Hold":
        return {
          badge: <Badge className="gap-1.5 bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            On Hold
          </Badge>,
          accent: "group-hover:shadow-orange-500/10",
        };
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          accent: "",
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${statusConfig.accent}`}>
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glass overlay */}
        <div className="absolute inset-[1px] rounded-xl bg-card/95 backdrop-blur-xl" />

        <CardHeader className="relative pb-3 z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1">
              <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
                {project.name}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : "Recently"}
              </div>
            </div>
            {statusConfig.badge}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description provided."}
          </p>
        </CardContent>

        <CardFooter className="relative z-10 pt-0">
          <div className="w-full flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground/70">
              Click to view details
            </span>
            <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <span className="text-xs font-medium">View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProjectCard;
