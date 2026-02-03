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
  if (typeof time === "string" && time.includes(":")) return time;

  const totalSeconds = Number(time);
  if (isNaN(totalSeconds)) return time;

  // If the number is small (e.g., < 120), you might be treating it as minutes.
  // But if you are storing raw seconds in Appwrite, use this:
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const TaskCard = ({
  task,
  onToggleComplete,
  onMoveToTomorrow,
  onRemove,
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
    if (typeof rawValue === "string" && rawValue.includes(":")) {
      const [m, s] = rawValue.split(":").map(Number);
      return m * 60 + (s || 0);
    }
    // If your logic treats timers[0] as minutes (e.g. 25), keep the * 60
    return Number(rawValue) * 60;
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
    const nextStatus = isCompleted ? "active" : "completed";

    if (nextStatus === "completed") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.selectionAsync(); // Subtle "undo" haptic
    }

    // We send the ID and the status we WANT it to be
    onToggleComplete(task.$id, nextStatus);
    setLeftVisible(false); // Ensure menu closes
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
                // 🟢 DYNAMIC ITEM: Logic to Reactivate or Complete
                {
                  label: isCompleted ? "Reactivate Task" : "Mark Complete",
                  onPress: handleToggle,
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
                  label: "Remove Task",
                  onPress: () => onRemove(task.$id),
                  danger: true,
                },
              ]}
              anchor={
                <TouchableOpacity
                  style={styles.leftZone}
                  onPress={handleToggle} // Quick tap toggle
                  onLongPress={onLongPressLeft} // Long press for Undo/Delete
                  delayLongPress={300}
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
                              {/* Use the formatter here */}
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
