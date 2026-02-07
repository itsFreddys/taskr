import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Animated, FlatList } from "react-native";
import { isSameDay, isToday, parseISO, addDays, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";
import { Models, Query } from "react-native-appwrite";
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { calculateNewStreak } from "@/lib/utils/streakUtils";
import { Task } from "@/types/database.type";

export const useStreaksLogic = (user: any) => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]); // "Daily" or Active set
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Global history
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeButton, setActiveButton] = useState<string>("all");
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createVisible, setCreateVisible] = useState(false);

  // --- Refs & Constants ---
  const today = startOfDay(new Date());
  const flatListRef = useRef<FlatList>(null);
  const todayPulseAnim = useRef(new Animated.Value(1)).current;

  // --- Database Operations ---

  // Fetches both the active tasks and the general history
  const fetchTasks = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const res = await databases.listDocuments<Models.Document & Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        [
          Query.equal("creatorId", user.$id),
          Query.orderDesc("$updatedAt"), // Get them ordered from the start
        ]
      );

      // Set both at once from a single request
      setTasks(res.documents);
      setAllTasks(res.documents);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle resurrection of old tasks
  const handleBringToToday = async (taskId: string) => {
    try {
      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        startDate: new Date().toISOString(), // Bringing it to today
        status: "active",
        $updatedAt: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await fetchTasks(); // Refresh both sets
    } catch (err) {
      console.error("Resurrection error:", err);
    }
  };

  const handleToggleTask = async (taskId: string, targetStatus: string) => {
    const isCompleting = targetStatus === "completed";
    const targetTask = tasks.find((t) => t.$id === taskId);
    if (!targetTask) return;

    let newStreak = targetTask.streakCount || 0;
    const completionDate = isCompleting ? new Date().toISOString() : null;

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
      // Optimistic Update
      setTasks((prev) =>
        prev.map((t) =>
          t.$id === taskId
            ? ({ ...t, status: targetStatus, streakCount: newStreak } as Task)
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
    try {
      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        startDate: tomorrow,
        status: "active",
        lastCompletedDate: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, TASKS_TABLE_ID, taskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Animations & UI Helpers ---

  const triggerPulse = useCallback(() => {
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
  }, [todayPulseAnim]);

  const jumpToToday = useCallback(() => {
    setSelectedDate(today);
    flatListRef.current?.scrollToIndex({
      index: 15,
      viewPosition: 0,
      animated: true,
    });
    setTimeout(triggerPulse, 300);
  }, [today, triggerPulse]);

  // --- Computed Data ---

  const dailyTasks = useMemo(() => {
    const dayIndex = selectedDate.getDay().toString();

    const processed = tasks
      .filter((t) => t.status !== "inactive")
      .filter((t) =>
        t.type === "one-time"
          ? isSameDay(new Date(t.startDate), selectedDate)
          : t.daysOfWeek?.includes(dayIndex)
      )
      .map((t) => ({
        ...t,
        status:
          t.lastCompletedDate &&
          isSameDay(new Date(t.lastCompletedDate), selectedDate)
            ? "completed"
            : "active",
      }));

    const active = processed.filter((t) => t.status === "active");
    const completed = processed.filter((t) => t.status === "completed");

    if (activeButton === "active") return active;
    if (activeButton === "completed") return completed;

    return completed.length && active.length
      ? [...active, { type: "separator", id: "completed-sep" }, ...completed]
      : [...active, ...completed];
  }, [tasks, selectedDate, activeButton]);

  return {
    tasks,
    allTasks,
    dailyTasks,
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
    flatListRef,
    todayPulseAnim,
    fetchTasks,
    handleDelete,
    handleToggleTask,
    handleMoveToTomorrow,
    jumpToToday,
    handleBringToToday,
  };
};
