"use client";

import { Note } from "@/lib/notes";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Star, FileText } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface NoteListProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (note: Note) => void;
    onCreateNote: () => void;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote }: NoteListProps) {
    const [search, setSearch] = useState("");

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(search.toLowerCase())) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <div className="flex flex-col h-full border-r bg-muted/10">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes
                    </h2>
                    <Button size="sm" onClick={onCreateNote}>
                        <Plus className="h-4 w-4 mr-1" />
                        New
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {filteredNotes.map((note) => (
                        <button
                            key={note.id}
                            onClick={() => onSelectNote(note)}
                            className={`flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent ${selectedNoteId === note.id ? "bg-accent" : ""
                                }`}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{note.title}</span>
                                        {note.is_favorite && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(note.updated_at), "MM/dd/yyyy")}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {note.content?.substring(0, 100) || "No content"}
                                </p>
                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {note.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                    {filteredNotes.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground text-sm">
                            No notes found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
