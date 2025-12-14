"use server";

import { createNote, updateNote, deleteNote } from "@/lib/notes";
import { revalidatePath } from "next/cache";

export async function createNoteAction(formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(Boolean) : [];

    await createNote({ title, content, tags });
    revalidatePath("/notes");
}

export async function updateNoteAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(Boolean) : [];

    // Handle is_favorite separately if needed, but usually it's a separate toggle
    // Here we assume the form might include it, or we handle it in a separate action

    await updateNote(id, { title, content, tags });
    revalidatePath("/notes");
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
    await updateNote(id, { is_favorite: isFavorite });
    revalidatePath("/notes");
}

export async function deleteNoteAction(id: string) {
    await deleteNote(id);
    revalidatePath("/notes");
}
