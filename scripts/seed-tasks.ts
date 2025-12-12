import "dotenv/config";
import { sql } from "../src/lib/db";

async function seedTasks() {
    console.log("Seeding tasks...");

    try {
        // Drop table to ensure schema matches (dev only)
        await sql`DROP TABLE IF EXISTS tasks`;

        // Ensure table exists
        await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK (status IN ('Todo', 'In Progress', 'Done')) NOT NULL DEFAULT 'Todo',
        type TEXT CHECK (type IN ('Daily', 'Weekly')) NOT NULL DEFAULT 'Daily',
        priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
        due_date TIMESTAMP WITH TIME ZONE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE
      );
    `;

        // Fetch existing projects to link tasks
        const projects = await sql`SELECT id, name FROM projects`;

        if (projects.length === 0) {
            console.log("No projects found. Please seed projects first.");
            return;
        }

        const tasks = [
            {
                title: "Fix navigation bug",
                description: "Navigation menu is not closing on mobile click.",
                status: "Todo",
                type: "Daily",
                priority: "High",
                project_index: 0, // Index in the fetched projects array
            },
            {
                title: "Implement user authentication",
                description: "Set up NextAuth.js with Google and GitHub providers.",
                status: "In Progress",
                type: "Weekly",
                priority: "Critical",
                project_index: 0,
            },
            {
                title: "Update documentation",
                description: "Add API reference and setup guide.",
                status: "Done",
                type: "Daily",
                priority: "Low",
                project_index: 1,
            },
            {
                title: "Refactor database schema",
                description: "Optimize queries and add indexes.",
                status: "Todo",
                type: "Weekly",
                priority: "Medium",
                project_index: 1,
            },
            {
                title: "Design new landing page",
                description: "Create high-fidelity mockups in Figma.",
                status: "In Progress",
                type: "Weekly",
                priority: "High",
                project_index: 2,
            },
            {
                title: "Daily standup meeting",
                description: "Discuss progress and blockers.",
                status: "Done",
                type: "Daily",
                priority: "Medium",
                project_index: 0,
            }
        ];

        for (const task of tasks) {
            // Use modulo to cycle through projects if index is out of bounds, or just pick the first one if safe
            const project = projects[task.project_index % projects.length];

            await sql`
        INSERT INTO tasks (
          title, description, status, type, priority, project_id, due_date
        ) VALUES (
          ${task.title},
          ${task.description},
          ${task.status},
          ${task.type},
          ${task.priority},
          ${project.id},
          ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()} -- Due in 7 days
        )
      `;
        }

        console.log("Tasks seeded successfully!");
    } catch (error) {
        console.error("Error seeding tasks:", error);
    }
}

seedTasks();
