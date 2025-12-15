"use server";

import { attachCommitToVersion, detachCommitFromVersion } from "@/lib/commitLinks";
import { revalidatePath } from "next/cache";

export async function attachCommitToVersionAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const projectVersionId = formData.get("projectVersionId") as string;
  const commitSha = formData.get("commitSha") as string;
  const repoFullName = formData.get("repoFullName") as string;

  if (!projectId || !projectVersionId || !commitSha || !repoFullName) {
    throw new Error("projectId, projectVersionId, commitSha, and repoFullName are required");
  }

  await attachCommitToVersion(projectVersionId, repoFullName, commitSha);

  revalidatePath(`/projects/${projectId}`);
}

export async function detachCommitFromVersionAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const projectVersionId = formData.get("projectVersionId") as string;
  const commitSha = formData.get("commitSha") as string;
  const repoFullName = formData.get("repoFullName") as string;

  if (!projectId || !projectVersionId || !commitSha || !repoFullName) {
    throw new Error("projectId, projectVersionId, commitSha, and repoFullName are required");
  }

  await detachCommitFromVersion(projectVersionId, repoFullName, commitSha);

  revalidatePath(`/projects/${projectId}`);
}
