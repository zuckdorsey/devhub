import "dotenv/config";
import { createProject, deleteProject } from "@/lib/projects";
import { createSection, getSections } from "@/lib/sections";
import { createTask, getTasksByProjectId } from "@/lib/tasks";
import { createSubtask, getSubtasks } from "@/lib/subtasks";

async function verifyHierarchy() {
    console.log("Starting hierarchy verification...");

    let projectId: string | null = null;

    try {
        // 1. Create Project
        console.log("Creating project...");
        const project = await createProject({
            name: "Hierarchy Test Project",
            status: "In Progress",
            tech_stack: ["TypeScript"],
            description: "Testing hierarchy extension",
        });
        projectId = project.id;
        console.log("Project created:", project.id);

        // 2. Create Section
        console.log("Creating section...");
        const section = await createSection({
            project_id: project.id,
            name: "Backend Development",
            order_index: 0,
        });
        console.log("Section created:", section.id);

        // 3. Create Task in Section
        console.log("Creating task in section...");
        const task = await createTask({
            title: "Implement API",
            status: "Todo",
            priority: "High",
            project_id: project.id,
            section_id: section.id,
        });
        console.log("Task created:", task.id);

        // 4. Create Subtask in Task
        console.log("Creating subtask...");
        const subtask = await createSubtask({
            task_id: task.id,
            title: "Design Endpoints",
            order_index: 0,
        });
        console.log("Subtask created:", subtask.id);

        // 5. Verify Relationships
        console.log("Verifying relationships...");

        // Check Sections
        const sections = await getSections(project.id);
        if (sections.length !== 1 || sections[0].id !== section.id) {
            throw new Error("Section verification failed");
        }
        console.log("Sections verified.");

        // Check Tasks
        const tasks = await getTasksByProjectId(project.id);
        const createdTask = tasks.find(t => t.id === task.id);
        if (!createdTask || createdTask.section_id !== section.id) {
            throw new Error("Task verification failed: section_id mismatch");
        }
        console.log("Tasks verified.");

        // Check Subtasks
        const subtasks = await getSubtasks(task.id);
        if (subtasks.length !== 1 || subtasks[0].id !== subtask.id) {
            throw new Error("Subtask verification failed");
        }
        console.log("Subtasks verified.");

        console.log("Hierarchy verification passed successfully!");

    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    } finally {
        // Cleanup
        if (projectId) {
            console.log("Cleaning up...");
            await deleteProject(projectId);
            console.log("Cleanup done.");
        }
    }
}

verifyHierarchy();
