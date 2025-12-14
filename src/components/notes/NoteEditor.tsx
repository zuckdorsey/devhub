"use client";

import { Note } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Star, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createNoteAction, updateNoteAction, deleteNoteAction, toggleFavoriteAction } from "@/app/actions/notes";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { EditorToolbar } from "./EditorToolbar";

interface NoteEditorProps {
    note: Note | null; // null means creating new note
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState(note?.title || "");
    const [tags, setTags] = useState(note?.tags?.join(", ") || "");
    const [isSaving, setIsSaving] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Markdown.configure({
                html: false,
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content: note?.content || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-6",
            },
        },
    });

    // Update editor content when note changes
    useEffect(() => {
        if (editor && note) {
            // Only update if content is different to avoid cursor jumps or loops
            // For simplicity in this switch, we just set it if it's a new note selection
            // In a real app, you might want to check if content matches
            if ((editor.storage as any).markdown.getMarkdown() !== note.content) {
                editor.commands.setContent(note.content || "");
            }
        }
    }, [note, editor]);

    // Reset form when note changes (for title and tags)
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setTags(note.tags?.join(", ") || "");
        } else {
            setTitle("");
            setTags("");
            editor?.commands.setContent("");
        }
    }, [note, editor]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        setIsSaving(true);
        try {
            const content = (editor?.storage as any).markdown.getMarkdown() || "";
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("tags", tags);

            if (note) {
                await updateNoteAction(note.id, formData);
                toast.success("Note updated");
            } else {
                await createNoteAction(formData);
                toast.success("Note created");
            }
            onSave();
        } catch (error) {
            toast.error("Failed to save note");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!note) return;
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await deleteNoteAction(note.id);
            toast.success("Note deleted");
            onDelete();
        } catch (error) {
            toast.error("Failed to delete note");
        }
    };

    const handleToggleFavorite = async () => {
        if (!note) return;
        try {
            await toggleFavoriteAction(note.id, !note.is_favorite);
            toast.success(note.is_favorite ? "Removed from favorites" : "Added to favorites");
        } catch (error) {
            toast.error("Failed to update favorite status");
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header / Toolbar Area */}
            <div className="flex flex-col border-b">
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2 flex-1 mr-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note Title"
                            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {note && (
                            <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                                <Star className={`h-4 w-4 ${note.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={isSaving} size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                        {note && (
                            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        {!note && (
                            <Button variant="ghost" size="icon" onClick={onCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tags Input */}
                <div className="px-4 pb-2">
                    <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (comma separated)"
                        className="text-sm text-muted-foreground border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                    />
                </div>

                {/* Editor Toolbar */}
                <EditorToolbar editor={editor} />
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-background">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
