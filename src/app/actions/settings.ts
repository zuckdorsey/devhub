"use server";

import { saveSetting } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function saveGithubTokenAction(formData: FormData) {
    const token = formData.get("token") as string;

    if (!token) {
        throw new Error("Token is required");
    }

    await saveSetting("github_token", token);
    revalidatePath("/settings");
}
