import { getSetting } from "./settings";

const FONNTE_API_URL = "https://api.fonnte.com/send";

export async function getWhatsAppSettings() {
    const token = await getSetting("whatsapp_token");
    const target = await getSetting("whatsapp_target");
    return { token, target };
}

export async function sendWhatsAppMessage(target: string, message: string) {
    const { token } = await getWhatsAppSettings();

    if (!token) {
        console.warn("WhatsApp token not configured. Message not sent.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("target", target);
        formData.append("message", message);
        formData.append("countryCode", "62"); // Default to Indonesia, can be made configurable

        const response = await fetch(FONNTE_API_URL, {
            method: "POST",
            headers: {
                Authorization: token,
            },
            body: formData,
        });

        const result = await response.json();

        if (!result.status) {
            console.error("Fonnte API Error:", result);
            throw new Error(result.reason || "Failed to send WhatsApp message");
        }

        return result;
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        // Don't throw here to prevent blocking main application flow
    }
}
