import { getNotes } from "@/lib/notes";
import { NotesClient } from "./NotesClient";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
    const notes = await getNotes();
    return (
        <div className="container mx-auto p-4 max-w-7xl h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Manage your personal notes, ideas, and documentation.</p>
            </div>
            <NotesClient initialNotes={notes} />
        </div>
    );
}
