import { auth } from "@/auth";
import { getSetting } from "@/lib/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, changePin } from "@/app/actions/profile";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/ProfileForm";
import { ChangePinForm } from "@/components/ChangePinForm";

export default async function ProfilePage() {
    const session = await auth();
    const title = await getSetting("user_title") || "Developer";

    // Fetch fresh data directly from DB to ensure it's up to date
    const name = await getSetting("user_name") || session?.user?.name || "Admin";
    const avatar = await getSetting("user_avatar") || session?.user?.image || "";

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Profile</h1>
                <p className="text-muted-foreground mt-2 text-lg">Manage your personal information and security.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Details */}
                <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Details
                        </CardTitle>
                        <CardDescription>Update your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm initialName={name} initialAvatar={avatar} initialTitle={title} />
                    </CardContent>
                </Card>

                {/* Security / PIN */}
                <Card className="border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Change your access PIN.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePinForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
