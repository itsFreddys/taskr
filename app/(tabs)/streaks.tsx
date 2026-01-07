import { addDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 6; // 6 items visible at a time

// ... (imports remain the same)

export default function Streakscreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const flatListRef = useRef<FlatList>(null);
  const today = startOfDay(new Date());

  // 1. Generate Dates with Month Dividers
  const calendarData = useMemo(() => {
    const data = [];
    for (let i = -14; i <= 30; i++) {
      const d = addDays(today, i);
      if (i === -14 || d.getDate() === 1) {
        data.push({
          type: "month",
          label: format(d, "MMMM"),
          id: `month-${i}`,
          date: undefined, // Explicitly undefined for month types
        });
      }
      data.push({ type: "date", date: d, id: d.toISOString() });
    }
    return data;
  }, []);

  // 2. Find "Today" index - Added type check to satisfy TypeScript
  const todayIndex = calendarData.findIndex(
    (item) => item.type === "date" && item.date && isSameDay(item.date, today)
  );

  const jumpToToday = () => {
    setSelectedDate(today);
    flatListRef.current?.scrollToIndex({
      index: todayIndex,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const renderItem = ({ item }: any) => {
    if (item.type === "month") {
      return (
        <View style={styles.monthDivider}>
          <View style={styles.verticalLine} />
          <Text style={styles.monthLabel}>{item.label}</Text>
        </View>
      );
    }

    // Inside renderItem, these are local variables
    const isSelected = isSameDay(item.date, selectedDate);
    const isItemToday = isSameDay(item.date, today);
    const isPast = isBefore(item.date, today);

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.date)}
        activeOpacity={0.8}
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

          {/* Today's Permanent Marker */}
          {isItemToday && !isSelected && <View style={styles.todayIndicator} />}
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <View>
          <Text style={styles.currentMonthDisplay}>
            {format(selectedDate, "MMMM yyyy")}
          </Text>
        </View>
        <IconButton
          icon="calendar-today"
          onPress={jumpToToday}
          containerColor="#ede7f6"
        />
      </View>

      <View style={styles.calendarStrip}>
        <FlatList
          ref={flatListRef}
          data={calendarData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          initialScrollIndex={todayIndex}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH + 8, // Added margin (4+4) to calculation
            offset: (ITEM_WIDTH + 8) * index,
            index,
          })}
        />
      </View>

      {/* Tasks List */}
      <View style={styles.taskList}>
        <Text style={styles.listTitle}>
          {/* ✅ FIXED: Use isSameDay(selectedDate, today) instead of the missing variable */}
          {isSameDay(selectedDate, today)
            ? "Today"
            : format(selectedDate, "eeee, MMM do")}
        </Text>
        <View style={styles.emptyCard}>
          <Text style={{ color: "#aaa" }}>
            No habits tracked for this date.
          </Text>
        </View>
      </View>
    </View>
  );
}

// ... (styles remain the same)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  currentMonthDisplay: { fontSize: 18, fontWeight: "bold", color: "#22223b" },
  calendarStrip: {
    // paddingVertical: 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateCard: {
    width: ITEM_WIDTH,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },
  selectedCard: { backgroundColor: "#7c4dff" },
  whiteText: { color: "#fff" },
  dayText: { fontSize: 11, color: "#999", textTransform: "uppercase" },
  dateText: { fontSize: 18, fontWeight: "bold" },
  todayIndicator: {
    position: "absolute",
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7c4dff",
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
    backgroundColor: "#e0e0e0",
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#7c4dff",
    transform: [{ rotate: "-90deg" }], // Vertical Month Text
  },
  taskList: { flex: 1, padding: 20 },
  listTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  emptyCard: {
    flex: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
