import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, useTheme, Portal, Modal } from "react-native-paper";
import * as Haptics from "expo-haptics";

// --- Logic & Hooks ---
import { useTaskTimer } from "@/hooks/useTaskTimer";
import CustomMenu from "@/components/CustomMenu";
import { CustomTimerPicker } from "@/components/CustomTimerPicker";

// --- Sub-Components ---
import { TaskInfoZone } from "@/components/task-card/TaskInfoZone";
import { TaskActionZone } from "@/components/task-card/TaskActionZone";

// 🟢 Utility (Consider moving to @/lib/utils/timeUtils.ts later)
const formatTimeDisplay = (time: any) => {
  if (!time) return "0:00";
  if (typeof time === "string" && time.includes(":")) return time;
  const totalSeconds = Math.floor(Number(time));
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

  // 🟢 Logic extracted to custom hook
  const {
    timeLeft,
    isTimerRunning,
    toggleTimer,
    startTimer,
    selectTimer,
    setTimeLeft,
    setIsTimerRunning,
  } = useTaskTimer(task);

  // Menu/UI State
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [pickerVisible, setPickerVisible] = useState(false);

  // --- Interaction Handlers ---
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
    // 🟢 toggleTimer returns false if timeLeft is 0
    if (!toggleTimer()) {
      setRightVisible(true);
    }
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
      {/* 🟢 innerContainer prevents shadow clipping while allowing overflow:hidden for children */}
      <View style={styles.innerContainer}>
        <View style={styles.cardLayout}>
          {/* LEFT ZONE: Info & Context Menu */}
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

          {/* RIGHT ZONE: Timer Actions or Streak Fire */}
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
                ...(task.timers && task.timers.length > 0
                  ? task.timers.map((time: any) => ({
                      label: `Start: ${formatTimeDisplay(time)}`,
                      onPress: () => {
                        selectTimer(time);
                        setRightVisible(false);
                      },
                    }))
                  : [
                      { label: "Focus (25m)", onPress: () => startTimer(25) },
                      { label: "Deep (50m)", onPress: () => startTimer(50) },
                    ]),
                {
                  label: "Custom Timer",
                  onPress: () => {
                    setRightVisible(false);
                    setPickerVisible(true);
                  },
                },
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
      <Portal>
        <Modal
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <CustomTimerPicker
            onAdd={(totalSeconds) => {
              // 🟢 Update the hook directly with seconds
              setTimeLeft(totalSeconds);
              setIsTimerRunning(true);
              setPickerVisible(false);
            }}
            onCancel={() => setPickerVisible(false)}
          />
        </Modal>
      </Portal>
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
    modalContent: {
      backgroundColor: "transparent", // Let the Surface inside handle color
      padding: 20,
      margin: 20,
    },
  });
