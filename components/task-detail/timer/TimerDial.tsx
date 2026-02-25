import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // 🟢 Pro visual
import * as Haptics from "expo-haptics"; // 🟢 Pro tactile
// import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  withRepeat,
  withSequence,
  withTiming,
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
  const X_THRESHOLD = 150;
  const shakeX = useSharedValue(0);
  const isReady = useSharedValue(false);
  const snapOffset = useSharedValue(0);

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
  const timerFontSize = isFullScreen ? 160 : size * 0.24;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isFullScreen) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // 🟢 SNAP LOGIC: If we cross the threshold, "click" into the groove
      if (Math.abs(event.translationX) > X_THRESHOLD) {
        if (!isReady.value) {
          isReady.value = true;
          snapOffset.value = withSpring(30); // 🟢 The "Snap" jump distance
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        }
      } else {
        isReady.value = false;
        snapOffset.value = withSpring(0); // 🔴 Slide back if they retreat
      }
    })
    .onEnd((event) => {
      // ... your completion logic ...
      isReady.value = false;
      snapOffset.value = 0;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  // 🟢 NEW: Shake Styles for the Icons
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const animatedJoystickStyle = useAnimatedStyle(() => {
    // 🟢 Rubber Banding on X axis
    const dampedX = translateX.value / (1 + Math.abs(translateX.value) * 0.002);
    const dampedY = translateY.value / (1 + Math.abs(translateY.value) * 0.005);
    return {
      transform: [
        { translateX: dampedX },
        { translateY: dampedY },
        { scale: isFullScreen ? withSpring(1.2) : 1 },
      ],
    };
  });

  const rightPanelStyle = useAnimatedStyle(() => {
    const baseWidth = interpolate(
      translateX.value,
      [0, X_THRESHOLD],
      [0, 150],
      Extrapolation.CLAMP
    );
    return {
      width: baseWidth + snapOffset.value, // 🟢 Base drag + the magnetic snap
      opacity: interpolate(
        translateX.value,
        [0, X_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const leftPanelStyle = useAnimatedStyle(() => {
    const baseWidth = interpolate(
      translateX.value,
      [0, -X_THRESHOLD],
      [0, 150],
      Extrapolation.CLAMP
    );
    return {
      width: baseWidth + snapOffset.value, // 🟢 Works for both sides!
      opacity: interpolate(
        translateX.value,
        [0, -X_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const iconSnapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isReady.value ? 1.2 : 1) }],
    opacity: withTiming(isReady.value ? 1 : 0.7),
  }));

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
          style={[styles.timerSubtitle, { fontSize: isFullScreen ? 20 : 14 }]}
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
                  transform: [{ scale: 1.1 }],
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

      {/* 🔴 RESET PANEL (Left) */}
      {isFullScreen && (
        <Animated.View
          style={[styles.sidePanel, styles.leftSidePanel, leftPanelStyle]}
        >
          <Animated.View
            style={[styles.contentWrapperLeft, shakeStyle, iconSnapStyle]}
          >
            <MaterialCommunityIcons name="refresh" size={32} color="white" />
            <Text style={styles.panelText}>RESET</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* 🟢 COMPLETE PANEL (Right) */}
      {isFullScreen && (
        <Animated.View
          style={[styles.sidePanel, styles.rightSidePanel, rightPanelStyle]}
        >
          <Animated.View
            style={[styles.contentWrapperRight, shakeStyle, iconSnapStyle]}
          >
            <MaterialCommunityIcons name="check-bold" size={32} color="white" />
            <Text style={styles.panelText}>COMPLETE</Text>
          </Animated.View>
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
      alignSelf: "center",
      overflow: "visible",
    },
    svgWrapper: {
      position: "absolute",
    },
    dialInternalContent: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    timerSubtitle: {
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.primary,
      opacity: 0.7,
      marginBottom: 0,
    },
    largeTimerDisplay: {
      fontWeight: "400", // 🟢 Thin looks more "Pro" when very large
      color: theme.colors.onSurface,
      fontVariant: ["tabular-nums"], // 🟢 Stops numbers from "jumping"
      opacity: 0.9,
    },
    dialPlayButton: {
      marginTop: 10,
      marginBottom: 20,
      borderRadius: 20,
      paddingHorizontal: 15,
      zIndex: 10,
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
    // barrierText: {
    //   color: "lime",
    //   marginTop: 8,
    //   fontWeight: "900",
    //   letterSpacing: 2,
    // },
    horizontalBarrier: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 100,
    },
    rightSide: { right: -60 }, // 🟢 Offset to the right
    leftSide: { left: -60 }, // 🔴 Offset to the left
    barrierText: {
      fontSize: 10,
      fontWeight: "900",
      marginTop: 4,
      letterSpacing: 1,
    },
    sidePanel: {
      position: "absolute",
      height: 100, // 🔵 Height of the "drawer"
      top: "50%",
      alignItems: "center",
      justifyContent: "center",
      zIndex: -1, // 🟢 Sits behind the button
      overflow: "hidden",
    },
    rightSidePanel: {
      right: -50, // 🟢 Starts just off-center to the right
      backgroundColor: "rgba(0, 200, 80, 0.5)", // Semi-transparent green
      borderTopLeftRadius: 50,
      borderBottomLeftRadius: 50,
      // paddingLeft: 20,
    },
    leftSidePanel: {
      left: -50, // 🟢 Starts just off-center to the left
      backgroundColor: "rgba(255, 100, 0, 0.5)", // Semi-transparent orange
      borderTopRightRadius: 50,
      borderBottomRightRadius: 50,
      // paddingRight: 20,
    },
    panelText: {
      color: "white",
      fontSize: 10,
      fontWeight: "900",
      marginTop: 4,
      textAlign: "center",
      width: 100,
    },
    contentWrapperRight: {
      width: 120,
      position: "absolute",
      left: 20,
      alignItems: "center",
    },
    contentWrapperLeft: {
      width: 120,
      position: "absolute",
      right: 20,
      alignItems: "center",
    },
  });
