import { CreateTask } from "@/components/CreateTask";
import { TaskActiveButtons } from "@/components/TaskActiveButtons";
import { TaskCard } from "@/components/TaskCard";
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { addDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Models, Query } from "react-native-appwrite";
import {
  FAB,
  IconButton,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

const { width } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window"); // ✅ Get screen height
const ITEM_WIDTH = width / 6; // 6 items visible at a time
const VAR_HEADER = 118;

// ... (imports remain the same)
// ✅ Define the Navigator
const Tab = createMaterialTopTabNavigator();

// ✅ Create mini-components for the content
function TasksTab({
  onScroll,
  headerHeight,
  tasks,
  activeButton,
  setActiveButton,
  onToggleTask,
  onMoveToTomorrow,
  onRemoveTask,
}: any) {
  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);
  const TOTAL_SPACER_HEIGHT = headerHeight + 48;

  return (
    <Animated.FlatList
      data={tasks} // 🟢 Use the tasks passed from parent
      onScroll={onScroll}
      keyExtractor={(item) => item.$id || item.id}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 100, minHeight: SCREEN_HEIGHT }}
      ListHeaderComponent={
        <View>
          <View style={{ height: TOTAL_SPACER_HEIGHT }} />

          {/* 🟢 Improved Layout Container */}
          <View style={styles.filterContainer}>
            <TaskActiveButtons
              selected={activeButton}
              onSelect={setActiveButton}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <View
          style={[
            styles.emptyCard,
            { height: SCREEN_HEIGHT - TOTAL_SPACER_HEIGHT - 200 },
          ]}
        >
          <MaterialCommunityIcons
            name={
              activeButton === "completed"
                ? "check-all"
                : "clipboard-text-outline"
            }
            size={48}
            color={theme.colors.outlineVariant}
          />
          <Text style={{ color: "#aaa", marginTop: 12 }}>
            {activeButton === "completed"
              ? "No completed tasks yet. Keep going!"
              : "No active tasks for today."}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        // 🟢 If it's the separator, render the title
        if (item.type === "separator") {
          return (
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Completed</Text>
              <View style={styles.separatorLine} />
            </View>
          );
        }

        return (
          <TaskCard
            task={item}
            onToggleComplete={onToggleTask}
            onMoveToTomorrow={onMoveToTomorrow} // 🟢 New
            onDelete={onRemoveTask} // 🟢 New
            // 🟢 Add opacity logic inside TaskCard or here
            style={{ opacity: item.status === "completed" ? 0.5 : 1 }}
            onPress={() => console.log("Edit Task", item.$id)}
          />
        );
      }}
    />
  );
}

function ScheduleTab({ onScroll, headerHeight }: any) {
  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);

  // ✅ The Spacer needs to be the Header (118) + Tab Bar (48)
  const TOTAL_SPACER_HEIGHT = headerHeight + 48;
  const EMPTY_STATE_HEIGHT = SCREEN_HEIGHT - TOTAL_SPACER_HEIGHT - 100;

  return (
    <Animated.FlatList
      data={[]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingBottom: 5,
        minHeight: SCREEN_HEIGHT,
      }}
      // 🟢 This invisible block pushes the list down past the header AND tabs
      ListHeaderComponent={<View style={{ height: TOTAL_SPACER_HEIGHT }} />}
      ListEmptyComponent={
        <View style={[styles.emptyCard, { height: EMPTY_STATE_HEIGHT }]}>
          <Text style={{ color: "#aaa" }}>No Schedule tracked.</Text>
        </View>
      }
      renderItem={null}
    />
  );
}

