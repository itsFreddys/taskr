import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

interface TimerDialProps {
  displayTime: string;
  isPlaying: boolean;
  onToggle: () => void;
  progress: number; // For future ring animation
  onEditRequest: () => void;
  onResetRequest: () => void;
}

export const TimerDial = ({
  displayTime,
  isPlaying,
  onToggle,
  onEditRequest,
  onResetRequest,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Dial constants
  const size = 260;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progress * circumference;

  return (
    <View style={styles.container}>
      {/* 🟢 The SVG Ring */}
      <View style={[styles.svgWrapper, { transform: [{ scaleX: 1 }] }]}>
        <Svg width={size} height={size}>
          {/* Background Track (The light ring) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.primaryContainer}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Progress Ring (The colored part) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90" // Start from the top
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>

      {/* 🟢 The Centered Content */}
      <View style={styles.dialInternalContent}>
        <Text variant="labelLarge" style={styles.timerSubtitle}>
          Focusing
        </Text>

        <Pressable
          onPress={() => onEditRequest()}
          onLongPress={() => onResetRequest()}
          delayLongPress={500}
        >
          <Text style={styles.largeTimerDisplay}>{displayTime}</Text>
        </Pressable>
        <Button
          mode="contained"
          style={styles.dialPlayButton}
          icon={isPlaying ? "pause" : "play"}
          onPress={onToggle}
        >
          {isPlaying ? "Pause" : "Start"}
        </Button>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: 260,
      height: 260,
      justifyContent: "center",
      alignItems: "center",
    },
    svgWrapper: {
      position: "absolute",
      transform: [{ rotateZ: "0deg" }],
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
