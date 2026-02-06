import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, View } from "react-native";
import { FAB, Searchbar, useTheme } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { addDays, isSameDay, isToday, parseISO, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";

// --- Abstracted Components ---
import { CreateTask } from "@/components/task-form/CreateTask";
import { DailyCalendar } from "@/components/day-calendar/DailyCalendar";
import { TasksTab } from "@/components/task-list/TasksTab";
import { ScheduleTab } from "@/components/task-list/ScheduleTab";

// --- Logic, Types & Services ---
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/types/database.type";
import { calculateNewStreak } from "@/lib/utils/streakUtils";
import { Models, Query } from "react-native-appwrite";
import { useStreaksLogic } from "@/hooks/useStreaksLogic";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 6;
const VAR_HEADER = 118;
const Tab = createMaterialTopTabNavigator();

export default function Streakscreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const {
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
    flatListRef,
    jumpToToday,
    todayPulseAnim,
  } = useStreaksLogic(user);

  const [headerHeight, setHeaderHeight] = useState(VAR_HEADER);
  const scrollY = useRef(new Animated.Value(0)).current;
  const styles = createStyles(theme, headerHeight);

  // Animation logic stays here as it's UI-bound
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  // --- Lifecycle ---
  useEffect(() => {
    fetchTasks();
    const timer = setTimeout(() => {
      jumpToToday();
    }, 250);

    return () => clearTimeout(timer);
  }, [user]);

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
          jumpToToday={jumpToToday}
          flatListRef={flatListRef}
          onSearchToggle={() => {
            setHeaderHeight(searchToggle ? VAR_HEADER : VAR_HEADER + 60);
            setSearchToggle(!searchToggle);
          }}
          searchActive={searchToggle}
          itemWidth={ITEM_WIDTH}
          todayPulseAnim={todayPulseAnim}
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
