import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";

interface TimerDialProps {
  displayTime: string;
  isPlaying: boolean;
  onToggle: () => void;
  progress?: number; // For future ring animation
}

export const TimerDial = ({
  displayTime,
  isPlaying,
  onToggle,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.timerDial}>
      <View style={styles.dialInternalContent}>
        <Text variant="labelLarge" style={styles.timerSubtitle}>
          Focusing
        </Text>
        <Text style={styles.largeTimerDisplay}>{displayTime}</Text>

        <Button
          mode="contained"
          style={styles.dialPlayButton}
          icon={isPlaying ? "pause" : "play"}
          onPress={onToggle}
          contentStyle={{ height: 48 }}
        >
          {isPlaying ? "Pause" : "Start"}
        </Button>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    timerDial: {
      width: 260,
      height: 260,
      borderRadius: 130,
      borderWidth: 12,
      borderColor: theme.colors.primaryContainer,
      borderTopColor: theme.colors.primary, // The "gauge" indicator
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    dialInternalContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    timerSubtitle: {
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 2,
      color: theme.colors.primary,
      opacity: 0.7,
      marginBottom: -5,
    },
    largeTimerDisplay: {
      fontSize: 64,
      fontWeight: "200",
      color: theme.colors.onSurface,
      fontVariant: ["tabular-nums"],
    },
    dialPlayButton: {
      marginTop: 10,
      borderRadius: 20,
      paddingHorizontal: 10,
    },
  });
