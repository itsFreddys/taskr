import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { List, SegmentedButtons, Switch, useTheme } from "react-native-paper";
import { TimeSelector } from "../TimeSelector";

interface ScheduleSectionProps {
  isAllDay: boolean;
  setIsAllDay: (val: boolean) => void;
  isRecurring: boolean;
  setIsRecurring: (val: boolean) => void;
  daysOfWeek: string[];
  setDaysOfWeek: (val: string[] | ((prev: string[]) => string[])) => void;
  scheduleProps: {
    start: {
      hour: string;
      minute: string;
      ampm: string;
      onTimeChange: (h: string, m: string, ap: string) => void;
    };
    end: {
      hour: string;
      minute: string;
      ampm: string;
      onTimeChange: (h: string, m: string, ap: string) => void;
    };
  };
}

export const ScheduleSection = ({
  isAllDay,
  setIsAllDay,
  isRecurring,
  setIsRecurring,
  daysOfWeek,
  setDaysOfWeek,
  scheduleProps,
}: ScheduleSectionProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.extrasContainer}>
      <List.Accordion
        title="Schedule & Frequency"
        left={(props) => <List.Icon {...props} icon="calendar-sync" />}
        style={styles.accordion}
        contentStyle={styles.accordionContentStyle}
      >
        <View style={styles.accordionContent}>
          {/* 1. All Day Toggle */}
          <View style={styles.row}>
            <Text style={styles.label}>All Day</Text>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              trackColor={{
                false: theme.colors.surfaceVariant,
                true: theme.colors.primary,
              }}
            />
          </View>

          {/* 2. Time Pickers */}
          {!isAllDay && (
            <View style={styles.timePickerContainer}>
              <TimeSelector label="Start Time" {...scheduleProps.start} />
              <TimeSelector label="End Time" {...scheduleProps.end} />
            </View>
          )}

          {/* 3. Frequency Picker */}
          <View style={styles.row}>
            <Text style={styles.label}>Repeat</Text>
            <SegmentedButtons
              value={isRecurring ? "recurring" : "once"}
              onValueChange={(v) => {
                const recurring = v === "recurring";
                setIsRecurring(recurring);
                if (recurring) setDaysOfWeek(["1", "2", "3", "4", "5"]);
                else setDaysOfWeek([]);
              }}
              buttons={[
                { value: "once", label: "Once" },
                { value: "recurring", label: "Weekly" },
              ]}
              style={styles.segmented}
            />
          </View>

          {/* 4. Day Circles */}
          {isRecurring && (
            <View style={styles.dayRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                const val = i.toString();
                const isSelected = daysOfWeek.includes(val);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayCircle,
                      isSelected && styles.selectedCircle,
                    ]}
                    onPress={() => {
                      setDaysOfWeek((prev: string[]) =>
                        prev.includes(val)
                          ? prev.filter((d) => d !== val)
                          : [...prev, val]
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </List.Accordion>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    extrasContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
    },
    accordion: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    accordionContentStyle: {
      paddingLeft: 0,
    },
    accordionContent: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 16,
      marginTop: -8,
    },
    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: "400",
      color: theme.colors.onSurface,
    },
    timePickerContainer: {
      marginTop: 8,
    },
    segmented: {
      width: 180,
    },
    dayRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
      paddingHorizontal: 2,
      width: "100%",
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedCircle: {
      backgroundColor: theme.colors.primary,
    },
    dayText: {
      color: theme.colors.primary,
      fontWeight: "500",
    },
    selectedDayText: {
      color: "white", // Or theme.colors.onPrimary
    },
  });
