"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    preview?: "edit" | "preview" | "live";
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder = "Write something...",
    minHeight = 200,
    preview = "edit",
}: MarkdownEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className="border rounded-lg bg-background p-4 text-muted-foreground"
                style={{ minHeight }}
            >
                {placeholder}
            </div>
        );
    }

    return (
        <div data-color-mode="dark" className="w-full">
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                preview={preview}
                height={minHeight}
                textareaProps={{
                    placeholder,
                }}
            />
        </div>
    );
}

// Export a preview-only component for viewing markdown
export function MarkdownPreview({ content }: { content: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="prose prose-sm dark:prose-invert">{content}</div>;
    }

    const MDEditorMarkdown = dynamic(
        () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
        { ssr: false }
    );

    return (
        <div data-color-mode="dark">
            <MDEditorMarkdown source={content} />
        </div>
    );
}
