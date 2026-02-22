import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TimerDialProps {
  displayTime: string;
  secondsRemaining: number;
  isPlaying: boolean;
  isFullScreen: boolean;
  onToggle: () => void;
  progress: number;
  onEditRequest: () => void;
  onResetRequest: () => void;
  size: number;
}

export const TimerDial = ({
  displayTime,
  secondsRemaining,
  isPlaying,
  isFullScreen,
  onToggle,
  onEditRequest,
  onResetRequest,
  size = 260,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const finishTimeDate = new Date(
    currentTime.getTime() + secondsRemaining * 1000
  );
  const finishTimeStr = finishTimeDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Dial constants
  const strokeWidth = size * 0.05;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progress * circumference;

  // 🟢 DYNAMIC SIZING LOGIC
  // In FullScreen, we want the text to be able to take up almost the whole screen width
  const containerWidth = isFullScreen ? SCREEN_WIDTH * 0.8 : size;
  const timerFontSize = isFullScreen ? 160 : size * 0.28;

  return (
    <View style={[styles.container, { width: containerWidth, height: size }]}>
      {/* 🟢 The SVG Ring (Hidden in Full Screen to prevent clipping) */}
      {!isFullScreen && (
        <View style={styles.svgWrapper}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.colors.primaryContainer}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
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
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
        </View>
      )}

      {/* 🟢 The Centered Content */}
      <View style={[styles.dialInternalContent, { width: containerWidth }]}>
        <Text
          variant="labelLarge"
          style={[styles.timerSubtitle, { fontSize: isFullScreen ? 20 : 12 }]}
        >
          Finishes at {finishTimeStr}
        </Text>

        <Pressable
          onPress={onEditRequest}
          onLongPress={onResetRequest}
          delayLongPress={500}
          style={{ width: "100%" }} // Ensure pressable fills the container for centering
        >
          <Text
            numberOfLines={1} // 🟢 Prevent wrapping
            adjustsFontSizeToFit // 🟢 Shrink text if it hits the edges
            style={[
              styles.largeTimerDisplay,
              {
                fontSize: timerFontSize,
                textAlign: "center",
                paddingVertical: isFullScreen ? 10 : 0,
              },
            ]}
          >
            {displayTime}
          </Text>
        </Pressable>

        <Button
          mode="contained"
          style={[
            styles.dialPlayButton,
            isFullScreen && { transform: [{ scale: 1.2 }], marginTop: 20 },
          ]}
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
      justifyContent: "center",
      alignItems: "center",
    },
    svgWrapper: {
      position: "absolute",
    },
    dialInternalContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    timerSubtitle: {
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.primary,
      opacity: 0.7,
      marginBottom: 5,
    },
    largeTimerDisplay: {
      fontWeight: "400", // 🟢 Thin looks more "Pro" when very large
      color: theme.colors.onSurface,
      fontVariant: ["tabular-nums"], // 🟢 Stops numbers from "jumping"
      opacity: 0.9,
    },
    dialPlayButton: {
      marginTop: 10,
      borderRadius: 20,
      paddingHorizontal: 15,
      // opacity: 0.8,
    },
  });
