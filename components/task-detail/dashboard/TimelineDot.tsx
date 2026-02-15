import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TimelineDotProps {
  isDone: boolean;
  isToday: boolean;
}

export const TimelineDot = ({ isDone, isToday }: TimelineDotProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          isDone
            ? {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              }
            : { borderColor: theme.colors.outlineVariant },
          isToday && isDone && styles.todayGlow,
        ]}
      >
        {isDone && (
          <MaterialCommunityIcons
            name="check"
            size={18}
            color={theme.colors.background}
          />
        )}
      </View>
      {isToday && (
        <Text variant="labelSmall" style={styles.todayLabel}>
          Today
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  todayGlow: {
    elevation: 4,
    shadowColor: "#000", // Will be primary color in integration
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  todayLabel: { position: "absolute", bottom: -20, opacity: 0.6 },
});
