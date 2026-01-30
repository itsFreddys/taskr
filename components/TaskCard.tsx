import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Checkbox,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

interface TaskCardProps {
  task: any; // Ideally use your TaskRecipe type
  onPress?: () => void;
  onToggleComplete?: (id: string, currentStatus: boolean) => void;
}

export const TaskCard = ({
  task,
  onPress,
  onToggleComplete,
}: TaskCardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Helper to format 24h startTime to 12h for display
  const displayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, mins] = timeStr.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mins} ${ampm}`;
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.contentWrapper}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Left Section: Completion Toggle */}
          <View style={styles.leftSection}>
            <Checkbox
              status={task.isCompleted ? "checked" : "unchecked"}
              onPress={() => onToggleComplete?.(task.$id, task.isCompleted)}
              color={theme.colors.primary}
            />
          </View>

          {/* Middle Section: Task Info */}
          <View style={styles.middleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.emoji}>{task.emotePic || "✅"}</Text>
              <Text
                style={[styles.title, task.isCompleted && styles.completedText]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>

            <View style={styles.metaRow}>
              {/* Time Block Indicator */}
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

              {/* Recurring Indicator */}
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

              {/* Timer Indicator */}
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

          {/* Right Section: Action/Chevron */}
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
