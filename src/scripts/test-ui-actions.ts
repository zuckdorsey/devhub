import "dotenv/config";
import { createProject, deleteProject } from "@/lib/projects";
import { createSectionAction } from "@/app/actions/sections";
import { createSubtaskAction, toggleSubtaskAction } from "@/app/actions/subtasks";
import { getSections } from "@/lib/sections";
import { createTask, getTasksByProjectId } from "@/lib/tasks";
import { getSubtasks } from "@/lib/subtasks";

// Mock FormData
class MockFormData {
    private data: Map<string, string> = new Map();

    append(key: string, value: string) {
        this.data.set(key, value);
    }

    get(key: string) {
        return this.data.get(key) || null;
    }
}

// Monkey patch global FormData if needed, or just cast
const createFormData = (data: Record<string, string>) => {
    const formData = new MockFormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    return formData as any as FormData;
};

async function verifyUIActions() {
    console.log("Starting UI actions verification...");
    let projectId: string | null = null;

    try {
        // 1. Create Project
        console.log("Creating project...");
        const project = await createProject({
            name: "UI Action Test Project",
            status: "In Progress",
            tech_stack: ["Test"],
        });
        projectId = project.id;
        console.log("Project created:", project.id);

        // 2. Test createSectionAction
        console.log("Testing createSectionAction...");
        const sectionFormData = createFormData({
            project_id: project.id,
            name: "Test Section"
        });
        await createSectionAction(sectionFormData);

        const sections = await getSections(project.id);
        if (sections.length !== 1 || sections[0].name !== "Test Section") {
            throw new Error("createSectionAction failed");
        }
        console.log("Section created via action.");

        // 3. Create Task (using lib function as we didn't change task creation action much, but we need a task for subtasks)
        console.log("Creating task...");
        const task = await createTask({
            title: "Test Task",
            status: "Todo",
            priority: "Medium",
            project_id: project.id,
            section_id: sections[0].id
        });
        console.log("Task created:", task.id);

        // 4. Test createSubtaskAction
        console.log("Testing createSubtaskAction...");
        const subtaskFormData = createFormData({
            task_id: task.id,
            title: "Test Subtask",
            project_id: project.id
        });
        await createSubtaskAction(subtaskFormData);

        let subtasks = await getSubtasks(task.id);
        if (subtasks.length !== 1 || subtasks[0].title !== "Test Subtask") {
            throw new Error("createSubtaskAction failed");
        }
        console.log("Subtask created via action.");

        // 5. Test toggleSubtaskAction
        console.log("Testing toggleSubtaskAction...");
        await toggleSubtaskAction(subtasks[0].id, project.id);

        subtasks = await getSubtasks(task.id);
        if (!subtasks[0].is_completed) {
            throw new Error("toggleSubtaskAction failed");
        }
        console.log("Subtask toggled via action.");

        // 6. Verify Task Subtask Counts
        console.log("Verifying task subtask counts...");
        const tasks = await getTasksByProjectId(project.id);
        const updatedTask = tasks.find(t => t.id === task.id);

        if (updatedTask?.subtask_count !== 1 || updatedTask?.completed_subtask_count !== 1) {
            throw new Error(`Task counts mismatch: total=${updatedTask?.subtask_count}, completed=${updatedTask?.completed_subtask_count}`);
        }
        console.log("Task counts verified.");

        console.log("UI actions verification passed successfully!");

    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    } finally {
        if (projectId) {
            console.log("Cleaning up...");
            await deleteProject(projectId);
        }
    }
}

verifyUIActions();
