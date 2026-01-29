import { CustomEmojiPicker } from "@/components/CustomEmojiPicker";
import { CustomTimerPicker } from "@/components/CustomTimerPicker";
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite"; // Update with your actual task collection ID
import { useAuth } from "@/lib/auth-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  IconButton,
  List,
  TextInput as PaperTextInput,
  SegmentedButtons,
  Surface,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { TimeSelector } from "./TimeSelector";

interface CreateTaskProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date; // 🟢 Passed from your calendar
}

const formatSecondsToTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  return `${m}:${s < 10 ? "0" + s : s}`;
};

export const CreateTask = ({
  visible,
  onClose,
  selectedDate,
}: CreateTaskProps) => {
  const { user } = useAuth();
  const theme = useTheme();
  const styles = createStyles(theme);

  // --- Basic State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emojiPic, setEmojiPic] = useState("✅");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Logic State (Hidden by default) ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);

  // schedule logic
  const [startHour, setStartHour] = useState("10");
  const [startMin, setStartMin] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHour, setEndHour] = useState("11");
  const [endMin, setEndMin] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  // timers logic
  const [timers, setTimers] = useState<string[]>([]);
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [timerHour, setTimerHour] = useState("00");
  const [timerMin, setTimerMin] = useState("00");
  const [timerSec, setTimerSec] = useState("00");
  const [timerOptions, setTimerOptions] = useState<string[]>([
    "0:30",
    "1:00",
    "2:00",
    "5:00",
    "10:00",
    "15:00",
    "20:00",
    "30:00",
    "40:00",
    "50:00",
    "60:00",
  ]);

  const [isAllDay, setIsAllDay] = useState(true);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [duration, setDuration] = useState("30");

  const handleAddCustomTimer = (seconds: number) => {
    const formattedTime = formatSecondsToTime(seconds);

    // Add to the START of the options list
    setTimerOptions((prev) => [formattedTime, ...prev]);

    // Auto-select this specific time string
    setTimers((prev) => [...prev, formattedTime]);

    setIsCustomTimer(false); // Hide the picker
  };

  const handleCreate = async () => {
    if (!user || !title) return;
    setError(null);

    try {
      const payload = {
        title,
        description,
        creatorId: user.$id,
        emote_pic: emojiPic,
        type: isRecurring ? "recurring" : "one-time",
        frequency: isRecurring ? "weekly" : "once",
        daysOfWeek: isRecurring ? daysOfWeek : [],
        isAllDay,
        hasTimeLimit,
        duration: hasTimeLimit ? parseInt(duration) : null,
        startDate: selectedDate.toISOString(),
        isCompleted: false,
      };

      // Replace HABITS_TABLE_ID with your specific TASKS_COLLECTION_ID
      await databases.createDocument(
        DATABASE_ID,
        TASKS_TABLE_ID,
        "unique()",
        payload
      );
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating task");
    }
  };

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setEmojiPic("✅");
    setIsRecurring(false);
    setDaysOfWeek([]);
    setIsAllDay(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Surface style={styles.modalContent} elevation={5}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <IconButton icon="close" onPress={onClose} />
            </View>

            {/* Emoji & Title */}
            <View style={styles.center}>
              <TouchableOpacity onPress={() => setEmojiPickerVisible(true)}>
                <Text style={styles.emojiDisplay}>{emojiPic}</Text>
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color="#6c6c80"
                  style={styles.iconButton}
                />
              </TouchableOpacity>
            </View>

            <PaperTextInput
              label="What needs to be done?"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            {/* Progressive Disclosure: Schedule Toggle */}
            <View style={styles.extrasContainer}>
              <List.Accordion
                title="Schedule & Frequency"
                left={(props) => <List.Icon {...props} icon="calendar-sync" />}
                style={styles.accordion}
                contentStyle={styles.accordionContentStyle}
              >
                <View style={styles.accordionContent}>
                  <View style={styles.row}>
                    <Text style={{ fontSize: 16, fontWeight: "400" }}>
                      All Day
                    </Text>
                    <Switch
                      value={isAllDay}
                      onValueChange={setIsAllDay}
                      trackColor={{
                        false: theme.colors.surfaceVariant,
                        true: theme.colors.primary,
                      }}
                    />
                  </View>

                  {!isAllDay && (
                    <View style={{ marginTop: 8 }}>
                      <TimeSelector
                        label="Start Time"
                        hour={startHour}
                        minute={startMin}
                        ampm={startAmPm}
                        onTimeChange={(h, m, ap) => {
                          setStartHour(h);
                          setStartMin(m);
                          setStartAmPm(ap);
                        }}
                      />

                      <TimeSelector
                        label="End Time"
                        hour={endHour}
                        minute={endMin}
                        ampm={endAmPm}
                        onTimeChange={(h, m, ap) => {
                          setEndHour(h);
                          setEndMin(m);
                          setEndAmPm(ap);
                        }}
                      />
                    </View>
                  )}
                  {/* Frequency */}
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Repeat</Text>
                    <SegmentedButtons
                      value={isRecurring ? "recurring" : "once"}
                      onValueChange={(v) => {
                        const recurring = v === "recurring";
                        setIsRecurring(recurring);

                        if (recurring) {
                          // 🟢 Default to Mon, Tue, Wed, Thu, Fri when "Weekly" is selected
                          setDaysOfWeek(["1", "2", "3", "4", "5"]);
                        } else {
                          // 🟢 Clear days when switching back to "Once"
                          // (This ensures one-time tasks don't carry hidden recurring data)
                          setDaysOfWeek([]);
                        }
                      }}
                      buttons={[
                        { value: "once", label: "Once" },
                        { value: "recurring", label: "Weekly" },
                      ]}
                      style={styles.segmented}
                    />
                  </View>

                  {isRecurring && (
                    <View style={styles.dayRow}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                        const isSelected = daysOfWeek.includes(i.toString());
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[
                              styles.dayCircle,
                              isSelected && styles.selectedCircle,
                            ]}
                            onPress={() => {
                              const val = i.toString();
                              setDaysOfWeek((prev) =>
                                prev.includes(val)
                                  ? prev.filter((d) => d !== val)
                                  : [...prev, val]
                              );
                            }}
                          >
                            <Text
                              style={{
                                color: isSelected
                                  ? "white"
                                  : theme.colors.primary,
                                fontWeight: "500",
                              }}
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

            <View style={styles.extrasContainer}>
              <List.Accordion
                title="Timers"
                left={(props) => <List.Icon {...props} icon="timer" />}
                style={styles.accordion}
                contentStyle={styles.accordionContentStyle}
              >
                <View style={styles.accordionContent}>
                  {/* Timers */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timerScrollContainer}
                  >
                    {/* <View style={styles.timerRow}> */}
                    {timerOptions.map((time, i) => {
                      const isSelected = timers.includes(time);
                      return (
                        <TouchableOpacity
                          key={`${time}-${i}`}
                          style={[
                            styles.timersCircle,
                            isSelected && styles.selectedTimersSelected,
                          ]}
                          onPress={() => {
                            setTimers((prev) =>
                              prev.includes(time)
                                ? prev.filter((t) => t !== time)
                                : [...prev, time]
                            );
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? "white"
                                : theme.colors.primary,
                              fontWeight: "500",
                            }}
                          >
                            {time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {/* </View> */}
                  </ScrollView>

                  {/* 🟢 Trigger for Custom Timer */}
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
                        style={[
                          styles.timeText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {/* Show placeholder or current selection if you want */}
                        Set Custom
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 🟢 Conditional Picker (Slides open like TimeSelector) */}
                  {isCustomTimer && (
                    <CustomTimerPicker
                      onCancel={() => setIsCustomTimer(false)}
                      onAdd={handleAddCustomTimer}
                    />
                  )}
                </View>
              </List.Accordion>
            </View>

            <PaperTextInput
              label="Description (Optional)"
              mode="outlined"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            {/* Progressive Disclosure: Time Blocking */}

            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleCreate}
                disabled={!title}
                style={styles.createBtn}
              >
                Create Task
              </Button>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>
        </Surface>
      </View>

      <CustomEmojiPicker
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelect={setEmojiPic}
      />
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      marginTop: 60,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: { fontSize: 24, fontWeight: "bold" },
    center: { alignItems: "center", marginBottom: 20 },
    emojiDisplay: { fontSize: 72 },
    iconButton: {
      padding: 0,
      position: "absolute",
      bottom: 2,
      right: -25,
    },
    input: { marginBottom: 16 },
    extrasContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      // borderWidth: 1,
      // borderColor: theme.colors.outlineVariant,
    },
    accordion: {
      backgroundColor: theme.colors.surface,
      // paddingHorizontal: 8,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    accordionContentStyle: {
      paddingLeft: 0, // 🔑 removes Material list indent
    },
    accordionContent: {
      paddingRight: 16,
      paddingLeft: 16,
      paddingBottom: 16,
      marginTop: -8,
      // alignItems: "center",
    },
    timerShowcase: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      // borderWidth: 1,
      // borderColor: theme.colors.outlineVariant,
    },
    // Inside createStyles
    trigger: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      minWidth: 110,
      alignItems: "center",
    },
    timeText: {
      fontSize: 16,
      fontWeight: "700",
    },
    segButton: { marginVertical: 12, alignSelf: "center" },
    allDayListItem: {
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: -8, // 🟢 Counter-align with the "Schedule & Frequency" title
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
    selectedCircle: { backgroundColor: theme.colors.primary },
    footer: { marginTop: 24, marginBottom: 40 },
    createBtn: { borderRadius: 12, paddingVertical: 4 },
    error: { color: theme.colors.error, textAlign: "center", marginTop: 8 },
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
    },
    timerScrollContainer: {
      flexDirection: "row",
      paddingVertical: 10,
      alignItems: "center",
      // paddingRight: 20, // 🟢 Extra padding at the end of the scroll
    },
    timerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      paddingHorizontal: 2,
      width: "100%",
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
    selectedTimersSelected: {
      backgroundColor: theme.colors.primary,
    },

    helperText: {
      fontSize: 13,
      opacity: 0.6,
      marginTop: 4,
    },
    segmented: {
      width: 180,
    },
  });
