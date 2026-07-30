import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

import { HeroHeader } from "@/components/task-detail/dashboard/HeroHeader";
import { MilestoneTracker } from "@/components/task-detail/dashboard/MilestoneTracker";
import { StatsOverview } from "@/components/task-detail/dashboard/StatsOverview";
import { Timeline } from "@/components/task-detail/dashboard/Timeline";
import { SoundscapeSelector } from "@/components/task-detail/timer/SoundScapeSelector";
import { TimeAdjusters } from "@/components/task-detail/timer/TimerAdjusters";
import { TimerDial } from "@/components/task-detail/timer/TimerDial";

interface PortraitTaskViewProps {
  styles: any;
  windowWidth: number;
  activePage: number;
  setActivePage: (page: number) => void;
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
  canCompleteToday: boolean;
  handleTaskCompletion: () => void;
  setPickerVisible: (visible: boolean) => void;
  isFullScreen: boolean;
}

export const PortraitTaskView: React.FC<PortraitTaskViewProps> = ({
  styles,
  windowWidth,
  activePage,
  setActivePage,
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
  canCompleteToday,
  handleTaskCompletion,
  setPickerVisible,
  isFullScreen,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "Task Details" }} />
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
            {/* SLIDE 1: STATS & DASHBOARD */}
            <View style={styles.slide}>
              <HeroHeader emoji="🚀" title="Task Title" category="Focus" />
              <StatsOverview
                currentStreak={12}
                totalCompletions={148}
                bestStreak={24}
              />
              <Timeline history={[true, true, true, true, true, false, true]} />
              <MilestoneTracker currentStreak={12} nextMilestoneGoal={15} />
            </View>

            {/* SLIDE 2: TIMER & SOUNDS */}
            <View style={styles.slide}>
              <View style={styles.timerSlideWrapper}>
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

          {/* PAGE DOTS */}
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
            <IconButton icon="plus" size={20} />
          </View>
          <Surface style={styles.notesSurface} elevation={0}>
            <Text variant="bodyMedium" style={styles.notesPlaceholder}>
              Tap to add notes...
            </Text>
          </Surface>
        </View>
      </ScrollView>

      {/* FOOTER */}
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
};
