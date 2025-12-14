import "dotenv/config";
import { getAllSections } from "@/lib/sections";

async function verifyGetAllSections() {
    console.log("Verifying getAllSections...");
    try {
        const sections = await getAllSections();
        console.log(`Fetched ${sections.length} sections.`);
        if (sections.length > 0) {
            console.log("Sample section:", sections[0]);
            if (!sections[0].project_id) {
                console.error("Section missing project_id!");
            }
        }
    } catch (error) {
        console.error("Error fetching sections:", error);
    }
}

verifyGetAllSections();
