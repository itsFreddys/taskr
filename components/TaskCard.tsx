import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import {
  Checkbox,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

interface TaskCardProps {
  task: any;
  onPress?: () => void;
  onToggleComplete?: (id: string, currentStatus: string) => void;
  style?: ViewStyle; // Added to handle custom styles passed from parent
}

export const TaskCard = ({
  task,
  onPress,
  onToggleComplete,
  style,
}: TaskCardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // 🟢 Define this variable so it can be used in the styles below
  const isCompleted = task.status === "completed";

  const displayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, mins] = timeStr.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mins} ${ampm}`;
  };

  return (
    <Surface
      style={[styles.card, isCompleted && { opacity: 0.5 }, style]}
      elevation={isCompleted ? 0 : 1}
    >
      <View style={styles.contentWrapper}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Left Section: Completion Toggle */}
          <View style={styles.leftSection}>
            <Checkbox
              // 🟢 Check against status string
              status={isCompleted ? "checked" : "unchecked"}
              onPress={() => onToggleComplete?.(task.$id, task.status)}
              color={theme.colors.primary}
            />
          </View>

          {/* Middle Section: Task Info */}
          <View style={styles.middleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.emoji}>{task.emotePic || "✅"}</Text>
              <Text
                style={[styles.title, isCompleted && styles.completedText]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>

            <View style={styles.metaRow}>
              {!task.isAllDay && task.startTime && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={theme.colors.outline}
                  />
                  <Text style={styles.metaText}>
                    {displayTime(task.startTime)}
                  </Text>
                </View>
              )}

              {task.type === "recurring" && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="refresh"
                    size={14}
                    color={theme.colors.outline}
                  />
                  <Text style={styles.metaText}>Weekly</Text>
                </View>
              )}

              {task.timers && task.timers.length > 0 && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.metaText, { color: theme.colors.primary }]}
                  >
                    {task.timers[0]}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <IconButton
            icon="chevron-right"
            size={20}
            iconColor={theme.colors.outline}
          />
        </TouchableOpacity>
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
    contentWrapper: {
      borderRadius: 16,
      overflow: "hidden",
    },
    touchable: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    leftSection: {
      justifyContent: "center",
      alignItems: "center",
    },
    middleSection: {
      flex: 1,
      marginLeft: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    emoji: {
      fontSize: 18,
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    completedText: {
      textDecorationLine: "line-through",
      opacity: 0.5,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },
    metaText: {
      fontSize: 12,
      marginLeft: 4,
      color: theme.colors.outline,
    },
  });
