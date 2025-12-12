"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createAssetAction } from "@/app/actions/assets";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AssetType } from "@/lib/assets";

interface AddAssetDialogProps {
    projectId: string;
}

export function AddAssetDialog({ projectId }: AddAssetDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<AssetType>("note");

    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("project_id", projectId);
        formData.append("type", type);

        try {
            if (type === "file" && file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    formData.set("content", base64);
                    // Store filename in description if not provided, or append it
                    const currentDesc = formData.get("description") as string;
                    if (!currentDesc) {
                        formData.set("description", file.name);
                    }
                    await createAssetAction(formData);
                    toast.success("File uploaded successfully");
                    setOpen(false);
                    setFile(null);
                    (e.target as HTMLFormElement).reset();
                    setLoading(false);
                };
                reader.onerror = () => {
                    toast.error("Failed to read file");
                    setLoading(false);
                };
            } else {
                await createAssetAction(formData);
                toast.success("Asset created successfully");
                setOpen(false);
                (e.target as HTMLFormElement).reset();
                setLoading(false);
            }
        } catch (error) {
            toast.error("Failed to create asset");
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                        Store environment variables, diagrams, links, notes, or files for this project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="env">Environment (.env)</SelectItem>
                                    <SelectItem value="diagram">Diagram (Mermaid)</SelectItem>
                                    <SelectItem value="link">Link</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                    <SelectItem value="file">File</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input id="description" name="description" className="col-span-3" placeholder={type === 'file' ? "Filename will be used if empty" : ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">
                                {type === "file" ? "Upload File" : "Content"}
                                {type === "env" && " (Key=Value pairs)"}
                                {type === "diagram" && " (Mermaid syntax)"}
                                {type === "link" && " (URL)"}
                            </Label>
                            {type === "file" ? (
                                <Input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                />
                            ) : (
                                <Textarea
                                    id="content"
                                    name="content"
                                    className="min-h-[150px] font-mono text-sm"
                                    placeholder={
                                        type === "env" ? "DB_HOST=localhost\nAPI_KEY=xyz" :
                                            type === "diagram" ? "graph TD;\nA-->B;" :
                                                type === "link" ? "https://example.com" :
                                                    "Enter your note here..."
                                    }
                                    required
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Asset"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
