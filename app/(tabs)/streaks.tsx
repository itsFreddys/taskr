import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, View } from "react-native";
import { FAB, Searchbar, useTheme } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { addDays, isSameDay, isToday, parseISO, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";

// --- Abstracted Components ---
import { CreateTask } from "@/components/CreateTask";
import { DailyCalendar } from "@/components/DailyCalendar";
import { TasksTab } from "@/components/task-list/TasksTab";
import { ScheduleTab } from "@/components/task-list/ScheduleTab";

// --- Logic, Types & Services ---
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/types/database.type";
import { calculateNewStreak } from "@/lib/utils/streakUtils";
import { Models, Query } from "react-native-appwrite";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 6;
const VAR_HEADER = 118;
const Tab = createMaterialTopTabNavigator();

export default function Streakscreen() {
  const { user } = useAuth();
  const theme = useTheme();

  // --- Animation & Refs ---
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // --- UI State ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeButton, setActiveButton] = useState<string>("all");
  const [headerHeight, setHeaderHeight] = useState(VAR_HEADER);
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createVisible, setCreateVisible] = useState(false);

  const today = startOfDay(new Date());
  const styles = createStyles(theme, headerHeight);

  // --- Lifecycle ---
  useEffect(() => {
    fetchTasks();
  }, [user]);

  // --- Database Handlers ---
  const fetchTasks = async () => {
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
  };

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
    let completionDate: string | null = isCompleting
      ? new Date().toISOString()
      : null;

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

  // --- Task Filtering Logic ---
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

  // --- Animation Logic ---
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.fixedHeader,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <DailyCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          today={today}
          jumpToToday={() => {
            setSelectedDate(today);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
          onSearchToggle={() => {
            setHeaderHeight(searchToggle ? VAR_HEADER : VAR_HEADER + 60);
            setSearchToggle(!searchToggle);
          }}
          searchActive={searchToggle}
          flatListRef={flatListRef}
          itemWidth={ITEM_WIDTH}
        />

        {searchToggle && (
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search tasks..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.globalSearch}
              autoFocus
            />
          </View>
        )}
      </Animated.View>

      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            sceneStyle: styles.tabScene,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            tabBarIndicatorStyle: styles.tabIndicator,
            tabBarStyle: [
              styles.tabBar,
              { transform: [{ translateY: headerTranslateY }] }, // Keep animation inline
            ],
            tabBarContentContainerStyle: { height: 48 },
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          <Tab.Screen name="Tasks">
            {() => (
              <TasksTab
                onScroll={onScroll}
                headerHeight={headerHeight}
                tasks={filteredTasks}
                activeButton={activeButton}
                setActiveButton={setActiveButton}
                onToggleTask={handleToggleTask}
                onMoveToTomorrow={handleMoveToTomorrow}
                onDelete={handleDelete}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Schedule">
            {() => (
              <ScheduleTab onScroll={onScroll} headerHeight={headerHeight} />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateVisible(true)}
        color="white"
      />

      <CreateTask
        visible={createVisible}
        onClose={() => {
          setCreateVisible(false);
          fetchTasks();
        }}
        selectedDate={selectedDate}
      />
    </View>
  );
}

const createStyles = (theme: any, v_height: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    fixedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 12,
      backgroundColor: theme.colors.background,
      height: v_height,
    },
    searchContainer: { paddingHorizontal: 20, paddingTop: 10 },
    globalSearch: {
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
      height: 45,
      borderRadius: 10,
    },
    tabScene: { backgroundColor: theme.colors.background },
    tabIndicator: {
      backgroundColor: theme.colors.primary,
      height: 3,
      borderRadius: 3,
    },
    tabBar: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant,
      elevation: 0,
      shadowOpacity: 0,
      position: "absolute",
      top: v_height,
      left: 0,
      right: 0,
      zIndex: 11,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 16,
      backgroundColor: theme.colors.primary,
      borderRadius: 28,
    },
  });
