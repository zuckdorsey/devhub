import { Project } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays } from "lucide-react"

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="secondary" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Active
        </Badge>;
      case "Done":
        return <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Done
        </Badge>;
      case "Idea":
        return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Idea
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Recently"}
            </div>
          </div>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {project.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <Separator />
        <div className="w-full flex justify-end pt-2">
           {/* Add actions here if needed */}
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
