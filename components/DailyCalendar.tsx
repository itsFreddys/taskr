import React from "react";
import { View, StyleSheet } from "react-native";
import { CalendarHeader } from "@/components/day-calendar/CalendarHeader";
import { CalendarStrip } from "@/components/day-calendar/CalendarStrip";
import { useTheme } from "react-native-paper";

interface DailyCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  today: Date;
  jumpToToday: () => void;
  onSearchToggle: () => void;
  searchActive: boolean;
  flatListRef: any;
  itemWidth: number;
  todayPulseAnim: any;
}

export const DailyCalendar = ({
  selectedDate,
  setSelectedDate,
  today,
  jumpToToday,
  onSearchToggle,
  searchActive,
  flatListRef,
  itemWidth,
  todayPulseAnim,
}: DailyCalendarProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      {/* 1. The Header (Title & Buttons) */}
      <CalendarHeader
        selectedDate={selectedDate}
        today={today}
        jumpToToday={jumpToToday}
        onSearchToggle={onSearchToggle}
        searchActive={searchActive}
      />

      {/* 2. The Horizontal Date Strip */}
      <View style={styles.stripWrapper}>
        <CalendarStrip
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          flatListRef={flatListRef}
          itemWidth={itemWidth}
          todayPulseAnim={todayPulseAnim}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      backgroundColor: theme.colors.background,
      // borderBottomColor: theme.colors.surface,
      // borderBottomWidth: 2,
    },
    stripWrapper: {
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.surface,
    },
  });
