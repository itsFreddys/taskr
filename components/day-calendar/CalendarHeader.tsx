import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { format, isSameDay } from "date-fns";

export const CalendarHeader = ({
  selectedDate,
  today,
  jumpToToday,
  onSearchToggle,
  searchActive,
}: any) => {
  const theme = useTheme();

  return (
    <View style={styles.calendarHeader}>
      <View>
        <Text style={styles.currentMonthDisplay}>
          {isSameDay(selectedDate, today)
            ? "Today"
            : format(selectedDate, "eeee, MMM do")}
        </Text>
      </View>
      <View style={styles.calendarHeaderButtons}>
        <IconButton
          icon="calendar-today"
          onPress={jumpToToday}
          containerColor={theme.colors.surfaceVariant}
        />
        <IconButton
          icon={searchActive ? "magnify-minus" : "magnify"}
          onPress={onSearchToggle}
          containerColor={theme.colors.surfaceVariant}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  calendarHeaderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentMonthDisplay: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
