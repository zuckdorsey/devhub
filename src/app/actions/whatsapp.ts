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
        (project.start_date ? `*Start:* ${new Date(project.start_date).toLocaleDateString()}\n` : "") +
        (project.end_date ? `*End:* ${new Date(project.end_date).toLocaleDateString()}\n` : "") +
        `\nCheck it out on DevHub!`;

    await sendWhatsAppMessage(target, message);
}
