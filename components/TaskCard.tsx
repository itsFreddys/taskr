import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";
import CustomMenu from "./CustomMenu";

// --- Sub-Components ---
import { TaskInfoZone } from "./task-card/TaskInfoZone";
import { TaskActionZone } from "./task-card/TaskActionZone";

// --- Utils ---
const formatTimeDisplay = (time: any) => {
  if (!time) return "0:00";
  if (typeof time === "string" && time.includes(":")) return time;
  const totalSeconds = Math.floor(Number(time));
  if (isNaN(totalSeconds)) return "0:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
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

  // Menu States
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // ⏱️ Timer Logic
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const rawValue = task.timers?.[0] || 0;
    if (typeof rawValue === "string" && rawValue.includes(":")) {
      const parts = rawValue.split(":").map(Number);
      return parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts[0] * 60 + parts[1];
    }
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

  // --- Handlers ---
  const handleToggle = () => {
    if (isCompleted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggleComplete(task.$id, "completed");
    setLeftVisible(false);
  };

  const handleReactivate = () => {
    Haptics.selectionAsync();
    onToggleComplete(task.$id, "active");
    setLeftVisible(false);
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
          {/* 🟢 LEFT ZONE: Information & Main Actions */}
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
                    onDelete?.(task.$id);
                    setLeftVisible(false);
                  },
                  danger: true,
                },
              ]}
              anchor={
                <TouchableOpacity
                  style={styles.clickableZone}
                  onPress={isCompleted ? undefined : handleToggle}
                  onLongPress={onLongPressLeft}
                  delayLongPress={300}
                  activeOpacity={isCompleted ? 1 : 0.7}
                >
                  <TaskInfoZone
                    task={task}
                    isCompleted={isCompleted}
                    formatTimeDisplay={formatTimeDisplay}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {/* 🟢 RIGHT ZONE: Timer or Streaks */}
          <View
            style={[
              styles.rightContainer,
              !isCompleted && isTimerRunning && styles.expandedRight,
            ]}
          >
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
                <TaskActionZone
                  isCompleted={isCompleted}
                  task={task}
                  isTimerRunning={isTimerRunning}
                  timeLeft={timeLeft}
                  handleTimerPress={handleTimerPress}
                  onLongPressRight={onLongPressRight}
                  formatTimeDisplay={formatTimeDisplay}
                />
              }
            />
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
      // overflow: "hidden",
    },
    innerContainer: {
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
    completedCard: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.6,
    },
    cardLayout: { flexDirection: "row", height: 80 },
    leftContainer: { flex: 1, height: 80 },
    rightContainer: {
      width: 60,
      justifyContent: "center",
      alignItems: "center",
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.surfaceVariant,
    },
    expandedRight: { width: 100 },
    clickableZone: {
      width: "100%",
      height: 80,
      flexDirection: "row",
      alignItems: "center",
    },
  });
