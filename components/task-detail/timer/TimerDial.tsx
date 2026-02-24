import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TimerDialProps {
  displayTime: string;
  secondsRemaining: number;
  isPlaying: boolean;
  isFullScreen: boolean;
  onToggle: () => void;
  onCompleteTask?: () => void;
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
  onCompleteTask,
  onEditRequest,
  onResetRequest,
  size = 260,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentTime, setCurrentTime] = useState(new Date());

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const COMPLETION_THRESHOLD = 140;

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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 🔵 SUGGESTION: Only allow the drag in Focus Mode to prevent accidental portrait triggers
      if (isFullScreen) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (isFullScreen && event.translationY < -COMPLETION_THRESHOLD) {
        if (onCompleteTask) runOnJS(onCompleteTask)();
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedJoystickStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // 🔵 SUGGESTION: Visual feedback for the "Barrier"
  const barrierStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-COMPLETION_THRESHOLD + 20, -30],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View
      style={[
        styles.container,
        { width: containerWidth, height: size, overflow: "visible" },
      ]}
    >
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

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[animatedJoystickStyle, isFullScreen && { marginTop: 20 }]}
          >
            <Button
              mode="contained"
              style={[
                styles.dialPlayButton,
                isFullScreen && {
                  transform: [{ scale: 1.2 }],
                  paddingHorizontal: 20,
                },
              ]}
              icon={isPlaying ? "pause" : "play"}
              onPress={onToggle}
            >
              {isPlaying ? "Pause" : "Start"}
            </Button>
          </Animated.View>
        </GestureDetector>
      </View>
      {isFullScreen && (
        <Animated.View style={[styles.completionBarrier, barrierStyle]}>
          <View style={styles.barrierLine} />
          <Text variant="labelSmall" style={styles.barrierText}>
            RELEASE TO COMPLETE
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      overflow: "visible",
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
    completionBarrier: {
      position: "absolute",
      bottom: 160,
      width: SCREEN_WIDTH * 0.7,
      alignItems: "center",
      zIndex: 1000,
    },
    barrierLine: {
      width: "100%",
      height: 2,
      backgroundColor: "lime",
      borderStyle: "dashed",
      borderRadius: 1,
      opacity: 0.8,
    },
    barrierText: {
      color: "lime",
      marginTop: 8,
      fontWeight: "900",
      letterSpacing: 2,
    },
  });
