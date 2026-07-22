import { TaskService } from "@/services/taskService";
import { Task } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isSameDay } from "date-fns";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  IconButton,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// GESTURE & ANIMATION ENGINE
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { CustomTimerPicker } from "@/components/CustomTimerPicker";
import { HeroHeader } from "@/components/task-detail/dashboard/HeroHeader";
import { MilestoneTracker } from "@/components/task-detail/dashboard/MilestoneTracker";
import { StatsOverview } from "@/components/task-detail/dashboard/StatsOverview";
import { Timeline } from "@/components/task-detail/dashboard/Timeline";
import { SoundscapeSelector } from "@/components/task-detail/timer/SoundScapeSelector";
import { TimeAdjusters } from "@/components/task-detail/timer/TimerAdjusters";
import { TimerDial } from "@/components/task-detail/timer/TimerDial";
import { useAllowRotation } from "@/hooks/useAllowRotation";
import { useTimer } from "@/hooks/useTimer";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  useAllowRotation();

  useEffect(() => {
    if (id) {
      TaskService.getTaskById(id)
        .then(setTask)
        .catch((err: Error) => console.error("Load Task Error:", err));
    }
  }, [id]);

  const canCompleteToday = useMemo(() => {
    if (!task) return false;

    const now = new Date();
    const dayIndex = now.getDay().toString();

    // Exception: Manually added to today
    const isAdHocMatch =
      task.adHocDate && isSameDay(new Date(task.adHocDate), now);

    // Rule: Matches standard schedule
    const isScheduledMatch =
      task.type === "one-time"
        ? task.startDate && isSameDay(new Date(task.startDate), now)
        : task.daysOfWeek?.includes(dayIndex);

    // 🔵 Check if already completed today to prevent double-dipping
    const isAlreadyDone =
      task.lastCompletedDate &&
      isSameDay(new Date(task.lastCompletedDate), now);

    return (isAdHocMatch || isScheduledMatch) && !isAlreadyDone;
  }, [task]);

  const handleTaskCompletion = async () => {
    if (!task) return;
    try {
      // Instead of just setting "completed: true", we use the streak logic
      // from your handleToggleTask function
      await TaskService.completeTask(task);

      // Optional: Refresh local task state to show "LOCKED" after completion
      const updated = await TaskService.getTaskById(id!);
      setTask(updated);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Completion failed", err);
    }
  };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const theme = useTheme();
  const styles = createStyles(theme, windowWidth);
  const insets = useSafeAreaInsets();
  const horizontalPadding = Math.max(insets.left, insets.right) + 20;

  const [defaultTime, setDefaultTime] = useState(25 * 60); // Default to 25 * 60s = 25 minutes

  // --- STATES ---
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.PORTRAIT_UP
  );
  const [activePage, setActivePage] = useState(0);
  const [activeSoundId, setActiveSoundId] = useState<string>("mute");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // --- ANIMATION VALUES ---
  const scale = useSharedValue(1);
  const {
    displayTime,
    isActive,
    progress,
    secondsLeft,
    toggle,
    reset,
    adjustTime,
  } = useTimer(25);

  const isLandscape = windowWidth > windowHeight;

  // 🟢 PINCH GESTURE: Zoom to Fullscreen
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd((event) => {
      if (event.scale > 1.2) {
        runOnJS(setIsFullScreen)(true);
      } else if (event.scale < 0.8) {
        runOnJS(setIsFullScreen)(false);
      }
      scale.value = withSpring(1);
    });

  const animatedDialStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFullScreen ? 1.1 : 1) }],
  }));

  const sliderTranslateX = useSharedValue(0);
  const SLIDER_WIDTH = 200; // Adjust based on your UI

  const landscapeSliderGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 🟢 Restrict movement to positive X and within the slider track
      sliderTranslateX.value = Math.max(
        0,
        Math.min(event.translationX, SLIDER_WIDTH - 44)
      );
    })
    .onEnd((event) => {
      if (sliderTranslateX.value > SLIDER_WIDTH * 0.8) {
        // 🟢 Success!
        if (canCompleteToday) {
          runOnJS(handleTaskCompletion)();
        } else {
          // Maybe a "shake" or red color if locked
          sliderTranslateX.value = withSpring(0);
        }
      } else {
        // 🔴 Slide back if not far enough
        sliderTranslateX.value = withSpring(0);
      }
    });

  const animatedSliderHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderTranslateX.value }],
  }));

  // --- EFFECTS ---
  useEffect(() => {
    ScreenOrientation.getOrientationAsync().then((o) => setOrientation(o));
    const sub = ScreenOrientation.addOrientationChangeListener((evt) =>
      setOrientation(evt.orientationInfo.orientation)
    );
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, []);

  useEffect(() => {
    if (!isLandscape) setIsFullScreen(false);
  }, [isLandscape]);

  // Audio Logic
  async function playSound(id: string) {
    if (sound) await sound.unloadAsync();
    const audioFiles: { [key: string]: any } = {
      rain: require("@/assets/audio/rainfall-track.mp3"),
      lofi: require("@/assets/audio/lofi-track.mp3"),
      forest: require("@/assets/audio/forest-track.mp3"),
      noise: require("@/assets/audio/wave-track.mp3"),
      synth: require("@/assets/audio/piano.mp3"),
    };
    if (id === "mute" || !audioFiles[id]) return;
    const { sound: newSound } = await Audio.Sound.createAsync(audioFiles[id], {
      shouldPlay: true,
      isLooping: true,
    });
    setSound(newSound);
  }

  useEffect(() => {
    playSound(activeSoundId);
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [activeSoundId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isLandscape ? (
        /* 🟢 LANDSCAPE MODE (Inlined for reactive state) */
        <View
          style={[
            styles.landscapeContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <Stack.Screen options={{ headerShown: false }} />

          {/* Wrapper to handle internal padding so the bar stays at the true screen edge */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: horizontalPadding,
              paddingRight: horizontalPadding,
              // paddingLeft: insets.left + 60,
              // paddingRight: insets.right + 20,
            }}
          >
            <GestureDetector gesture={pinchGesture}>
              <Animated.View
                style={[
                  styles.landscapeContent,
                  { gap: isFullScreen ? 0 : 32 },
                ]}
              >
                {/* LEFT: TIMER DIAL */}
                <Animated.View
                  style={[
                    animatedDialStyle,
                    {
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      // 🔵 SUGGESTION: Remove any fixed margins when in full screen to ensure true centering
                      marginLeft: isFullScreen ? 0 : 0,
                    },
                  ]}
                >
                  <TimerDial
                    displayTime={displayTime}
                    isPlaying={isActive}
                    secondsRemaining={secondsLeft}
                    onToggle={toggle}
                    onCompleteTask={() => {
                      console.log("completed", { id });
                      //handleTaskCompletion
                    }}
                    taskDate={canCompleteToday ? new Date() : new Date(0)}
                    progress={progress}
                    onEditRequest={() => setPickerVisible(true)}
                    onResetRequest={() => reset(defaultTime)}
                    isFullScreen={isFullScreen}
                    size={
                      isFullScreen ? windowHeight * 0.95 : windowHeight * 0.8
                    }
                  />
                </Animated.View>

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

                    <View style={styles.landscapeFooterWrapper}>
                      <Surface
                        style={styles.landscapeSliderTrack}
                        elevation={2}
                      >
                        <View style={styles.sliderInner}>
                          <View style={styles.sliderBackgroundTextContainer}>
                            <Text
                              variant="labelSmall"
                              style={styles.landscapeSliderText}
                            >
                              {canCompleteToday ? "DRAG TO COMPLETE" : "LOCKED"}
                            </Text>
                          </View>
                          <GestureDetector gesture={landscapeSliderGesture}>
                            <Animated.View
                              style={[
                                styles.sliderHandle,
                                animatedSliderHandleStyle,
                                {
                                  height: 44,
                                  width: 44,
                                  backgroundColor: canCompleteToday
                                    ? theme.colors.primary
                                    : "grey",
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={canCompleteToday ? "check" : "lock"}
                                size={24}
                                color={theme.colors.onPrimary}
                              />
                            </Animated.View>
                          </GestureDetector>
                        </View>
                      </Surface>
                    </View>
                  </View>
                )}
              </Animated.View>
            </GestureDetector>
          </View>

          {/* 🟢 FIXED PROGRESS BAR: Outside the padded wrapper and reactive */}
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
                    // left: "2.5%",
                  },
                ]}
              />
            </View>
          )}
        </View>
      ) : (
        /* 🟢 PORTRAIT MODE */
        <View style={styles.container}>
          <Stack.Screen
            options={{ headerShown: true, title: "Task Details" }}
          />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.paddedSection}>
              <View style={styles.actionRow}>
                <IconButton icon="pencil-outline" />
              </View>
            </View>
            <View style={styles.pagerWrapper}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) =>
                  setActivePage(
                    Math.round(e.nativeEvent.contentOffset.x / windowWidth)
                  )
                }
                scrollEventThrottle={16}
              >
                <View style={styles.slide}>
                  <HeroHeader emoji="🚀" title="Task Title" category="Focus" />
                  <StatsOverview
                    currentStreak={12}
                    totalCompletions={148}
                    bestStreak={24}
                  />
                  <Timeline
                    history={[true, true, true, true, true, false, true]}
                  />
                  <MilestoneTracker currentStreak={12} nextMilestoneGoal={15} />
                </View>
                <View style={styles.slide}>
                  <View style={styles.timerSlideWrapper}>
                    <TimerDial
                      displayTime={displayTime}
                      isPlaying={isActive}
                      secondsRemaining={secondsLeft}
                      onToggle={toggle}
                      onCompleteTask={() => {
                        console.log("completed", { id });
                        //handleTaskCompletion
                      }}
                      taskDate={canCompleteToday ? new Date() : new Date(0)}
                      progress={progress}
                      onEditRequest={() => setPickerVisible(true)}
                      onResetRequest={() => reset(defaultTime)}
                      size={260}
                      isFullScreen={isFullScreen}
                    />
                    <TimeAdjusters
                      presets={[15, 25, 45]}
                      onAdjust={adjustTime}
                      onSelectPreset={(minutes) => {
                        setDefaultTime(minutes);
                        reset(minutes);
                      }}
                    />
                  </View>
                  <SoundscapeSelector
                    activeSoundId={activeSoundId}
                    onSelectSound={setActiveSoundId}
                  />
                </View>
              </ScrollView>
              <View style={styles.dotRow}>
                <View
                  style={[styles.dot, activePage === 0 && styles.activeDot]}
                />
                <View
                  style={[styles.dot, activePage === 1 && styles.activeDot]}
                />
              </View>
            </View>
            <View style={styles.paddedSection}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Notes
                </Text>
                <IconButton icon="plus" size={20} />
              </View>
              <Surface style={styles.notesSurface} elevation={0}>
                <Text variant="bodyMedium" style={styles.notesPlaceholder}>
                  Tap to add notes...
                </Text>
              </Surface>
            </View>
          </ScrollView>
          <View style={styles.floatingFooter}>
            <Surface style={styles.sliderTrack} elevation={2}>
              <View style={styles.sliderInner}>
                <View style={styles.sliderBackgroundTextContainer}>
                  <Text variant="labelLarge" style={styles.sliderText}>
                    Swipe to Complete
                  </Text>
                </View>
                <View style={styles.sliderHandle}>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={28}
                    color={theme.colors.onPrimary}
                  />
                </View>
              </View>
            </Surface>
          </View>
        </View>
      )}

      {/* SHARED PORTAL */}
      <Portal>
        <CustomTimerPicker
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={(seconds: number) => {
            reset(seconds / 60);
            setPickerVisible(false);
          }}
        />
      </Portal>
    </GestureHandlerRootView>
  );
}

