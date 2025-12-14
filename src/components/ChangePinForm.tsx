"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePin } from "@/app/actions/profile";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function ChangePinForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await changePin(formData);
            toast.success("PIN changed successfully");
            // Reset form manually or via key if needed, but simple toast is fine for now
            (document.getElementById("change-pin-form") as HTMLFormElement)?.reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to change PIN");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="change-pin-form" action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                    id="currentPin"
                    name="currentPin"
                    type="password"
                    placeholder="Enter current PIN"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Default PIN is <code>123456</code> if you haven&apos;t changed it.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                    id="newPin"
                    name="newPin"
                    type="password"
                    placeholder="Enter new PIN (min 4 digits)"
                    required
                    minLength={4}
                />
            </div>

            <Button type="submit" disabled={loading} variant="secondary">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <KeyRound className="mr-2 h-4 w-4" />
                Update PIN
            </Button>
        </form>
    );
}
