import { databases, DATABASE_ID, TASKS_TABLE_ID } from "@/lib/appwrite"; // Adjust paths to your config
import { Query, ID, Models } from "react-native-appwrite";
import { Task } from "@/types/database.type";

export const TaskService = {
  // 1. GET ALL TASKS (For a specific user)
  fetchUserTasks: async (userId: string): Promise<Task[]> => {
    try {
      const res = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        [Query.equal("creatorId", userId), Query.orderDesc("$updatedAt")]
      );
      return res.documents;
    } catch (err) {
      console.error("Appwrite fetch error:", err);
      throw err;
    }
  },

  // 2. GET SINGLE TASK
  getTaskById: async (taskId: string): Promise<Task> => {
    return await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_TABLE_ID,
      taskId
    );
  },

  // 3. UPDATE TASK (Used for completion or editing)
  updateTask: async (
    taskId: string,
    updates: Partial<Omit<Task, keyof Models.Document>>
  ) => {
    try {
      return await databases.updateDocument<Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        taskId,
        updates
      );
    } catch (err) {
      console.error("Appwrite update error:", err);
      throw err;
    }
  },

  completeTask: async (task: Task) => {
    const isOneTime = task.type === "one-time";
    const today = new Date().toISOString();

    const updates: Partial<Task> = isOneTime
      ? { isCompleted: true, status: "completed" }
      : {
          lastCompletedDate: today,
          streakCount: (task.streakCount || 0) + 1,
        };

    return await TaskService.updateTask(task.$id, updates);
  },

  // 4. DELETE TASK
  deleteTask: async (taskId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, TASKS_TABLE_ID, taskId);
      return true;
    } catch (err) {
      console.error("Appwrite delete error:", err);
      return false;
    }
  },

  // 5. CREATE TASK
  createTask: async (
    userId: string,
    taskData: Omit<Task, keyof Models.Document | "creatorId">
  ) => {
    try {
      return await databases.createDocument<Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        ID.unique(),
        {
          ...taskData,
          creatorId: userId,
        }
      );
    } catch (err) {
      console.error("Appwrite creation error:", err);
      throw err;
    }
  },
};
