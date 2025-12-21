"use client";

import { GitHubTreeItem } from "@/lib/github";
import { Folder, FolderOpen, FileCode, FileIcon, FileJson, FileType, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileTreeProps {
    tree: GitHubTreeItem[];
    repoUrl: string; // Used for linking to files
}

type TreeNode = {
    name: string;
    path: string;
    type: "blob" | "tree";
    url: string;
    children?: TreeNode[];
};

// Helper to build recursive tree structure
function buildTree(items: GitHubTreeItem[]): TreeNode[] {
    const root: TreeNode[] = [];
    const map = new Map<string, TreeNode>();

    // Sort items so folders come first, then files, alphabetically
    const sortedItems = [...items].sort((a, b) => {
        if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
        return a.path.localeCompare(b.path);
    });

    sortedItems.forEach(item => {
        const parts = item.path.split("/");
        const name = parts.pop()!;
        const parentPath = parts.join("/");

        const node: TreeNode = {
            name,
            path: item.path,
            type: item.type,
            url: item.url,
            children: item.type === "tree" ? [] : undefined
        };

        map.set(item.path, node);

        if (parentPath === "") {
            root.push(node);
        } else {
            const parent = map.get(parentPath);
            if (parent && parent.children) {
                parent.children.push(node);
            }
        }
    });

    return root;
}

const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "ts":
        case "tsx":
        case "js":
        case "jsx":
            return <FileCode className="h-4 w-4 text-blue-500" />;
        case "css":
        case "scss":
        case "html":
            return <FileCode className="h-4 w-4 text-orange-500" />;
        case "json":
        case "yml":
        case "yaml":
            return <FileJson className="h-4 w-4 text-yellow-500" />;
        case "md":
            return <FileType className="h-4 w-4 text-purple-500" />;
        default:
            return <FileIcon className="h-4 w-4 text-muted-foreground" />;
    }
};

const TreeNodeItem = ({ node, level, repoUrl }: { node: TreeNode; level: number; repoUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    // Construct GitHub view URL
    // repoUrl is like https://github.com/owner/repo
    // File view: https://github.com/owner/repo/blob/main/path/to/file
    // Tree view: https://github.com/owner/repo/tree/main/path/to/folder
    // We'll assume 'main' or 'master' (not ideal but quick link) or dynamic if we passed defaultBranch
    // For now, simpler to just assume main or not link yet?
    // Let's use repoUrl + /blob/main/ + path for files
    const fileLink = `${repoUrl}/blob/main/${node.path}`;

    const handleToggle = () => {
        if (node.type === "tree") {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer text-sm select-none transition-colors",
                    level > 0 && "ml-4"
                )}
                onClick={handleToggle}
            >
                {node.type === "tree" && (
                    <span className="text-muted-foreground/60 mr-0.5">
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </span>
                )}

                {node.type === "tree" ? (
                    isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />
                ) : (
                    getFileIcon(node.name)
                )}

                {node.type === "blob" ? (
                    <a href={fileLink} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-primary transition-colors flex-1">
                        {node.name}
                    </a>
                ) : (
                    <span className="truncate flex-1 font-medium">{node.name}</span>
                )}
            </div>

            {isOpen && node.children && (
                <div className="border-l border-border/40 ml-[1.125rem] pl-1">
                    {node.children.map(child => (
                        <TreeNodeItem key={child.path} node={child} level={level + 1} repoUrl={repoUrl} />
                    ))}
                </div>
            )}
        </div>
    );
};

export function FileTree({ tree, repoUrl }: FileTreeProps) {
    const rootNodes = buildTree(tree);

    return (
        <Card className="bg-card/50 border-border/50 h-full max-h-[600px] flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Folder className="h-4 w-4 text-primary" />
                    Files
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-0.5">
                        {rootNodes.map(node => (
                            <TreeNodeItem key={node.path} node={node} level={0} repoUrl={repoUrl} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
