import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Portal, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomTimerPicker } from "@/components/CustomTimerPicker";
import { LandscapeTaskView } from "@/components/task-detail/views/LandscapeTaskView";
import { PortraitTaskView } from "@/components/task-detail/views/PortraitTaskView";

import { useAllowRotation } from "@/hooks/useAllowRotation";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTaskDetail } from "@/hooks/useTaskDetails";
import { useTimer } from "@/hooks/useTimer";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useAllowRotation();

  const { activeSoundId, setActiveSoundId } = useAudioPlayer("mute");
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const theme = useTheme();
  const styles = createStyles(theme, windowWidth);
  const insets = useSafeAreaInsets();
  const horizontalPadding = Math.max(insets.left, insets.right) + 20;

  const [, setDefaultTime] = useState(25 * 60);
  const [activePage, setActivePage] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    displayTime,
    isActive,
    progress,
    secondsLeft,
    toggle,
    reset,
    adjustTime,
  } = useTimer(25);

  const { task, canCompleteToday, isDone, handleTaskCompletion } =
    useTaskDetail(id);

  const isLandscape = windowWidth > windowHeight;

  useEffect(() => {
    if (!isLandscape) setIsFullScreen(false);
  }, [isLandscape]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isLandscape ? (
        <LandscapeTaskView
          styles={styles}
          horizontalPadding={horizontalPadding}
          windowHeight={windowHeight}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          displayTime={displayTime}
          isActive={isActive}
          secondsLeft={secondsLeft}
          toggle={toggle}
          progress={progress}
          reset={reset}
          adjustTime={adjustTime}
          setDefaultTime={setDefaultTime}
          activeSoundId={activeSoundId}
          setActiveSoundId={setActiveSoundId}
          isDone={isDone}
          canCompleteToday={canCompleteToday}
          handleTaskCompletion={handleTaskCompletion}
          setPickerVisible={setPickerVisible}
        />
      ) : (
        <PortraitTaskView
          styles={styles}
          windowWidth={windowWidth}
          activePage={activePage}
          setActivePage={setActivePage}
          displayTime={displayTime}
          isActive={isActive}
          secondsLeft={secondsLeft}
          toggle={toggle}
          progress={progress}
          reset={reset}
          adjustTime={adjustTime}
          setDefaultTime={setDefaultTime}
          activeSoundId={activeSoundId}
          setActiveSoundId={setActiveSoundId}
          canCompleteToday={canCompleteToday}
          handleTaskCompletion={handleTaskCompletion}
          setPickerVisible={setPickerVisible}
          isFullScreen={isFullScreen}
        />
      )}

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
