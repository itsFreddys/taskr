import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const TaskActionZone = ({
  isCompleted,
  task,
  isTimerRunning,
  timeLeft,
  handleTimerPress,
  onLongPressRight,
  formatTimeDisplay,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (isCompleted) {
    return (
      <View style={styles.streakZone}>
        <MaterialCommunityIcons name="fire" size={24} color="#ff9800" />
        <Text style={styles.streakNumber}>{task.streakCount || 0}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.rightZone}
      onPress={handleTimerPress}
      onLongPress={onLongPressRight}
      delayLongPress={300}
    >
      <MaterialCommunityIcons
        name={isTimerRunning ? "pause-circle" : "play-circle-outline"}
        size={28}
        color={theme.colors.primary}
      />
      {(isTimerRunning || timeLeft > 0) && (
        <Text style={styles.liveTimerText}>{formatTimeDisplay(timeLeft)}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    streakZone: { alignItems: "center", justifyContent: "center", width: 60 },
    streakNumber: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#ff9800",
      marginTop: -2,
    },
    rightZone: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    liveTimerText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginTop: 2,
    },
  });
