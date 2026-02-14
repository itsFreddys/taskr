import React, { use, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Text,
  IconButton,
  useTheme,
  Surface,
  Button,
  ProgressBar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;

// 🟢 Mock Data for UI development (Will replace with real data later)
const last7DaysHistory = [true, true, true, true, true, false, true]; // Last item is "Today"
const currentStreak = 12;
const nextMilestoneGoal = 15;
const milestoneProgress = currentStreak / nextMilestoneGoal; // 0.8 (80%)

const StatCard = ({ label, value, icon, color, styles }: any) => (
  <Surface style={styles.statCard} elevation={1}>
    <MaterialCommunityIcons name={icon} size={20} color={color} />
    <Text variant="titleLarge" style={styles.statValue}>
      {value}
    </Text>
    <Text variant="labelSmall" style={styles.statLabel}>
      {label}
    </Text>
  </Surface>
);

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams(); // 🟢 Grabs the ID from the URL
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [activePage, setActivePage] = useState(0);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    // 🟢 Simple division for index
    const currentIndex = Math.round(x / SCREEN_WIDTH);
    setActivePage(currentIndex);
  };

  // Note: Later we will pull the actual task data from a global state or DB
  // For now, let's just set up the UI shell.

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

        {/* --- Hero Section --- */}
        <View style={styles.pagerWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            // snapToAlignment="center"
          >
            {/* --- SLIDE 1: THE OVERVIEW --- */}
            <View style={styles.slide}>
              <View style={styles.overviewSlideWrapper}>
                <View style={styles.heroContent}>
                  <Surface style={styles.emojiContainer} elevation={1}>
                    <Text style={styles.emojiText}>🚀</Text>
                  </Surface>
                  <Text variant="headlineSmall" style={styles.title}>
                    Task Title
                  </Text>
                  <Text variant="bodyMedium" style={styles.categoryText}>
                    Health & Wellness
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <StatCard
                    label="Streak"
                    value="12"
                    icon="fire"
                    color="#FF9800"
                    styles={styles}
                  />
                  <StatCard
                    label="Total"
                    value="148"
                    icon="check-all"
                    color="#4CAF50"
                    styles={styles}
                  />
                  <StatCard
                    label="Best"
                    value="24"
                    icon="trophy"
                    color="#FFD700"
                    styles={styles}
                  />
                </View>
              </View>
            </View>

            {/* --- SLIDE 2: THE COMMAND CENTER --- */}
            <View style={styles.slide}>
              <View style={styles.timerSlideWrapper}>
                <View style={styles.timerContainer}>
                  <Text variant="labelLarge" style={styles.timerSubtitle}>
                    Focus Timer
                  </Text>
                  <Text style={styles.largeTimerDisplay}>25:00</Text>

                  <View style={styles.timerControls}>
                    <IconButton icon="minus-circle-outline" size={28} />
                    <Button
                      mode="contained"
                      style={styles.playButton}
                      icon="play"
                    >
                      Start
                    </Button>
                    <IconButton icon="plus-circle-outline" size={28} />
                  </View>

                  <View style={styles.presetChips}>
                    {["15m", "25m", "45m"].map((m) => (
                      <Surface key={m} style={styles.chip} elevation={1}>
                        <Text variant="labelSmall">{m}</Text>
                      </Surface>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          {/* --- Pagination Dots --- */}
          <View style={styles.dotRow}>
            <View style={[styles.dot, activePage === 0 && styles.activeDot]} />
            <View style={[styles.dot, activePage === 1 && styles.activeDot]} />
          </View>
        </View>

        <View style={styles.sectionContainer}>
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

      {/* --- More sections will go here in the next increment --- */}
      {/* --- 🟢 THE FLOATING ACTION PILL --- */}
      <View style={styles.floatingFooter}>
        {/* The Slider Track */}
        <Surface style={styles.sliderTrack} elevation={2}>
          <View style={styles.sliderBackgroundTextContainer}>
            <Text variant="labelLarge" style={styles.sliderText}>
              Swipe to Complete
            </Text>
          </View>

          {/* The Handle (This will become interactive next) */}
          <View style={styles.sliderHandle}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color={theme.colors.onPrimary}
            />
          </View>
        </Surface>

        {/* Secondary Actions (Tucked subtly below the pill) */}
        {/* <View style={styles.secondaryActionRow}>
          <Button
            mode="text"
            compact
            icon="pause-circle-outline"
            onPress={() => {}}
            labelStyle={{ fontSize: 12, opacity: 0.6 }}
          >
            Pause Streak
          </Button>
          <Button
            mode="text"
            compact
            textColor={theme.colors.error}
            onPress={() => {}}
            labelStyle={{ fontSize: 12, opacity: 0.6 }}
          >
            Delete Task
          </Button>
        </View> */}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingVertical: 20 }, // 🟢 Removed horizontal padding
    paddedSection: { paddingHorizontal: 20 }, // 🟢 Use this for non-pager content
    actionRow: {
      flexDirection: "row-reverse",
    },
    pagerWrapper: {
      height: 400, // Fixed height for carousel
      marginBottom: 10,
    },
    overviewSlideWrapper: {
      flex: 1,
      padding: 20,
      //   backgroundColor: theme.colors.surface,
    },
    slide: {
      width: SCREEN_WIDTH, // 🟢 Full screen width
      height: "100%",
    },
    heroContent: {
      alignItems: "center",
      marginBottom: 40,
    },
    // statsRowWrapper: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   paddingHorizontal: 20, // 🟢 Stats row stays indented even if slide is full-width
    // },
    timerSlideWrapper: {
      flex: 1,
      paddingHorizontal: 20, // 🟢 Provides that "gap" feel for the Timer container
    },
    timerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 24,
    },
    timerSubtitle: {
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: theme.colors.primary,
      marginBottom: 8,
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
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    largeTimerDisplay: {
      fontSize: 72, // Made it slightly larger
      fontWeight: "300",
      marginVertical: 10,
      color: theme.colors.onSurface,
    },
    timerControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      marginVertical: 15,
    },
    playButton: { paddingHorizontal: 20, borderRadius: 30 },
    presetChips: { flexDirection: "row", gap: 10, marginTop: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },

    // --- Navigation & Dots ---
    dotRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
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
    statCard: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 20, // 🟢 Increased vertical padding for "beefier" look
      paddingHorizontal: 8,
      borderRadius: 16, // 🟢 Slightly rounder for premium feel
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      minHeight: 100, // 🟢 Forces the card to have a visible vertical presence
    },
    statValue: { fontWeight: "bold", marginVertical: 2 },
    statLabel: { opacity: 0.5, textAlign: "center" },
    sectionContainer: { marginTop: 24, paddingHorizontal: 20 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sectionTitle: { fontWeight: "bold" },
    notesSurface: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      minHeight: 120,
    },
    notesPlaceholder: { opacity: 0.4, fontStyle: "italic" },
    actionCenter: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: theme.colors.surface,
      elevation: 10, // Higher elevation for better shadow
    },
    actionRowPrimary: { marginBottom: 12 },
    completeButton: { borderRadius: 12 },
    actionRowSecondary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    // Add these to your createStyles block
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
      flexDirection: "row",
      alignItems: "center",
      padding: 6, // Padding for the handle
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
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
    secondaryActionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "90%",
      marginTop: 12,
    },
  });
