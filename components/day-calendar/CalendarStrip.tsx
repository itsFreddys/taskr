import React, { useMemo } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { format, isSameDay, isBefore, addDays, startOfDay } from "date-fns";

export const CalendarStrip = ({
  selectedDate,
  setSelectedDate,
  flatListRef,
  itemWidth,
  todayPulseAnim,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme, itemWidth);
  const today = startOfDay(new Date());

  // Generate 45 days of calendar data with Month Dividers
  const calendarData = useMemo(() => {
    const data = [];
    for (let i = -14; i <= 30; i++) {
      const d = addDays(today, i);
      if (i === -14 || d.getDate() === 1) {
        data.push({
          type: "month",
          label: format(d, "MMMM"),
          id: `month-${i}`,
          date: null,
        });
      }
      data.push({ type: "date", date: d, id: d.toISOString() });
    }
    return data;
  }, [today]);

  const todayIndex = calendarData.findIndex(
    (item) => item.type === "date" && item.date && isSameDay(item.date, today)
  );

  const renderItem = ({ item }: any) => {
    if (item.type === "month") {
      return (
        <View style={styles.monthDivider}>
          <View style={styles.verticalLine} />
          <Text style={styles.monthLabel}>{item.label}</Text>
        </View>
      );
    }

    const isSelected = isSameDay(item.date, selectedDate);
    const isItemToday = isSameDay(item.date, today);
    const isPast = isBefore(item.date, today);

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={
            isItemToday ? { transform: [{ scale: todayPulseAnim }] } : null
          }
        >
          <Surface
            style={[
              styles.dateCard,
              isSelected && styles.selectedCard,
              isPast && !isSelected && { opacity: 0.4 },
            ]}
            elevation={isSelected ? 4 : 0}
          >
            <Text style={[styles.dayText, isSelected && styles.whiteText]}>
              {format(item.date, "EEE")}
            </Text>
            <Text style={[styles.dateText, isSelected && styles.whiteText]}>
              {format(item.date, "d")}
            </Text>
            {isItemToday && !isSelected && (
              <View style={styles.todayIndicator} />
            )}
          </Surface>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={calendarData}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      initialScrollIndex={todayIndex}
      initialNumToRender={20}
      getItemLayout={(_, index) => ({
        length: itemWidth + 8,
        offset:
          (itemWidth + 8) * index -
          Dimensions.get("window").width / 2 +
          (itemWidth + 8) / 2,
        index,
      })}
      snapToAlignment="center" // 🟢 Snaps to the middle
      snapToInterval={itemWidth + 8} // 🟢 Distance between snaps (card + margins)
      decelerationRate="fast"
    />
  );
};

const createStyles = (theme: any, ITEM_WIDTH: number) =>
  StyleSheet.create({
    dateCard: {
      width: ITEM_WIDTH - 5,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      marginHorizontal: 4,
      backgroundColor: theme.colors.surface,
    },
    selectedCard: { backgroundColor: theme.colors.primary },
    whiteText: { color: theme.colors.onSurface },
    dayText: {
      fontSize: 11,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    dateText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    todayIndicator: {
      position: "absolute",
      bottom: 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    monthDivider: {
      width: ITEM_WIDTH,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    verticalLine: {
      position: "absolute",
      left: 0,
      height: "60%",
      width: 1,
      backgroundColor: theme.colors.primary,
    },
    monthLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: theme.colors.primary,
      transform: [{ rotate: "0deg" }],
    },
  });
