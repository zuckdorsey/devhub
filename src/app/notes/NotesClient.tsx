"use client";

import { Note } from "@/lib/notes";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setSelectedNoteId(id);
            setIsCreating(false);
        } else if (searchParams.get("new") === "true") {
            setSelectedNoteId(null);
            setIsCreating(true);
        } else {
            setSelectedNoteId(null);
            setIsCreating(false);
        }
    }, [searchParams]);

    const selectedNote = initialNotes.find(n => n.id === selectedNoteId) || null;

    const handleSelectNote = (note: Note) => {
        setSelectedNoteId(note.id);
        setIsCreating(false);
        router.push(`/notes?id=${note.id}`);
    };

    const handleCreateNote = () => {
        setSelectedNoteId(null);
        setIsCreating(true);
        router.push(`/notes?new=true`);
    };

    const handleSave = () => {
        router.refresh(); // Refresh to get updated list
        // After save, we might want to stay on the note or go back list
        // For simplicity, let's go back to list or keep editing if we could get the ID
        // Since we don't have the ID easily from the void action here without more complex state,
        // let's just refresh.
    };

    const handleDelete = () => {
        setSelectedNoteId(null);
        setIsCreating(false);
        router.push("/notes");
        router.refresh();
    };

    const handleCancel = () => {
        setIsCreating(false);
        setSelectedNoteId(null);
        router.push("/notes");
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="w-80 flex-shrink-0 border-r bg-muted/5">
                <NoteList
                    notes={initialNotes}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={handleSelectNote}
                    onCreateNote={handleCreateNote}
                />
            </div>
            <div className="flex-1 flex flex-col bg-background">
                {(selectedNote || isCreating) ? (
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/5">
                        <div className="p-6 rounded-full bg-muted/10 mb-4">
                            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="font-medium">Select a note to view</p>
                        <p className="text-sm mt-1 opacity-70">or create a new one to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
