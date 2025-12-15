import "dotenv/config";
import { getTaskById, createTask, deleteTask } from "@/lib/tasks";

async function testGetTask() {
    console.log("Testing getTaskById...");
    let taskId: string | null = null;

    try {
        // Create a dummy task
        const task = await createTask({
            title: "Test Get Task",
            status: "Todo",
            priority: "Low"
        });
        taskId = task.id;
        console.log("Created task:", taskId);

        // Fetch it
        const fetchedTask = await getTaskById(taskId);
        console.log("Fetched task:", fetchedTask?.title);

        if (fetchedTask?.id !== taskId) {
            throw new Error("Fetched task ID mismatch");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        if (taskId) {
            await deleteTask(taskId);
            console.log("Deleted task");
        }
    }
}

testGetTask();
