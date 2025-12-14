"use client";

import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { sendProjectSummaryAction } from "@/app/actions/whatsapp";
import { useState } from "react";
import { toast } from "sonner";

interface ShareProjectButtonProps {
    projectId: string;
}

export function ShareProjectButton({ projectId }: ShareProjectButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        setLoading(true);
        try {
            await sendProjectSummaryAction(projectId);
            toast.success("Project summary sent to WhatsApp");
        } catch (error) {
            toast.error("Failed to send summary. Check WhatsApp settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleShare} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share
        </Button>
    );
}
