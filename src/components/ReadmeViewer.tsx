"use client";

import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Register languages
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);

interface ReadmeViewerProps {
    content: string | null;
}

export function ReadmeViewer({ content }: ReadmeViewerProps) {
    if (!content) {
        return (
            <Card className="bg-card/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                    <p>No README found in this repository.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    README.md
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <article className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                    <ReactMarkdown
                        components={{
                            code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <div className="rounded-md overflow-hidden bg-[#282c34] my-4 shadow-sm">
                                        <div className="px-4 py-2 bg-[#21252b] border-b border-[#181a1f] text-xs text-muted-foreground flex justify-between">
                                            <span>{match[1]}</span>
                                        </div>
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                margin: 0,
                                                padding: '1.5rem',
                                                background: 'transparent',
                                                fontSize: '0.9rem',
                                            }}
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            img: ({ alt, ...props }) => {
                                const safeAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "Readme Image";
                                return (
                                    <img
                                        {...props}
                                        className="rounded-lg border shadow-sm max-w-full"
                                        alt={safeAlt}
                                    />
                                );
                            },
                            a: ({ ...props }) => (
                                <a {...props} className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" />
                            ),
                            h1: ({ ...props }) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 border-b pb-2" />,
                            h2: ({ ...props }) => <h2 {...props} className="text-2xl font-bold mt-8 mb-4" />,
                            blockquote: ({ ...props }) => (
                                <blockquote {...props} className="border-l-4 border-primary/50 pl-4 py-1 italic bg-muted/20 rounded-r-md" />
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </article>
            </CardContent>
        </Card>
    );
}
