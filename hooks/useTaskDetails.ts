import { TaskService } from "@/services/taskService";
import { Task } from "@/types/database.type";
import { isSameDay } from "date-fns";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useTaskDetail(id?: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [taskCompleted, setTaskCompleted] = useState(false);

  // 1. Fetch Task on Mount / ID change
  useEffect(() => {
    if (id) {
      TaskService.getTaskById(id)
        .then(setTask)
        .catch((err: Error) => console.error("Load Task Error:", err));
    }
  }, [id]);

  // 2. Derive completion availability for today
  const canCompleteToday = useMemo<boolean>(() => {
    if (!task) return false;

    const now = new Date();
    const dayIndex = now.getDay().toString();

    // Exception: Manually added to today
    const isAdHocMatch =
      !!task.adHocDate && isSameDay(new Date(task.adHocDate), now);

    // Rule: Matches standard schedule
    const isScheduledMatch =
      task.type === "one-time"
        ? !!task.startDate && isSameDay(new Date(task.startDate), now)
        : !!task.daysOfWeek?.includes(dayIndex);

    // Check if already completed today in DB
    const isAlreadyDone =
      !!task.lastCompletedDate &&
      isSameDay(new Date(task.lastCompletedDate), now);

    return (isAdHocMatch || isScheduledMatch) && !isAlreadyDone;
  }, [task]);

  // 3. Derive total completion status (Local state OR DB record)
  const isDone = useMemo<boolean>(() => {
    if (taskCompleted) return true;
    if (task?.lastCompletedDate) {
      return isSameDay(new Date(task.lastCompletedDate), new Date());
    }
    console.log("failed to isDone check");
    return false;
  }, [taskCompleted, task]);

  // 4. Handle Task Completion Action
  const handleTaskCompletion = useCallback(async () => {
    if (!task || !id) return;
    try {
      await TaskService.completeTask(task);

      // Refresh task from DB to update streaks/lastCompletedDate
      const updated = await TaskService.getTaskById(id);
      setTask(updated);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTaskCompleted(true);
    } catch (err) {
      console.error("Completion failed", err);
    }
  }, [task, id]);

  return {
    task,
    setTask,
    canCompleteToday,
    isDone,
    handleTaskCompletion,
  };
}
