import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { LandscapeCompletionSlider } from "@/components/task-detail/timer/LandscapeCompletionSlider";
import { SoundscapeSelector } from "@/components/task-detail/timer/SoundScapeSelector";
import { TimeAdjusters } from "@/components/task-detail/timer/TimerAdjusters";
import { TimerDial } from "@/components/task-detail/timer/TimerDial";

interface LandscapeTaskViewProps {
  styles: any;
  horizontalPadding: number;
  windowHeight: number;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
  displayTime: string;
  isActive: boolean;
  secondsLeft: number;
  toggle: () => void;
  progress: number;
  reset: (time?: number) => void;
  adjustTime: (amount: number) => void;
  setDefaultTime: (time: number) => void;
  activeSoundId: string;
  setActiveSoundId: (id: string) => void;
  isDone: boolean;
  canCompleteToday: boolean;
  handleTaskCompletion: () => void;
  setPickerVisible: (visible: boolean) => void;
}

export const LandscapeTaskView: React.FC<LandscapeTaskViewProps> = ({
  styles,
  horizontalPadding,
  windowHeight,
  isFullScreen,
  setIsFullScreen,
  displayTime,
  isActive,
  secondsLeft,
  toggle,
  progress,
  reset,
  adjustTime,
  setDefaultTime,
  activeSoundId,
  setActiveSoundId,
  isDone,
  canCompleteToday,
  handleTaskCompletion,
  setPickerVisible,
}) => {
  const theme = useTheme();

  const pinchGesture = Gesture.Pinch().onEnd((event) => {
    if (event.scale > 1.2) {
      setIsFullScreen(true);
    } else if (event.scale < 0.8) {
      setIsFullScreen(false);
    }
  });

  const animatedDialStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFullScreen ? 1.1 : 1) }],
  }));

  return (
    <View
      style={[
        styles.landscapeContainer,
        { paddingHorizontal: horizontalPadding },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        }}
      >
        <Animated.View
          style={[styles.landscapeContent, { gap: isFullScreen ? 0 : 32 }]}
        >
          {/* LEFT: TIMER DIAL */}
          <GestureDetector gesture={pinchGesture}>
            <Animated.View
              style={[
                animatedDialStyle,
                {
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <TimerDial
                displayTime={displayTime}
                isPlaying={isActive}
                secondsRemaining={secondsLeft}
                onToggle={toggle}
                onCompleteTask={handleTaskCompletion}
                taskDate={canCompleteToday ? new Date() : new Date(0)}
                progress={progress}
                onEditRequest={() => setPickerVisible(true)}
                onResetRequest={() => reset()}
                isFullScreen={isFullScreen}
                size={isFullScreen ? windowHeight * 0.95 : windowHeight * 0.8}
              />
            </Animated.View>
          </GestureDetector>

          {/* RIGHT: COMMAND SIDEBAR */}
          {!isFullScreen && (
            <View style={styles.landscapeSidebar}>
              <TimeAdjusters
                presets={[1, 6, 12]}
                onAdjust={adjustTime}
                onSelectPreset={(minutes) => {
                  setDefaultTime(minutes);
                  reset(minutes);
                }}
              />
              <SoundscapeSelector
                activeSoundId={activeSoundId}
                onSelectSound={setActiveSoundId}
              />
              <LandscapeCompletionSlider
                isDone={isDone}
                canCompleteToday={canCompleteToday}
                onCompleteTask={handleTaskCompletion}
              />
            </View>
          )}
        </Animated.View>
      </View>

      {/* FULLSCREEN PROGRESS BAR */}
      {isFullScreen && (
        <View style={styles.screenBottomProgressContainer}>
          <View
            style={[
              styles.fullScreenProgressBar,
              {
                width: `95%`,
                backgroundColor: theme.colors.primaryContainer,
                opacity: 0.3,
                position: "absolute",
                left: "2.5%",
              },
            ]}
          />
          <Animated.View
            style={[
              styles.fullScreenProgressBar,
              {
                width: `${(1 - progress) * 95}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};
