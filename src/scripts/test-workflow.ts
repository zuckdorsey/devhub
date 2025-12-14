import "dotenv/config";
import { createProject, deleteProject, getProjectById } from "@/lib/projects";
import { createTask, deleteTask, updateTask } from "@/lib/tasks";

async function testWorkflow() {
    console.log("Testing workflow...");
    let projectId: string | null = null;
    let taskId: string | null = null;

    try {
        // 1. Create a new project
        console.log("Creating project...");
        const project = await createProject({
            name: "Workflow Test Project",
            status: "In Progress",
            tech_stack: ["TypeScript"],
            description: "Testing workflows"
        });
        projectId = project.id;
        console.log("Project created:", project.id);
        console.log("Workflow:", project.workflow);

        if (!project.workflow || project.workflow.length === 0) {
            throw new Error("Project created without workflow!");
        }

        // 2. Create a task with a status from the workflow
        console.log("Creating task...");
        const task = await createTask({
            title: "Test Task",
            status: "Backlog", // Should be valid in new default workflow
            type: "Daily",
            priority: "Medium",
            project_id: projectId
        });
        taskId = task.id;
        console.log("Task created:", task.id, "Status:", task.status);

        if (task.status !== "Backlog") {
            throw new Error("Task status mismatch!");
        }

        // 3. Update task status
        console.log("Updating task status...");
        const updatedTask = await updateTask(task.id, {
            status: "Review"
        });
        console.log("Task updated:", updatedTask.status);

        if (updatedTask.status !== "Review") {
            throw new Error("Task update failed!");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        // Cleanup
        if (taskId) {
            console.log("Deleting task...");
            await deleteTask(taskId);
        }
        if (projectId) {
            console.log("Deleting project...");
            await deleteProject(projectId);
        }
    }
}

testWorkflow();
