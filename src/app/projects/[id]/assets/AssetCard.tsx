"use client";

import { Asset } from "@/lib/assets";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, ExternalLink, FileText, Code, Lock, File, Download } from "lucide-react";
import { deleteAssetAction } from "@/app/actions/assets";
import { Mermaid } from "@/components/Mermaid";
import { useState } from "react";
import { toast } from "sonner";

interface AssetCardProps {
    asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this asset?")) {
            setIsDeleting(true);
            try {
                await deleteAssetAction(asset.id, asset.project_id);
                toast.success("Asset deleted");
            } catch (error) {
                toast.error("Failed to delete asset");
                setIsDeleting(false);
            }
        }
    };

    const handleCopy = () => {
        if (asset.content) {
            navigator.clipboard.writeText(asset.content);
            toast.success("Copied to clipboard");
        }
    };

    const handleDownload = () => {
        if (asset.content) {
            const link = document.createElement("a");
            link.href = asset.content;
            link.download = asset.description || "download"; // Use description as filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const getIcon = () => {
        switch (asset.type) {
            case "env": return <Lock className="h-4 w-4" />;
            case "diagram": return <Code className="h-4 w-4" />;
            case "link": return <ExternalLink className="h-4 w-4" />;
            case "note": return <FileText className="h-4 w-4" />;
            case "file": return <File className="h-4 w-4" />;
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getIcon()}
                    {asset.name}
                </CardTitle>
                <Badge variant="outline" className="capitalize">{asset.type}</Badge>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                {asset.description && (
                    <p className="text-xs text-muted-foreground mb-4 truncate" title={asset.description}>{asset.description}</p>
                )}

                <div className="rounded-md bg-muted/50 p-2 text-xs overflow-hidden max-h-[200px] relative">
                    {asset.type === "diagram" && asset.content ? (
                        <div className="scale-75 origin-top-left">
                            <Mermaid chart={asset.content} />
                        </div>
                    ) : asset.type === "link" && asset.content ? (
                        <a href={asset.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                            {asset.content}
                        </a>
                    ) : asset.type === "file" && asset.content ? (
                        asset.content.startsWith("data:image") ? (
                            <img src={asset.content} alt={asset.name} className="w-full h-auto object-contain rounded" />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <File className="h-12 w-12 mb-2 opacity-50" />
                                <span>File Preview Unavailable</span>
                            </div>
                        )
                    ) : (
                        <pre className="whitespace-pre-wrap break-all font-mono">
                            {asset.type === "env" ? "********" : asset.content}
                        </pre>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
                {asset.type === "file" && asset.content ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download File">
                        <Download className="h-4 w-4" />
                    </Button>
                ) : asset.content && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy Content">
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete Asset"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
