import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Text,
  IconButton,
  useTheme,
  Surface,
  Button,
  ProgressBar, // 🟢 Added import
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HeroHeader } from "@/components/task-detail/dashboard/HeroHeader";
import { StatsOverview } from "@/components/task-detail/dashboard/StatsOverview";
import { Timeline } from "@/components/task-detail/dashboard/Timeline";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;

// 🟢 Mock Data for UI development (Will replace with real data later)
const last7DaysHistory = [true, true, true, true, true, false, true]; // Last item is "Today"
const currentStreak = 12;
const nextMilestoneGoal = 15;
const milestoneProgress = currentStreak / nextMilestoneGoal; // 0.8 (80%)

const StatCard = ({ label, value, icon, color, styles }: any) => (
  <Surface style={styles.statCard} elevation={1}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text variant="titleLarge" style={styles.statValue}>
      {value || "0"}
    </Text>
    <Text variant="labelSmall" style={styles.statLabel}>
      {label}
    </Text>
  </Surface>
);

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [activePage, setActivePage] = useState(0);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(x / SCREEN_WIDTH);
    setActivePage(currentIndex);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
                <View style={styles.milestoneSection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Next Milestone
                  </Text>

                  <View style={styles.milestoneSecondHeader}>
                    <Text variant="bodyMedium" style={styles.milestoneSubtitle}>
                      {`${
                        nextMilestoneGoal - currentStreak
                      } days until a ${nextMilestoneGoal}-day streak!`}
                    </Text>
                    <Text
                      variant="labelLarge"
                      style={styles.milestonePercentage}
                    >
                      {`${Math.round(milestoneProgress * 100)}%`}
                    </Text>
                  </View>

                  <ProgressBar
                    progress={milestoneProgress}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                </View>
              </View>
            </View>

            {/* --- SLIDE 2: THE TIMER COMMAND CENTER --- */}
            <View style={styles.slide}>
              <View style={styles.timerSlideWrapper}>
                {/* 🟢 The Outer Dial/Ring */}
                <View style={styles.timerDial}>
                  {/* 🟢 Centered Content */}
                  <View style={styles.dialInternalContent}>
                    <Text variant="labelLarge" style={styles.timerSubtitle}>
                      Focusing
                    </Text>
                    <Text style={styles.largeTimerDisplay}>25:00</Text>

                    {/* Play/Pause Button inside the ring or right below it */}
                    <Button
                      mode="contained"
                      style={styles.dialPlayButton}
                      icon="play"
                      contentStyle={{ height: 48 }}
                    >
                      Start
                    </Button>
                  </View>
                </View>

                {/* 🟢 Time Adjustments (Outside the ring for clean ergonomics) */}
                <View style={styles.dialAdjustmentRow}>
                  <IconButton
                    icon="minus-circle-outline"
                    size={32}
                    onPress={() => console.log("Decrease")}
                  />

                  <View style={styles.presetChips}>
                    {["15m", "25m", "45m"].map((m) => (
                      <Surface key={m} style={styles.chip} elevation={1}>
                        <Text variant="labelSmall">{m}</Text>
                      </Surface>
                    ))}
                  </View>

                  <IconButton
                    icon="plus-circle-outline"
                    size={32}
                    onPress={() => console.log("Increase")}
                  />
                </View>
              </View>
              {/* 🟢 Ambient Soundscape (Bottom) */}
              <View style={styles.soundscapeRow}>
                {[
                  { id: "mute", icon: "volume-off" },
                  { id: "rain", icon: "weather-pouring" },
                  { id: "lofi", icon: "cassette" },
                  { id: "forest", icon: "tree" },
                  { id: "noise", icon: "waves" },
                ].map((sound) => (
                  <IconButton
                    key={sound.id}
                    icon={sound.icon}
                    size={24}
                    mode="contained-tonal"
                    style={styles.soundButton}
                    onPress={() => console.log(`Play ${sound.id}`)}
                  />
                ))}
              </View>
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
            <Text variant="titleMedium" style={styles.sectionTitle}>
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
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 0, paddingBottom: 150 }, // Extra padding for floating footer
    paddedSection: { paddingHorizontal: 20, marginTop: 10 },
    actionRow: {
      flexDirection: "row-reverse",
    },
    pagerWrapper: {
      // 🟢 Increased height to fit new sections comfortably
      height: 500,
      //   marginVertical: 10,
    },
    overviewSlideWrapper: {
      flex: 1,
      paddingHorizontal: 20,
      // justifyContent: "center", // removed center so it flows from top
    },
    slide: {
      width: SCREEN_WIDTH,
      height: "100%",
    },
    heroContent: {
      alignItems: "center",
      marginBottom: 10,
      marginTop: 10,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 10,
    },
    statCard: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 20,
      paddingHorizontal: 8,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      minHeight: 100,
    },
    statValue: {
      fontWeight: "bold",
      marginTop: 4,
      color: theme.colors.onSurface,
    },
    statLabel: {
      opacity: 0.6,
      textAlign: "center",
      fontSize: 11,
      marginTop: 2,
    },

    // 🟢 NEW DASHBOARD STYLES
    DashboardSection: {
      marginTop: 65,
      width: "100%",
    },
    milestoneSection: {
      marginTop: 25,
      width: "100%",
    },
    sectionTitle: { fontWeight: "bold" },
    // Timeline
    timelineRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
      paddingHorizontal: 10,
    },
    timelineItemWrapper: {
      alignItems: "center",
      justifyContent: "center",
      // width: 40 // Ensure consistent spacing
    },
    timelineDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    timelineDotDone: {
      backgroundColor: theme.colors.primary, // Uses theme primary color (usually green/purple)
      borderColor: theme.colors.primary,
    },
    timelineDotMissed: {
      backgroundColor: "transparent",
      borderColor: theme.colors.outlineVariant,
    },
    timelineDotTodayGlowing: {
      // Optional: add subtle shadow or border change for today if completed
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },

    // Milestone
    milestoneHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    milestoneSecondHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    milestonePercentage: { fontWeight: "bold", color: theme.colors.primary },
    milestoneSubtitle: { opacity: 0.7, marginBottom: 12 },
    progressBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.surfaceVariant,
    },

    // --- Timer Slide Styles ---
    timerSlideWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      //   backgroundColor: theme.colors.surface,
    },
    // 🟢 The Circular Dial
    timerDial: {
      width: 260,
      height: 260,
      borderRadius: 130,
      borderWidth: 12, // The thickness of the ring
      borderColor: theme.colors.primaryContainer, // Light background ring
      borderTopColor: theme.colors.primary, // This makes it look like a progress gauge
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
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
      fontWeight: "200", // Thinner font looks more "high-end" in a circle
      color: theme.colors.onSurface,
      fontVariant: ["tabular-nums"], // Prevents numbers from jumping while counting
    },
    dialPlayButton: {
      marginTop: 10,
      borderRadius: 20,
      paddingHorizontal: 10,
    },
    // 🟢 Bottom Controls
    dialAdjustmentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30,
      width: "100%",
    },
    presetChips: {
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 10,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
    timerContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      paddingVertical: 40,
      paddingHorizontal: 24,
      width: "100%",
    },
    emojiContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    emojiText: { fontSize: 40 },
    title: { fontWeight: "bold", textAlign: "center" },
    categoryText: { opacity: 0.6, marginTop: 4 },
    timerControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      marginVertical: 15,
    },
    playButton: { paddingHorizontal: 20, borderRadius: 30 },

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
    intentionContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.03)",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 30, // Gap before the dial
    },
    intentionText: {
      marginLeft: 8,
      opacity: 0.7,
      fontStyle: "italic",
    },

    // --- Soundscape ---
    soundscapeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginTop: 40, // Gap after adjustments
      marginBottom: 20,
    },
    soundButton: {
      margin: 0,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
  });
