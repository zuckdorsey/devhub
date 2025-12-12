import "dotenv/config";
import { sql } from "../src/lib/db";

async function seedProjects() {
    console.log("Seeding projects...");

    try {
        // Drop table to ensure schema matches (dev only)
        await sql`DROP TABLE IF EXISTS projects`;

        // Ensure table exists (idempotent if already created by schema.sql, but good for safety)
        await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        name TEXT NOT NULL,
        status TEXT CHECK (status IN ('Idea', 'In Progress', 'Done', 'On Hold')) NOT NULL DEFAULT 'Idea',
        tech_stack TEXT[] NOT NULL,
        description TEXT,
        api_endpoint TEXT,
        github_repo TEXT,
        priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
        progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
        related_issues TEXT[] DEFAULT ARRAY[]::TEXT[],
        related_tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        timeline TIMESTAMP WITH TIME ZONE
      );
    `;

        // Clear existing data (optional, but good for clean seed)
        // await sql`DELETE FROM projects`; 

        const projects = [
            {
                name: "E-commerce Platform",
                status: "In Progress",
                tech_stack: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
                description: "A full-featured e-commerce platform with cart, checkout, and admin dashboard.",
                api_endpoint: "https://api.shop-example.com",
                github_repo: "https://github.com/user/shop-example",
                priority: "High",
                progress: 65,
                tags: ["e-commerce", "full-stack"],
            },
            {
                name: "Portfolio Website",
                status: "Done",
                tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
                description: "Personal portfolio website showcasing projects and skills.",
                api_endpoint: null,
                github_repo: "https://github.com/user/portfolio",
                priority: "Medium",
                progress: 100,
                tags: ["portfolio", "frontend"],
            },
            {
                name: "Task Management App",
                status: "Idea",
                tech_stack: ["Vue.js", "Firebase"],
                description: "A simple task management app with real-time updates.",
                api_endpoint: null,
                github_repo: null,
                priority: "Low",
                progress: 0,
                tags: ["productivity", "app"],
            },
            {
                name: "AI Chatbot",
                status: "On Hold",
                tech_stack: ["Python", "FastAPI", "OpenAI"],
                description: "An AI-powered chatbot for customer support.",
                api_endpoint: "https://api.chatbot.com",
                github_repo: "https://github.com/user/ai-chatbot",
                priority: "Critical",
                progress: 30,
                tags: ["ai", "backend"],
            },
        ];

        for (const project of projects) {
            await sql`
        INSERT INTO projects (
          name, status, tech_stack, description, api_endpoint, github_repo, priority, progress, tags
        ) VALUES (
          ${project.name},
          ${project.status},
          ${project.tech_stack},
          ${project.description},
          ${project.api_endpoint},
          ${project.github_repo},
          ${project.priority},
          ${project.progress},
          ${project.tags}
        )
      `;
        }

        console.log("Projects seeded successfully!");
    } catch (error) {
        console.error("Error seeding projects:", error);
    }
}

seedProjects();
