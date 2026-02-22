import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Text,
  IconButton,
  useTheme,
  Surface,
  Portal,
  Modal,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";

import { useTimer } from "@/hooks/useTimer";

import { HeroHeader } from "@/components/task-detail/dashboard/HeroHeader";
import { StatsOverview } from "@/components/task-detail/dashboard/StatsOverview";
import { Timeline } from "@/components/task-detail/dashboard/Timeline";
import { MilestoneTracker } from "@/components/task-detail/dashboard/MilestoneTracker";
import { TimerDial } from "@/components/task-detail/timer/TimerDial";
import { TimeAdjusters } from "@/components/task-detail/timer/TimerAdjusters";
import { SoundscapeSelector } from "@/components/task-detail/timer/SoundScapeSelector";
import { CustomTimerPicker } from "@/components/CustomTimerPicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const {
    displayTime,
    isActive,
    progress,
    secondsLeft,
    toggle,
    reset,
    adjustTime,
  } = useTimer(25);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.PORTRAIT_UP
  );

  const [activePage, setActivePage] = useState(0);
  const [activeSoundId, setActiveSoundId] = useState<string>("mute");
  const [pickerVisible, setPickerVisible] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // 1. Get initial orientation
    ScreenOrientation.getOrientationAsync().then((o) => setOrientation(o));

    // 2. Listen for changes
    const subscription = ScreenOrientation.addOrientationChangeListener(
      (evt) => {
        setOrientation(evt.orientationInfo.orientation);
      }
    );

    return () =>
      ScreenOrientation.removeOrientationChangeListener(subscription);
  }, []);

  async function playSound(id: string) {
    // 1. Unload previous sound
    if (sound) {
      await sound.unloadAsync();
    }

    // 2. Map IDs to local files or remote URLs
    const audioFiles: { [key: string]: any } = {
      rain: require("@/assets/audio/rainfall-track.mp3"),
      lofi: require("@/assets/audio/lofi-track.mp3"),
      forest: require("@/assets/audio/forest-track.mp3"),
      noise: require("@/assets/audio/wave-track.mp3"),
      synth: require("@/assets/audio/piano.mp3"),
    };

    if (id === "mute" || !audioFiles[id]) return;

    // 3. Load and play
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

  const isLandscape =
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(x / SCREEN_WIDTH);
    setActivePage(currentIndex);
  };

  const MainContent = isLandscape ? (
    <View
      style={[
        styles.landscapeContainer,
        {
          paddingLeft: insets.left + 60,
          paddingRight: insets.right + 20,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Hide header in landscape */}
      <View style={styles.landscapeContent}>
        <TimerDial
          displayTime={displayTime}
          isPlaying={isActive}
          secondsRemaining={secondsLeft}
          onToggle={toggle}
          progress={progress}
          onEditRequest={() => setPickerVisible(true)}
          onResetRequest={() => reset(25)}
          size={Dimensions.get("window").height * 0.85} // 🟢 Make it huge!
        />

        {/* Optional: Add mini controls on the side */}
        <View style={styles.landscapeSidebar}>
          <TimeAdjusters
            presets={[15, 25, 45]}
            onAdjust={adjustTime}
            onSelectPreset={reset}
          />

          <SoundscapeSelector
            activeSoundId={activeSoundId}
            onSelectSound={setActiveSoundId}
          />
          {/* 3. Complete (The Slider) */}
          <View style={styles.landscapeFooterWrapper}>
            <Surface style={styles.landscapeSliderTrack} elevation={2}>
              <View style={styles.sliderInner}>
                <View style={styles.sliderBackgroundTextContainer}>
                  <Text variant="labelSmall" style={styles.landscapeSliderText}>
                    DONE
                  </Text>
                </View>
                <View style={[styles.sliderHandle, { height: 44, width: 44 }]}>
                  <MaterialCommunityIcons
                    name="check"
                    size={24}
                    color={theme.colors.onPrimary}
                  />
                </View>
              </View>
            </Surface>
          </View>
        </View>
      </View>
      <Portal>
        <CustomTimerPicker
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={(seconds: number) => {
            reset(seconds / 60); // Assuming reset takes minutes
            setPickerVisible(false);
          }}
        />
      </Portal>
    </View>
  ) : (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isLandscape, // Show in Portrait, Hide in Landscape
          title: "Task Details", // Or your dynamic title
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header (Indented) */}
        <View style={styles.paddedSection}>
          <View style={styles.actionRow}>
            <IconButton icon="pencil-outline" onPress={() => {}} />
          </View>
        </View>

        {/* --- PAGER SECTION --- */}
        <View style={styles.pagerWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* --- SLIDE 1: THE OVERVIEW --- */}
            <View style={styles.slide}>
              <View style={styles.overviewSlideWrapper}>
                <HeroHeader
                  emoji="🚀"
                  title="Task Title"
                  category="Health & Wellness"
                />

                {/* Stats Row */}
                <StatsOverview
                  currentStreak={12}
                  totalCompletions={148}
                  bestStreak={24}
                />

                {/* 🟢 NEW: 7-Day Timeline Section */}
                <Timeline
                  history={[true, true, true, true, true, false, true]}
                />

                {/* 🟢 NEW: Next Milestone Section */}
                <MilestoneTracker currentStreak={12} nextMilestoneGoal={15} />
              </View>
            </View>

            {/* --- SLIDE 2: THE TIMER COMMAND CENTER --- */}
            <View style={styles.slide}>
              <View style={styles.timerSlideWrapper}>
                {/* 🟢 The Outer Dial/Ring */}

                <TimerDial
                  displayTime={displayTime}
                  isPlaying={isActive}
                  secondsRemaining={secondsLeft}
                  onToggle={toggle}
                  progress={progress}
                  onEditRequest={() => setPickerVisible(true)}
                  onResetRequest={() => reset(25)}
                  size={260}
                />

                <TimeAdjusters
                  presets={[15, 25, 45]}
                  onAdjust={adjustTime}
                  onSelectPreset={reset}
                />
              </View>
              {/* 🟢 Ambient Soundscape (Bottom) */}
              <SoundscapeSelector
                activeSoundId={activeSoundId}
                onSelectSound={(id) => setActiveSoundId(id)}
              />
            </View>
          </ScrollView>

          {/* --- Pagination Dots --- */}
          <View style={styles.dotRow}>
            <View style={[styles.dot, activePage === 0 && styles.activeDot]} />
            <View style={[styles.dot, activePage === 1 && styles.activeDot]} />
          </View>
        </View>

        {/* NOTES SECTION */}
        <View style={styles.paddedSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              Notes
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => console.log("Add Note")}
            />
          </View>

          <Surface style={styles.notesSurface} elevation={0}>
            <Text variant="bodyMedium" style={styles.notesPlaceholder}>
              Tap to add notes about your progress, gym PRs, or reflections...
            </Text>
          </Surface>
        </View>
      </ScrollView>

      {/* FLOATING FOOTER PILL */}
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
      <Portal>
        <CustomTimerPicker
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={(seconds: number) => {
            reset(seconds); // Updates the useTimer hook state
            setPickerVisible(false);
          }}
        />
      </Portal>
    </View>
  );

  return (
    <>
      {MainContent}

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
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingTop: 0, paddingBottom: 150 }, // Extra padding for floating footer
    paddedSection: { paddingHorizontal: 20, marginTop: 10 },
    actionRow: { flexDirection: "row-reverse" },
    pagerWrapper: { height: 500 },
    overviewSlideWrapper: { flex: 1, paddingHorizontal: 20 },
    slide: { width: SCREEN_WIDTH, height: "100%" },

    // --- Timer Slide Styles ---
    timerSlideWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      //   backgroundColor: theme.colors.surface,
    },

    // --- Navigation & Dots ---
    dotRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.outlineVariant,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
      width: 16,
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

    // FLOATING PILL FOOTER
    floatingFooter: {
      position: "absolute",
      bottom: 20, // Floating above the bottom edge
      left: 20,
      right: 20,
      alignItems: "center",
    },
    sliderTrack: {
      width: "100%",
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface,
      //   flexDirection: "row",
      //   alignItems: "center",
      padding: 6, // Padding for the handle
      //   overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    sliderInner: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      padding: 6,
      borderRadius: 32, // Match the parent
      overflow: "hidden", // 🟢 CLIPPING HAPPENS HERE
    },
    sliderBackgroundTextContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    sliderText: {
      opacity: 0.3,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sliderHandle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },

    // landscape styles
    landscapeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      // paddingHorizontal: 80,
    },
    landscapeContent: {
      flexDirection: "row", // Dial on left, sounds on right
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      // gap: 0,
      // paddingHorizontal: 50,
    },
    landscapeSidebar: {
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    landscapeFooterWrapper: {
      width: 300, // Slightly wider for better swipe feel
      marginTop: 15,
    },
    landscapeSliderTrack: {
      width: "100%",
      height: 54, // Slightly slimmer for landscape
      borderRadius: 27,
      backgroundColor: theme.colors.surface,
      padding: 4,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    landscapeSliderText: {
      opacity: 0.4,
      fontWeight: "900",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
  });
