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
import { CalendarDays, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";

interface ProjectCardActionsProps {
  project: Project;
}

export function ProjectCardActions({ project }: ProjectCardActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="secondary" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Active
          </Badge>
        );
      case "Done":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Done
          </Badge>
        );
      case "Idea":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Idea
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 group border-muted/60 flex flex-col h-full overflow-hidden">
        <div className="relative flex-1 flex flex-col">
          {/* Clickable Area */}
          <a href={`/projects/${project.id}`} className="absolute inset-0 z-0 block" aria-label={`View details for ${project.name}`}>
            <span className="sr-only">View details</span>
          </a>

          <CardHeader className="pb-3 relative z-10 pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1 mr-2">
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })
                    : "Recently"}
                </div>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                {getStatusBadge(project.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditDialogOpen(true); }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 relative z-10 pointer-events-none">
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-6">
              {project.description || "No description provided."}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Priority</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${project.priority === 'Critical' ? 'bg-red-500/10 text-red-600 border-red-200' :
                  project.priority === 'High' ? 'bg-orange-500/10 text-orange-600 border-orange-200' :
                    project.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200' :
                      'bg-green-500/10 text-green-600 border-green-200'
                  }`}>{project.priority}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.tech_stack?.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                    {tech}
                  </Badge>
                ))}
                {project.tech_stack && project.tech_stack.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
                    +{project.tech_stack.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>

        <CardFooter className="pt-4 pb-4 px-6 bg-muted/30 border-t flex gap-2 relative z-20">
          {project.github_repo ? (
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
              <a href={project.github_repo} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                GitHub
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled>
              No Repo
            </Button>
          )}
          {project.api_endpoint ? (
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
              <a href={project.api_endpoint} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                API
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled>
              No API
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
