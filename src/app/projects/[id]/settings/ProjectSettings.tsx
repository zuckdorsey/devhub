"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProjectAction } from "@/app/actions/projects";
import { Project } from "@/types";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VercelProject } from "@/lib/vercel";

interface ProjectSettingsProps {
    project: Project;
    vercelProjects?: VercelProject[];
}

export function ProjectSettings({ project, vercelProjects = [] }: ProjectSettingsProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await updateProjectAction(project.id, formData);
            toast.success("Project settings updated");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                        Manage your project configuration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input id="name" name="name" defaultValue={project.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={project.description} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vercel_project_id">Vercel Project</Label>
                                {vercelProjects.length > 0 ? (
                                    <Select name="vercel_project_id" defaultValue={project.vercel_project_id || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Vercel project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {vercelProjects.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="vercel_project_id"
                                        name="vercel_project_id"
                                        defaultValue={project.vercel_project_id}
                                        placeholder="prj_..."
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Link this project to Vercel for deployment tracking.
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="mt-4">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
