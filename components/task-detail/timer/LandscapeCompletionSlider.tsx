import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Surface, Text, useTheme } from "react-native-paper";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const HANDLE_SIZE = 44;

interface LandscapeCompletionSliderProps {
  isDone: boolean;
  canCompleteToday: boolean;
  onCompleteTask: () => void;
}

export const LandscapeCompletionSlider = ({
  isDone,
  canCompleteToday,
  onCompleteTask,
}: LandscapeCompletionSliderProps) => {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const sliderX = useSharedValue(0);

  const maxTranslateX = Math.max(0, trackWidth - HANDLE_SIZE);
  const SWIPE_THRESHOLD = maxTranslateX * 0.85;

  const landscapeSliderGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!canCompleteToday || isDone) return;
      sliderX.value = Math.min(Math.max(0, event.translationX), maxTranslateX);
    })
    .onEnd(() => {
      if (!canCompleteToday || isDone) return;

      if (sliderX.value >= SWIPE_THRESHOLD) {
        sliderX.value = withSpring(maxTranslateX);
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Success
        );
        runOnJS(onCompleteTask)();
      } else {
        sliderX.value = withSpring(0);
      }
    });

  const animatedSliderHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
  }));

  return (
    <View style={styles.landscapeFooterWrapper}>
      {/* 🟢 1. COMPLETED STATE */}
      {isDone ? (
        <Surface
          style={[
            styles.landscapeSliderTrack,
            {
              backgroundColor: theme.colors.primaryContainer,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          elevation={1}
        >
          <View style={styles.completedContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color={theme.colors.primary}
            />
            <Text
              variant="labelMedium"
              style={[styles.completedText, { color: theme.colors.primary }]}
            >
              COMPLETED
            </Text>
          </View>
        </Surface>
      ) : (
        /* 🟢 2. ACTIVE SLIDER vs 🔒 3. LOCKED STATE */
        <Surface
          style={[
            styles.landscapeSliderTrack,
            !canCompleteToday && { opacity: 0.6 },
          ]}
          elevation={2}
        >
          <View
            style={styles.sliderInner}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.sliderBackgroundTextContainer}>
              <Text
                variant="labelSmall"
                style={[
                  styles.landscapeSliderText,
                  !canCompleteToday && { color: theme.colors.outline },
                ]}
              >
                {canCompleteToday ? "DRAG TO COMPLETE" : "LOCKED FOR TODAY"}
              </Text>
            </View>

            <GestureDetector gesture={landscapeSliderGesture}>
              <Animated.View
                style={[
                  styles.sliderHandle,
                  animatedSliderHandleStyle,
                  {
                    height: HANDLE_SIZE,
                    width: HANDLE_SIZE,
                    backgroundColor: canCompleteToday
                      ? theme.colors.primary
                      : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={canCompleteToday ? "chevron-right" : "lock"}
                  size={24}
                  color={
                    canCompleteToday
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant
                  }
                />
              </Animated.View>
            </GestureDetector>
          </View>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  landscapeFooterWrapper: {
    width: "100%",
    marginTop: "auto",
  },
  landscapeSliderTrack: {
    height: 52,
    borderRadius: 26,
    padding: 4,
    overflow: "hidden",
  },
  sliderInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  sliderBackgroundTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  landscapeSliderText: {
    fontWeight: "bold",
    letterSpacing: 1,
  },
  sliderHandle: {
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  completedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedText: {
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
