"use client";

import { useState } from "react";
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, MoreVertical, Pencil, Trash2, Github, Globe, ArrowUpRight } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import Link from "next/link";

interface ProjectCardActionsProps {
  project: Project;
}

export function ProjectCardActions({ project }: ProjectCardActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "In Progress":
        return { dot: "bg-green-500", badge: "bg-green-500/10 text-green-600 border-green-200" };
      case "Done":
        return { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-600 border-blue-200" };
      case "Idea":
        return { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-600 border-purple-200" };
      case "On Hold":
        return { dot: "bg-orange-500", badge: "bg-orange-500/10 text-orange-600 border-orange-200" };
      default:
        return { dot: "bg-gray-500", badge: "bg-gray-500/10 text-gray-600 border-gray-200" };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/10 text-red-600 border-red-200";
      case "High": return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "Low": return "bg-green-500/10 text-green-600 border-green-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getProgressGradient = (progress: number) => {
    if (progress >= 80) return "from-green-500 to-emerald-400";
    if (progress >= 50) return "from-blue-500 to-cyan-400";
    if (progress >= 25) return "from-yellow-500 to-amber-400";
    return "from-orange-500 to-red-400";
  };

  const statusStyles = getStatusStyles(project.status);

  return (
    <>
      <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <CardHeader className="pb-3 relative">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Link href={`/projects/${project.id}`} className="block group/title">
                <CardTitle className="text-lg font-semibold group-hover/title:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                  {project.name}
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                </CardTitle>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {project.created_at
                  ? new Date(project.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })
                  : "Recently"}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`gap-1.5 text-xs border ${statusStyles.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                {project.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 relative space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description provided."}
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
              <Badge variant="outline" className={`text-xs font-medium border ${getPriorityStyles(project.priority || 'Medium')}`}>
                {project.priority || 'Medium'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressGradient(project.progress || 0)} transition-all duration-500 ease-out`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack?.slice(0, 4).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal bg-secondary/50">
                  {tech}
                </Badge>
              ))}
              {project.tech_stack && project.tech_stack.length > 4 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground">
                  +{project.tech_stack.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-4 px-6 bg-muted/20 border-t border-border/50 flex gap-2 relative">
          {project.github_repo && (
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5 bg-background/50 hover:bg-background" asChild>
              <a href={project.github_repo} target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </Button>
          )}
          {project.api_endpoint && (
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5 bg-background/50 hover:bg-background" asChild>
              <a href={project.api_endpoint} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3.5 w-3.5" />
                Live
              </a>
            </Button>
          )}
          {!project.github_repo && !project.api_endpoint && (
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-background/50" asChild>
              <Link href={`/projects/${project.id}`}>
                View Details
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <ProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
        mode="edit"
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectId={project.id}
        projectName={project.name}
      />
    </>
  );
}
