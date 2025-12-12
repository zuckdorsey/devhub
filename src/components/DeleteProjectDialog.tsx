"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProjectAction } from "@/app/actions";
import { Loader2 } from "lucide-react";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteProjectAction(projectId);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            project <strong>{projectName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
