import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Checkbox, Surface, Text, useTheme } from "react-native-paper";
import CustomMenu from "./CustomMenu";

import { isToday, isYesterday, parseISO, startOfDay } from "date-fns";

const calculateNewStreak = (
  lastCompletedDate: string | null,
  currentStreak: number = 0
): number => {
  if (!lastCompletedDate) return 1; // First time ever

  const lastDate = startOfDay(parseISO(lastCompletedDate));

  if (isToday(lastDate)) {
    return currentStreak; // Already completed today, don't increment
  }

  if (isYesterday(lastDate)) {
    return currentStreak + 1; // Completed yesterday, continue streak
  }

  return 1; // More than a day gap, reset to 1
};

// 🟢 Helper to format seconds into MM:SS
const formatTimeDisplay = (time: any) => {
  if (!time) return "0:00";

  // If it's already a formatted string from Appwrite, return it
  if (typeof time === "string" && time.includes(":")) return time;

  const totalSeconds = Math.floor(Number(time));
  if (isNaN(totalSeconds)) return "0:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Format: H:MM:SS if hours exist, otherwise M:SS
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
};

export const TaskCard = ({
  task,
  onToggleComplete,
  onMoveToTomorrow,
  onDelete,
  onPress,
  style,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isCompleted = task.status === "completed";

  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Timer logic
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const rawValue = task.timers?.[0] || 0;

    // If it's a string like "1:30:10", parse it to seconds
    if (typeof rawValue === "string" && rawValue.includes(":")) {
      const parts = rawValue.split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return parts[0] * 60 + parts[1];
    }

    // 🟢 FIXED: rawValue is already seconds from Appwrite. No more "* 60"
    return Number(rawValue);
  });

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleToggle = () => {
    // If the task is already completed, do nothing on a simple tap.
    if (isCompleted) return;

    // Otherwise, proceed to complete it
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggleComplete(task.$id, "completed");
    setLeftVisible(false);
  };

  const handleReactivate = () => {
    Haptics.selectionAsync();
    onToggleComplete(task.$id, "active");
    setLeftVisible(false);
  };

  const handleDelete = async (id: string) => {
    try {
      // 1. Delete from Appwrite
      await databases.deleteDocument(DATABASE_ID, TASKS_TABLE_ID, id);
      // 2. Refresh your local state or re-fetch tasks
      fetchTasks();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleTimerPress = () => {
    if (timeLeft > 0) {
      setIsTimerRunning(!isTimerRunning);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setRightVisible(true);
    }
  };

  const startTimer = (mins: number) => {
    setTimeLeft(mins * 60);
    setIsTimerRunning(true);
    setRightVisible(false);
  };

  const onLongPressLeft = (event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPos({ top: pageY, left: pageX });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLeftVisible(true);
  };

  const onLongPressRight = (event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPos({ top: pageY, left: pageX - 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRightVisible(true);
  };

  return (
    <Surface
      style={[styles.card, isCompleted && styles.completedCard, style]}
      elevation={isCompleted ? 0 : 1}
    >
      <View style={styles.innerContainer}>
        <View style={styles.cardLayout}>
          {/* LEFT ZONE */}
          <View style={styles.leftContainer}>
            <CustomMenu
              visible={leftVisible}
              onDismiss={() => setLeftVisible(false)}
              position={menuPos}
              items={[
                {
                  label: isCompleted ? "Reactivate Task" : "Mark Complete",
                  onPress: isCompleted ? handleReactivate : handleToggle,
                },
                // Postpone is hidden if completed to keep menu clean
                ...(!isCompleted
                  ? [
                      {
                        label: "Postpone Tomorrow",
                        onPress: () => onMoveToTomorrow(task.$id),
                      },
                    ]
                  : []),
                {
                  label: "Delete Task",
                  onPress: () => {
                    if (onDelete) {
                      onDelete(task.$id); // 🟢 Call onDelete, NOT onRemove
                      setLeftVisible(false);
                    } else {
                      console.warn("onDelete prop is missing for:", task.title);
                    }
                  },
                  danger: true,
                },
              ]}
              anchor={
                <TouchableOpacity
                  style={styles.leftZone}
                  onPress={isCompleted ? undefined : handleToggle}
                  onLongPress={onLongPressLeft} // Long press for Undo/Delete
                  delayLongPress={300}
                  activeOpacity={isCompleted ? 1 : 0.7}
                >
                  {isCompleted && (
                    <View style={styles.actionZone}>
                      <Checkbox status="checked" color={theme.colors.primary} />
                    </View>
                  )}

                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{task.emotePic || "✅"}</Text>
                  </View>

                  <View style={styles.infoZone}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.title,
                          isCompleted && styles.completedText,
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {task.title}
                      </Text>
                    </View>

                    {/* Meta Row stays hidden for completed tasks for a "finished" look */}
                    {!isCompleted && (
                      <View style={styles.metaRow}>
                        {task.startTime && (
                          <View style={styles.metaItem}>
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={14}
                              color={theme.colors.outline}
                            />
                            <Text style={styles.metaText}>
                              {task.startTime}
                            </Text>
                          </View>
                        )}
                        {task.timers?.[0] && !isTimerRunning && (
                          <View style={styles.metaItem}>
                            <MaterialCommunityIcons
                              name="timer-outline"
                              size={14}
                              color={theme.colors.primary}
                            />
                            <Text
                              style={[
                                styles.metaText,
                                { color: theme.colors.primary },
                              ]}
                            >
                              {formatTimeDisplay(task.timers[0])}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              }
            />
          </View>

          {/* 🟢 RIGHT ZONE: Always wrapped in rightContainer */}
          <View
            style={[
              styles.rightContainer,
              !isCompleted && isTimerRunning && styles.expandedRight,
            ]}
          >
            {isCompleted ? (
              /* 🏆 Streak Display (Only when completed) */
              task.streakCount > 0 && (
                <View style={styles.streakZone}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={24}
                    color="#ff9800"
                  />
                  <Text style={styles.streakNumber}>{task.streakCount}</Text>
                </View>
              )
            ) : (
              /* ⏱️ Timer Display (Only when active) */
              <CustomMenu
                visible={rightVisible}
                onDismiss={() => setRightVisible(false)}
                position={menuPos}
                items={[
                  { label: "Focus (25m)", onPress: () => startTimer(25) },
                  { label: "Deep (50m)", onPress: () => startTimer(50) },
                  { label: "Edit Task", onPress: () => onPress?.() },
                ]}
                anchor={
                  <TouchableOpacity
                    style={styles.rightZone}
                    onPress={handleTimerPress}
                    onLongPress={onLongPressRight}
                    delayLongPress={300}
                  >
                    <MaterialCommunityIcons
                      name={
                        isTimerRunning ? "pause-circle" : "play-circle-outline"
                      }
                      size={28}
                      color={theme.colors.primary}
                    />
                    {(isTimerRunning || timeLeft > 0) && (
                      <Text style={styles.liveTimerText}>
                        {formatTimeDisplay(timeLeft)}
                      </Text>
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          </View>
        </View>
      </View>
    </Surface>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
    },
    innerContainer: { borderRadius: 16, overflow: "hidden", flex: 1 },
    completedCard: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.6,
    },
    cardLayout: { flexDirection: "row", height: 80 },
    leftContainer: { flex: 1 },
    rightContainer: {
      width: 60,
      justifyContent: "center",
      alignItems: "center",
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.surfaceVariant,
    },
    expandedRight: { width: 100 },
    leftZone: {
      height: 80,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
    },
    emojiContainer: {
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    rightZone: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    infoZone: { flex: 1, justifyContent: "center", paddingRight: 2 },
    titleRow: { flexDirection: "row", alignItems: "center" },
    emoji: { fontSize: 18 },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      flexShrink: 1,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: theme.colors.outline,
    },
    metaRow: { flexDirection: "row", marginTop: 4 },
    metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
    metaText: { fontSize: 12, marginLeft: 4, color: theme.colors.outline },
    streakZone: { alignItems: "center", justifyContent: "center" },
    streakNumber: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#ff9800",
      marginTop: -2,
    },
    liveTimerText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginTop: 2,
    },
    actionZone: { marginRight: 8 },
  });
