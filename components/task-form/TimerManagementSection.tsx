import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { List, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomTimerPicker } from "@/components/CustomTimerPicker";

const formatSecondsToTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Format as H:MM:SS if hours exist, otherwise M:SS
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
};

interface TimerManagementProps {
  timers: number[]; // 🟢 Changed to number array
  toggleTimer: (time: number) => void;
  timerOptions: number[]; // 🟢 Changed to number array
  defaultTimer: number | null;
  setDefaultTimer: (time: number) => void;
  isCustomTimer: boolean;
  setIsCustomTimer: (val: boolean) => void;
  handleAddCustomTimer: (seconds: number) => void;
}

export const TimerManagementSection = ({
  timers,
  toggleTimer,
  timerOptions,
  defaultTimer,
  setDefaultTimer,
  isCustomTimer,
  setIsCustomTimer,
  handleAddCustomTimer,
}: TimerManagementProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.extrasContainer}>
      <List.Accordion
        title="Timers"
        left={(props) => <List.Icon {...props} icon="timer" />}
        style={styles.accordion}
        contentStyle={styles.accordionContentStyle}
      >
        <View
          style={[
            styles.accordionContent,
            isCustomTimer && { paddingBottom: 40 },
          ]}
        >
          {isCustomTimer && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsCustomTimer(false)}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* 1. Selected Chips */}
          {timers.length > 0 && (
            <View style={styles.chipsContainer}>
              <Text style={styles.helperText}>
                Selected Timers ({timers.length}/3)
              </Text>
              <View style={styles.chipsRow}>
                {timers.map((seconds) => (
                  <TouchableOpacity
                    key={`chip-${seconds}`}
                    style={styles.chip}
                    onPress={() => toggleTimer(seconds)}
                  >
                    <Text style={styles.chipText}>
                      {formatSecondsToTime(seconds)}
                    </Text>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={14}
                      color="white"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 2. Primary Selector */}
          {timers.length > 0 && (
            <View style={styles.defaultSection}>
              <Text style={styles.rowLabel}>Primary Timer</Text>
              <View style={styles.defaultPills}>
                {timers.map((seconds) => (
                  <TouchableOpacity
                    key={`def-${seconds}`}
                    style={[
                      styles.defaultPill,
                      defaultTimer === seconds && styles.defaultPillActive,
                    ]}
                    onPress={() => setDefaultTimer(seconds)}
                  >
                    <Text
                      style={[
                        styles.defaultText,
                        defaultTimer === seconds && styles.whiteText,
                      ]}
                    >
                      {formatSecondsToTime(seconds)}
                    </Text>
                    {defaultTimer === seconds && (
                      <MaterialCommunityIcons
                        name="star"
                        size={12}
                        color="white"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 3. The Selector */}
          {timers.length < 3 ? (
            <View>
              <Text style={styles.helperText}>Add Timers</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timerScrollContainer}
              >
                {timerOptions.map((seconds, i) => {
                  const isSelected = timers.includes(seconds);
                  return (
                    <TouchableOpacity
                      key={`${seconds}-${i}`}
                      style={[
                        styles.timersCircle,
                        isSelected && styles.selectedTimersSelected,
                      ]}
                      onPress={() => toggleTimer(seconds)}
                    >
                      <Text
                        style={{
                          color: isSelected ? "white" : theme.colors.primary,
                          fontWeight: "500",
                        }}
                      >
                        {formatSecondsToTime(seconds)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Custom Timer</Text>
                <TouchableOpacity
                  style={[
                    styles.trigger,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                  onPress={() => setIsCustomTimer(!isCustomTimer)}
                >
                  <Text
                    style={[styles.timeText, { color: theme.colors.primary }]}
                  >
                    {isCustomTimer ? "Close" : "Set Custom"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isCustomTimer && (
                <View style={styles.liftedPicker}>
                  {/* Transparent layer inside the accordion content to catch clicks */}
                  <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={() => setIsCustomTimer(false)}
                  />
                  <CustomTimerPicker
                    onCancel={() => setIsCustomTimer(false)}
                    onAdd={handleAddCustomTimer}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.limitMessage}>
              <Text style={styles.helperText}>
                Limit reached. Remove a timer to add more.
              </Text>
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
    accordionContentStyle: { paddingLeft: 0 },
    accordionContent: {
      paddingRight: 16,
      paddingLeft: 16,
      paddingBottom: 16,
      marginTop: -8,
    },

    // 🟢 The "Lift"
    liftedPicker: {
      marginTop: -10, // Pulls it closer to the custom timer row
      paddingBottom: 10,
    },

    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    rowLabel: {
      fontSize: 16,
      fontWeight: "400",
      color: theme.colors.onSurface,
    },
    timerScrollContainer: {
      flexDirection: "row",
      paddingVertical: 10,
      alignItems: "center",
    },
    timersCircle: {
      width: 75,
      height: 38,
      marginRight: 10,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedTimersSelected: { backgroundColor: theme.colors.primary },
    trigger: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      minWidth: 110,
      alignItems: "center",
    },
    timeText: { fontSize: 16, fontWeight: "700" },
    helperText: {
      fontSize: 13,
      opacity: 0.6,
      marginTop: 4,
      color: theme.colors.onSurface,
    },
    chipsContainer: { marginBottom: 12 },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.primary,
    },
    chipText: { color: "white", fontWeight: "bold", fontSize: 13 },
    defaultSection: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surfaceVariant,
    },
    defaultPills: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
    defaultPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    defaultPillActive: { backgroundColor: theme.colors.primary },
    defaultText: { fontSize: 13, color: theme.colors.onSurfaceVariant },
    whiteText: { color: "white", fontWeight: "bold" },
    limitMessage: { paddingVertical: 16, alignItems: "center" },
  });
