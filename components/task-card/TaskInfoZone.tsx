import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Checkbox, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const TaskInfoZone = ({ task, isCompleted, formatTimeDisplay }: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {isCompleted && (
        <View style={styles.actionZone}>
          <Checkbox status="checked" color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{task.emotePic || "✅"}</Text>
      </View>

      <View style={styles.infoZone}>
        <Text
          style={[styles.title, isCompleted && styles.completedText]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {task.title}
        </Text>

        {!isCompleted && (
          <View style={styles.metaRow}>
            {task.startTime && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.colors.outline}
                />
                <Text style={styles.metaText}>{task.startTime}</Text>
              </View>
            )}
            {task.timers?.[0] && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.metaText, { color: theme.colors.primary }]}
                >
                  {formatTimeDisplay(task.timers[0])}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
      flex: 1,
    },
    emojiContainer: {
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    emoji: { fontSize: 18 },
    infoZone: {
      flex: 1,
      justifyContent: "center",
      paddingRight: 2,
      height: "100%",
    },
    title: { fontSize: 16, fontWeight: "600", color: theme.colors.onSurface },
    completedText: {
      textDecorationLine: "line-through",
      color: theme.colors.outline,
    },
    metaRow: { flexDirection: "row", marginTop: 4 },
    metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
    metaText: { fontSize: 12, marginLeft: 4, color: theme.colors.outline },
    actionZone: { marginRight: 8 },
  });
