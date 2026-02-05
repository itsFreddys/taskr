import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Animated } from "react-native";
import { FlatList } from "react-native";
import { isSameDay, isToday, parseISO, addDays, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";
import { Models, Query } from "react-native-appwrite";
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { calculateNewStreak } from "@/lib/utils/streakUtils";
import { Task } from "@/types/database.type";

export const useStreaksLogic = (user: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeButton, setActiveButton] = useState<string>("all");
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createVisible, setCreateVisible] = useState(false);

  const today = startOfDay(new Date());
  const flatListRef = useRef<FlatList>(null);

  // Inside Streakscreen or hook
  const todayPulseAnim = useRef(new Animated.Value(1)).current;

  const triggerPulse = () => {
    // 🟢 Resets and runs a quick "pop" animation
    todayPulseAnim.setValue(1);
    Animated.sequence([
      Animated.timing(todayPulseAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(todayPulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 🟢 Update your jumpToToday
  const jumpToToday = useCallback(() => {
    setSelectedDate(today);
    // Adjust index to match your calendarData generation (starts at -14)
    const todayIndex = 15;

    flatListRef.current?.scrollToIndex({
      index: todayIndex,
      viewPosition: 0,
      animated: true,
    });

    // 🟢 3. Trigger pulse after scroll starts
    setTimeout(triggerPulse, 300);
  }, [today, triggerPulse]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const response = await databases.listDocuments<Models.Document & Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        [Query.equal("creatorId", user.$id)]
      );
      setTasks(response.documents);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.$id !== taskId));
    try {
      await databases.deleteDocument(DATABASE_ID, TASKS_TABLE_ID, taskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      fetchTasks();
    }
  };

  const handleToggleTask = async (taskId: string, targetStatus: string) => {
    const isCompleting = targetStatus === "completed";
    const targetTask = tasks.find((t) => t.$id === taskId);
    if (!targetTask) return;

    let newStreak = targetTask.streakCount || 0;
    let completionDate = isCompleting ? new Date().toISOString() : null;

    if (isCompleting) {
      newStreak = calculateNewStreak(
        targetTask.lastCompletedDate ?? null,
        targetTask.streakCount
      );
    } else {
      const lastDate = targetTask.lastCompletedDate
        ? parseISO(targetTask.lastCompletedDate)
        : null;
      if (lastDate && isToday(lastDate) && newStreak > 0) newStreak -= 1;
    }

    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.$id === taskId
            ? ({
                ...t,
                status: targetStatus,
                lastCompletedDate: completionDate,
                streakCount: newStreak,
              } as Task)
            : t
        )
      );
      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        status: targetStatus,
        lastCompletedDate: completionDate,
        streakCount: newStreak,
      });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleMoveToTomorrow = async (taskId: string) => {
    const tomorrow = addDays(startOfDay(new Date()), 1).toISOString();
    setTasks((prev) => prev.filter((t) => t.$id !== taskId));
    try {
      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        startDate: tomorrow,
        status: "active",
        lastCompletedDate: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    const dayIndex = selectedDate.getDay().toString();
    const results = tasks.filter((task) => {
      if (task.status === "inactive") return false;
      return task.type === "one-time"
        ? isSameDay(new Date(task.startDate), selectedDate)
        : task.daysOfWeek?.includes(dayIndex);
    });

    const processed = results.map((t) => ({
      ...t,
      status:
        t.lastCompletedDate &&
        isSameDay(new Date(t.lastCompletedDate), selectedDate)
          ? "completed"
          : "active",
    }));

    const active = processed.filter((t) => t.status === "active");
    const completed = processed.filter((t) => t.status === "completed");

    if (activeButton === "all") {
      return completed.length && active.length
        ? [...active, { type: "separator", id: "completed-sep" }, ...completed]
        : [...active, ...completed];
    }
    return activeButton === "active" ? active : completed;
  }, [tasks, selectedDate, activeButton]);

  return {
    tasks,
    selectedDate,
    setSelectedDate,
    activeButton,
    setActiveButton,
    searchToggle,
    setSearchToggle,
    searchQuery,
    setSearchQuery,
    createVisible,
    setCreateVisible,
    today,
    filteredTasks,
    handleDelete,
    handleToggleTask,
    handleMoveToTomorrow,
    fetchTasks,
    jumpToToday,
    flatListRef,
    todayPulseAnim,
  };
};