export default function Streakscreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const flatListRef = useRef<FlatList>(null);
  const today = startOfDay(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchToggle, setSearchToggle] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(VAR_HEADER);
  const [error, setError] = useState<string | null>(null);

  // visibility for create modal
  const [createVisible, setCreateVisible] = useState(false);

  //Animated value for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);

  // database
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeButton, setActiveButton] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      jumpToToday();
    }, 100);
    fetchTasks();
    return () => clearTimeout(timer);
  }, [user]);

  // Inside Streakscreen.tsx

  const handleMoveToTomorrow = async (taskId: string) => {
    // Use startOfDay to ensure we aren't accidentally moving it to "Tomorrow at 8PM"
    const tomorrow = addDays(startOfDay(new Date()), 1).toISOString();

    try {
      setTasks((prev) => prev.filter((t) => t.$id !== taskId));

      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        startDate: tomorrow,
        status: "active",
        lastCompletedDate: null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Move failed", error);
      fetchTasks();
    }
  };

  // 🟢 Renamed and updated to set status to "inactive"
  const handleRemoveTask = async (taskId: string) => {
    try {
      // Optimistic Update: Remove from the current view
      setTasks((prev) => prev.filter((t) => t.$id !== taskId));

      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        status: "inactive", // 🟢 No longer deleting, just marking as inactive
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error("Removal failed", error);
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    const dayIndex = selectedDate.getDay().toString();

    let results = tasks.filter((task) => {
      if (task.status === "inactive") return false;

      if (task.type === "one-time") {
        return isSameDay(new Date(task.startDate), selectedDate);
      }
      if (task.type === "recurring") {
        return task.daysOfWeek ? task.daysOfWeek.includes(dayIndex) : false;
      }
      return false;
    });

    // 🟢 TRANSFORM the task status based on the selectedDate
    const processedResults = results.map((task) => {
      // Check if it was completed on the currently viewed date
      const wasCompletedOnThisDay = task.lastCompletedDate
        ? isSameDay(new Date(task.lastCompletedDate), selectedDate)
        : false;

      return {
        ...task,
        // Override status locally for the calendar view
        status: (wasCompletedOnThisDay ? "completed" : "active") as
          | "active"
          | "completed",
      };
    });

    // Now apply your All/Active/Completed filters to the PROCESSED list
    const activeTasks = processedResults.filter((t) => t.status === "active");
    const completedTasks = processedResults.filter(
      (t) => t.status === "completed"
    );

    if (activeButton === "all") {
      if (completedTasks.length > 0 && activeTasks.length > 0) {
        return [
          ...activeTasks,
          { type: "separator", id: "completed-sep" },
          ...completedTasks,
        ];
      }
      return [...activeTasks, ...completedTasks];
    }

    return activeButton === "active" ? activeTasks : completedTasks;
  }, [tasks, selectedDate, activeButton]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const response = await databases.listDocuments<Models.Document & Task>(
        DATABASE_ID,
        TASKS_TABLE_ID,
        [Query.equal("creatorId", user.$id)]
      );
      setTasks(response.documents);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const isNowCompleted = currentStatus === "active";
    const newStatus = isNowCompleted ? "completed" : "active";

    // 🟢 Use ISO string for the Datetime field in Appwrite
    const completionDate = isNowCompleted ? selectedDate.toISOString() : null;

    try {
      // 🟢 Optimistic Update with Type Casting
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.$id === taskId
            ? ({
                ...t,
                status: newStatus,
                lastCompletedDate: completionDate,
              } as Task)
            : t
        )
      );

      await databases.updateDocument(DATABASE_ID, TASKS_TABLE_ID, taskId, {
        status: newStatus,
        lastCompletedDate: completionDate,
      });
    } catch (error) {
      console.error("Toggle failed:", error);
      fetchTasks(); // Rollback on error
    }
  };

  // Function to pass scroll events from children to the parent
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  // Header Animation Calculations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  // Generate Dates with Month Dividers
  const calendarData = useMemo(() => {
    const data = [];
    for (let i = -14; i <= 30; i++) {
      const d = addDays(today, i);
      if (i === -14 || d.getDate() === 1) {
        data.push({
          type: "month",
          label: format(d, "MMMM"),
          id: `month-${i}`,
          date: undefined, // Explicitly undefined for month types
        });
      }
      data.push({ type: "date", date: d, id: d.toISOString() });
    }
    return data;
  }, []);

  // 2. Find "Today" index - Added type check to satisfy TypeScript
  const todayIndex = calendarData.findIndex(
    (item) => item.type === "date" && item.date && isSameDay(item.date, today)
  );

  const jumpToToday = () => {
    setSelectedDate(today);
    flatListRef.current?.scrollToIndex({
      index: todayIndex,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const renderItem = ({ item }: any) => {
    if (item.type === "month") {
      return (
        <View style={styles.monthDivider}>
          <View style={styles.verticalLine} />
          <Text style={styles.monthLabel}>{item.label}</Text>
        </View>
      );
    }

    // Inside renderItem, these are local variables
    const isSelected = isSameDay(item.date, selectedDate);
    const isItemToday = isSameDay(item.date, today);
    const isPast = isBefore(item.date, today);

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        activeOpacity={0.8}
      >
        <Surface
          style={[
            styles.dateCard,
            isSelected && styles.selectedCard,
            isPast && !isSelected && { opacity: 0.4 },
          ]}
          elevation={isSelected ? 4 : 0}
        >
          <Text style={[styles.dayText, isSelected && styles.whiteText]}>
            {format(item.date, "EEE")}
          </Text>
          <Text style={[styles.dateText, isSelected && styles.whiteText]}>
            {format(item.date, "d")}
          </Text>

          {/* Today's Permanent Marker */}
          {isItemToday && !isSelected && <View style={styles.todayIndicator} />}
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderTasksList = () => {
    // need to retrieve the tasks from api for the current date

    if (tasks && tasks.length > 0) {
      return (
        <View>
          <Text>Some tasks</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyCard}>
        <Text style={{ color: "#aaa" }}>No habits tracked for this date.</Text>
      </View>
    );
  };

  const renderSchedule = () => {
    return (
      <View style={styles.taskList}>
        <Text style={styles.listTitle}>
          {/* ✅ FIXED: Use isSameDay(selectedDate, today) instead of the missing variable */}
          {isSameDay(selectedDate, today)
            ? "Today Schedule"
            : format(selectedDate, "eeee, MMM do") + " Schedule"}
        </Text>
        <View style={styles.emptyCard}>
          <Text style={{ color: "#aaa" }}>
            No tasks in Schedule for this date.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.fixedHeader,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={styles.calendarHeader}>
          <View>
            <Text style={styles.currentMonthDisplay}>
              {isSameDay(selectedDate, today)
                ? "Today"
                : format(selectedDate, "eeee, MMM do")}
            </Text>
          </View>
          <View style={styles.calendarHeaderButtons}>
            <IconButton
              icon="calendar-today"
              onPress={jumpToToday}
              containerColor={theme.colors.surfaceVariant}
            />
            <IconButton
              icon={searchToggle ? "magnify-minus" : "magnify"}
              onPress={() => {
                setHeaderHeight(searchToggle ? VAR_HEADER : VAR_HEADER + 60);
                setSearchToggle((prev) => !prev);
              }}
              containerColor={theme.colors.surfaceVariant}
            />
          </View>
        </View>

        <View style={styles.calendarStrip}>
          <FlatList
            ref={flatListRef}
            data={calendarData}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialScrollIndex={todayIndex}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH + 8, // Added margin (4+4) to calculation
              offset: (ITEM_WIDTH + 8) * index,
              index,
            })}
          />
        </View>

        {searchToggle && (
          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            <Searchbar
              placeholder="Search everything..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.globalSearch}
              inputStyle={styles.globalInput}
              mode="bar" // 🟢 Gives it a modern, rounded look
              autoFocus={true}
            />
          </View>
        )}
      </Animated.View>

      {/* 🟢 The Top Tab Navigator */}
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            sceneStyle: { backgroundColor: theme.colors.background },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            tabBarIndicatorStyle: {
              backgroundColor: theme.colors.primary,
              height: 3, // 🟢 Professional thick indicator
              borderRadius: 3,
            },
            tabBarStyle: {
              backgroundColor: theme.colors.background,
              borderBottomWidth: 1, // 🟢 Adds a subtle separation
              borderBottomColor: theme.colors.surfaceVariant,
              elevation: 0, // 🟢 Remove shadow for a flat look
              shadowOpacity: 0,
              position: "absolute",
              top: headerHeight,
              left: 0,
              right: 0,
              zIndex: 11,
              // marginTop: headerHeight,
              transform: [{ translateY: headerTranslateY }],
            },
            tabBarContentContainerStyle: {
              height: 48, // Standard tab bar height
            },
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: "bold",
              textTransform: "capitalize",
            },
          }}
        >
          <Tab.Screen name="Tasks">
            {() => (
              <TasksTab
                onScroll={onScroll}
                headerHeight={headerHeight}
                tasks={filteredTasks} // 🟢 Pass the memoized list here
                activeButton={activeButton}
                setActiveButton={setActiveButton}
                onToggleTask={handleToggleTask}
                onMoveToTomorrow={handleMoveToTomorrow}
                onRemoveTask={handleRemoveTask}
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

// ... (styles remain the same)
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
      height: v_height, // Match HEADER_HEIGHT variable
    },
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 5,
    },
    calendarHeaderButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    currentMonthDisplay: {
      fontSize: 20,
      fontWeight: "bold",
      // color: theme.colors.primary,
    },
    calendarStrip: {
      // paddingVertical: 5,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
    },
    dateCard: {
      width: ITEM_WIDTH - 5,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      marginHorizontal: 4,
      backgroundColor: theme.colors.surface,
    },
    selectedCard: { backgroundColor: theme.colors.primary },
    whiteText: { color: theme.colors.onSurface },
    dayText: {
      fontSize: 11,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    dateText: { fontSize: 18, fontWeight: "bold" },
    todayIndicator: {
      position: "absolute",
      bottom: 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    monthDivider: {
      width: ITEM_WIDTH,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    verticalLine: {
      position: "absolute",
      left: 0,
      height: "60%",
      width: 1,
      backgroundColor: theme.colors.primary,
    },
    monthLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: theme.colors.primary,
      transform: [{ rotate: "-90deg" }], // Vertical Month Text
    },
    // taskList: { flex: 1, padding: 20 },
    listTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    emptyCard: {
      flex: 1,
      margin: 16,
      backgroundColor: theme.colors.surface,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "stretch",
    },
    filterContainer: {
      paddingHorizontal: 20, // 🟢 Aligned with your calendar header
      paddingTop: 16,
      paddingBottom: 8,
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 20,
      marginVertical: 16,
      opacity: 0.5,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
    },
    separatorText: {
      marginHorizontal: 12,
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: theme.colors.onSurfaceVariant,
    },
    navHeaderOptions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary, // 🟢 Professional brand color
      borderRadius: 28,
    },
    searchBar: {
      marginBottom: 15,
      backgroundColor: theme.colors.surfaceVariant, // 🟢 Subtle grey background
      borderRadius: 12,
    },
    globalSearch: {
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
      height: 45,
      borderRadius: 10,
    },
    globalInput: {
      // 🟢 This targets the actual text field inside
      fontSize: 14,
      minHeight: 0, // 🟢 Prevents default heights from pushing text down
      alignSelf: "center",
      paddingVertical: 0, // 🟢 Removes internal padding that causes offsets
    },
    taskList: {
      flex: 1,
      padding: 15, // 🟢 Slightly tighter padding for search screens
    },
  });
