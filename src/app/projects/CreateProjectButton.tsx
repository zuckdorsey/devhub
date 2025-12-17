"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectDialog } from "@/components/ProjectDialog";
import { Plus } from "lucide-react";
import { Task } from "@/lib/tasks";

interface CreateProjectButtonProps {
  tasks?: Task[];
}

export function CreateProjectButton({ tasks = [] }: CreateProjectButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="create"
        tasks={tasks}
      />
    </>
  );
}