const createStyles = (theme: any, windowWidth: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 120 },
    paddedSection: { paddingHorizontal: 20 },
    actionRow: { flexDirection: "row-reverse" },
    pagerWrapper: { height: 475 },
    slide: { height: "100%", width: windowWidth, paddingHorizontal: 20 },
    timerSlideWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dotRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.outlineVariant,
      marginHorizontal: 4,
    },
    activeDot: { backgroundColor: theme.colors.primary, width: 16 },
    floatingFooter: { position: "absolute", bottom: 20, left: 20, right: 20 },
    sliderTrack: {
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface,
      padding: 6,
    },
    sliderInner: { flex: 1, flexDirection: "row", alignItems: "center" },
    sliderBackgroundTextContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    sliderText: {
      opacity: 0.3,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    sliderHandle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    // LANDSCAPE STYLES
    landscapeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      overflow: "visible",
    },
    landscapeContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      flex: 1,
    },
    landscapeSidebar: {
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      width: 300,
      marginLeft: 100,
      marginRight: -60,
      // marginRight: 50,
    },
    landscapeFooterWrapper: { width: "100%", marginTop: 8 },
    landscapeSliderTrack: {
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.colors.surface,
      padding: 4,
    },
    landscapeSliderText: {
      opacity: 0.4,
      fontWeight: "900",
      fontSize: 10,
      letterSpacing: 1,
    },

    // PROGRESS BAR STYLES
    screenBottomProgressContainer: {
      position: "absolute",
      bottom: 20,
      left: 0, // 🔵 SUGGESTION: Essential for spanning the full width
      right: 0, // 🔵 SUGGESTION: Essential for spanning the full width
      height: 8,
      backgroundColor: "rgba(0,0,0,0.1)", // 🔵 SUGGESTION: Visible track
      zIndex: 1,
      // overflow: "visible",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: "2.5%",
    },
    fullScreenProgressBar: {
      height: "100%",
      borderRadius: 4,
    },
    // --- Rest of Styles ---
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    notesSurface: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      minHeight: 120,
    },
    notesPlaceholder: { opacity: 0.4, fontStyle: "italic" },
  });
