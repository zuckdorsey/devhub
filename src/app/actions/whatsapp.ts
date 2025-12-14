"use server";

import { getProjectById } from "@/lib/projects";
import { getWhatsAppSettings, sendWhatsAppMessage } from "@/lib/whatsapp";

export async function sendProjectSummaryAction(projectId: string) {
    const project = await getProjectById(projectId);
    if (!project) throw new Error("Project not found");

    const { target } = await getWhatsAppSettings();
    if (!target) throw new Error("WhatsApp target number not configured in Settings");

    const message = `*Project Summary* 📊\n\n` +
        `*Name:* ${project.name}\n` +
        `*Status:* ${project.status}\n` +
        `*Priority:* ${project.priority || "Medium"}\n` +
        `*Progress:* ${project.progress}%\n` +
        (project.timeline ? `*Timeline:* ${new Date(project.timeline).toLocaleDateString()}\n` : "") +
        `\nCheck it out on DevHub!`;

    await sendWhatsAppMessage(target, message);
}
