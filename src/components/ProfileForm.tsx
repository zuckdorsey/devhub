"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/app/actions/profile";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
    initialName: string;
    initialAvatar: string;
    initialTitle: string;
}

export function ProfileForm({ initialName, initialAvatar, initialTitle }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(initialAvatar);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-muted">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-xl">{initialName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                        id="avatar"
                        name="avatar"
                        placeholder="https://example.com/avatar.jpg"
                        defaultValue={initialAvatar}
                        onChange={(e) => setAvatarPreview(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    defaultValue={initialName}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Senior Developer"
                    defaultValue={initialTitle}
                />
            </div>

            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </form>
    );
}
