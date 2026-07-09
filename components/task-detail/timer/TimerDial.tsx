import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics"; // 🟢 Pro tactile
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
// import { BlurView } from 'expo-blur';
import { SoundscapeSelector } from "@/components/task-detail/timer/SoundScapeSelector";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isToday = (date: Date) => {
  const today = new Date();
  // console.log(`today: ${today}, taskDate: ${date}`);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

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
  taskDate: Date;
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
  taskDate,
  size = 260,
  progress = 0,
}: TimerDialProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentTime, setCurrentTime] = useState(new Date());
  const canComplete = isToday(taskDate);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const X_THRESHOLD = 150;
  const shakeX = useSharedValue(0);
  const isReady = useSharedValue(false);
  const snapOffset = useSharedValue(0);

  const [activeSoundId, setActiveSoundId] = useState<string>("mute");

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
  // const containerWidth = isFullScreen ? SCREEN_WIDTH * 0.8 : size;
  const containerWidth = isFullScreen ? SCREEN_WIDTH : size;
  const timerFontSize = isFullScreen ? 160 : size * 0.24;
  const hasTriggeredHaptic = useSharedValue(false); // 🟢 Throttle haptics

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isFullScreen) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;

      const pastThreshold = Math.abs(translateX.value) > X_THRESHOLD;

      if (pastThreshold && !hasTriggeredHaptic.value) {
        // 🟢 Only fire haptic ONCE per crossing, not every frame
        hasTriggeredHaptic.value = true;
        isReady.value = true;
        snapOffset.value = withSpring(5, { damping: 15 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else if (!pastThreshold) {
        // 🟢 Reset when pulled back inside threshold
        hasTriggeredHaptic.value = false;
        isReady.value = false;
        snapOffset.value = withSpring(0);
      }
    })
    .onEnd((event) => {
      if (!isFullScreen) return;

      // 🟢 Trigger actions
      if (isReady.value) {
        if (event.translationX > X_THRESHOLD) {
          if (canComplete) runOnJS(onCompleteTask!)();
          else console.log("tried to complete on incorrect day");
        } else if (event.translationX < -X_THRESHOLD) {
          runOnJS(onResetRequest)();
        }
      }

      // 🟢 Always spring back to neutral
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isReady.value = false;
      snapOffset.value = withSpring(0);
      hasTriggeredHaptic.value = false;
    });

  // 🟢 NEW: Shake Styles for the Icons
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const animatedTimerTextStyle = useAnimatedStyle(() => {
    // We want the blur/fade to start early (at 20px) and finish before the threshold (120px)
    const absX = Math.abs(translateX.value);

    const opacity = interpolate(
      absX,
      [0, 100],
      [1, 0.3], // Dim the numbers to 30%
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      absX,
      [0, 100],
      [1, 0.9], // Slightly shrink the numbers
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
      // Note: blurRadius is iOS only on standard <Text>.
      // For Android/Universal, the opacity/scale combo creates the "receding" feel.
    };
  });

  const animatedSoundsScapeStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translateX.value);

    const opacity = interpolate(
      absX,
      [0, 100],
      [1, 0.3], // Dim the soundscape to 30%
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

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
      [0, 200],
      // [0, 150],
      Extrapolation.CLAMP
    );
    const baseOpacity = interpolate(
      translateX.value,
      [20, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      width: baseWidth + snapOffset.value,
      // 🟢 If locked, cap opacity at 0.3 so it fades in grey rather than full color
      opacity: canComplete ? baseOpacity : baseOpacity * 0.3,
    };
  });

  const leftPanelStyle = useAnimatedStyle(() => {
    const baseWidth = interpolate(
      translateX.value,
      [0, -X_THRESHOLD],
      [0, 200],
      // [0, 150],
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
          style={{ width: "100%" }}
        >
          <Animated.Text // 🟢 Changed from Text to Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.largeTimerDisplay,
              animatedTimerTextStyle, // 🟢 Added the focus style here
              {
                fontSize: timerFontSize,
                textAlign: "center",
                paddingVertical: 0,
              },
            ]}
          >
            {displayTime}
          </Animated.Text>
        </Pressable>

        {isFullScreen && (
          <Animated.View
            style={[styles.soundscapeWrapper, animatedSoundsScapeStyle]}
          >
            <SoundscapeSelector
              activeSoundId={activeSoundId}
              onSelectSound={setActiveSoundId}
            />
          </Animated.View>
        )}

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
          style={[
            styles.sidePanel,
            styles.rightSidePanel,
            {
              backgroundColor: canComplete
                ? "rgba(0, 200, 80, 0.5)"
                : "rgba(150, 150, 150, 0.5)",
            },
            rightPanelStyle,
          ]}
        >
          <Animated.View
            style={[styles.contentWrapperRight, shakeStyle, iconSnapStyle]}
          >
            <MaterialCommunityIcons
              name={canComplete ? "check-bold" : "lock-outline"}
              size={32}
              color="white"
            />
            <Text style={styles.panelText}>
              {canComplete ? "COMPLETE" : "LOCKED"}
            </Text>
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
      // marginTop: 10,
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
      right: 0,
      // right: -50,
      backgroundColor: "rgba(0, 200, 80, 0.5)", // Semi-transparent green
      borderTopLeftRadius: 50,
      borderBottomLeftRadius: 50,
      // paddingLeft: 20,
    },
    leftSidePanel: {
      left: 0,
      // left: -50,
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
    soundscapeWrapper: {
      marginTop: -40,
      marginBottom: -10,
      paddingHorizontal: 20,
      width: "100%",
      alignItems: "center",
    },
  });
