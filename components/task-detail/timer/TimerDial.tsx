import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

interface TimerDialProps {
  displayTime: string;
  secondsRemaining: number;
  isPlaying: boolean;
  onToggle: () => void;
  progress: number; // For future ring animation
  onEditRequest: () => void;
  onResetRequest: () => void;
  size: number;
}

export const TimerDial = ({
  displayTime,
  secondsRemaining,
  isPlaying,
  onToggle,
  onEditRequest,
  onResetRequest,
  size = 260,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentTime, setCurrentTime] = useState(new Date());

  const baseSize = 260;
  const scaleFactor = size / baseSize;
  const dynamicFontSize = 65 * scaleFactor;
  const finalLargeDisplaySize = size > 260 ? 100 : 65;
  const subtitleSize = size > 260 ? 18 : 12;
  const subtitleMargin = size > 260 ? -10 : -5;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ghostTimeStr = currentTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const finishTimeDate = new Date(
    currentTime.getTime() + secondsRemaining * 1000
  );
  const finishTimeStr = finishTimeDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Dial constants
  // const size = 260;
  const strokeWidth = size * 0.05;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dynamicStyles = {
    container: { width: size, height: size },
    largeTimerDisplay: { fontSize: size * 0.25 }, // Scale text too!
  };
  const strokeDashoffset = progress * circumference;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
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
        <Text
          variant="labelLarge"
          style={[
            styles.timerSubtitle,
            { fontSize: subtitleSize, marginBottom: subtitleMargin },
          ]}
        >
          Finishes at {finishTimeStr}
        </Text>

        <Pressable
          onPress={() => onEditRequest()}
          onLongPress={() => onResetRequest()}
          delayLongPress={500}
        >
          <Text
            style={[
              styles.largeTimerDisplay,
              { fontSize: finalLargeDisplaySize },
            ]}
          >
            {displayTime}
          </Text>
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
      letterSpacing: 1,
      color: theme.colors.primary,
      opacity: 0.7,
      marginBottom: -5,
    },
    largeTimerDisplay: {
      fontSize: 64,
      fontWeight: "400",
      color: theme.colors.onSurface,
      opacity: 0.9,
      // fontVariant: ["tabular-nums"],
    },
    dialPlayButton: {
      marginTop: 10,
      borderRadius: 20,
      paddingHorizontal: 10,
    },
  });
