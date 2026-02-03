import { CustomEmojiPicker } from "@/components/CustomEmojiPicker";
import { CustomTimerPicker } from "@/components/CustomTimerPicker";
import { DATABASE_ID, databases, TASKS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";
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
  TextInput as PaperTextInput,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

// 🟢 Internal Imports
import { EmoteSelectorSection } from "@/components/task-form/EmoteSelectorSection";
import { ScheduleSection } from "@/components/task-form/ScheduleSection";
import { TimerManagementSection } from "@/components/task-form/TimerManagementSection";

interface CreateTaskProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export const CreateTask = ({
  visible,
  onClose,
  selectedDate,
}: CreateTaskProps) => {
  const { user } = useAuth();
  const theme = useTheme();
  const styles: any = createStyles(theme);

  // --- State Management ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emojiPic, setEmojiPic] = useState("✅");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [isAllDay, setIsAllDay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time States
  const [startHour, setStartHour] = useState("10");
  const [startMin, setStartMin] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHour, setEndHour] = useState("11");
  const [endMin, setEndMin] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  // Timer States
  const [timers, setTimers] = useState<number[]>([]);
  const [defaultTimer, setDefaultTimer] = useState<number | null>(null);
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [timerOptions, setTimerOptions] = useState<number[]>([
    30, // 0:30
    60, // 1:00
    300, // 5:00
    600, // 10:00
    1500, // 25:00
    1800, // 30:00
    2700, // 45:00
    3600, // 1:00:00
  ]);

  const handleAddCustomTimer = (seconds: number) => {
    // Add to options if it's a new unique time
    if (!timerOptions.includes(seconds)) {
      setTimerOptions((prev) => [seconds, ...prev]);
    }

    // Auto-select it
    toggleTimer(seconds);
    setIsCustomTimer(false);
  };

  // --- Logic Helpers ---
  const toggleTimer = (time: number) => {
    // Changed from string to number
    setTimers((prev) => {
      const isSelected = prev.includes(time);
      if (!isSelected && prev.length >= 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return prev;
      }
      const next = isSelected
        ? prev.filter((t) => t !== time)
        : [...prev, time];

      // Logic for Default/Primary Timer
      if (next.length === 1) setDefaultTimer(next[0]);
      else if (isSelected && defaultTimer === time)
        setDefaultTimer(next.length > 0 ? next[0] : null);

      return next;
    });
  };

  const handleCreate = async () => {
    if (!user || !title) return;
    setError(null); // Clear previous errors

    try {
      // 1. Helper for the Schedule (Strings: "HH:mm")
      const formatTo24h = (h: string, m: string, ap: string) => {
        let hrs = parseInt(h);
        if (ap === "PM" && hrs !== 12) hrs += 12;
        if (ap === "AM" && hrs === 12) hrs = 0;
        return `${hrs.toString().padStart(2, "0")}:${m}`;
      };

      // 2. Prepare the Payload
      const payload = {
        title,
        description,
        creatorId: user.$id,
        emotePic: emojiPic,
        type: isRecurring ? "recurring" : "one-time",
        // Appwrite usually expects string arrays for daysOfWeek
        daysOfWeek: isRecurring ? daysOfWeek : [],

        // 🟢 TIMERS: Ensure these are passed as numbers
        // If timers is [300, 600], Appwrite needs to see [300, 600]
        timers: timers,
        defaultTimer: defaultTimer, // This should be a number or null

        isAllDay,
        startTime: isAllDay
          ? null
          : formatTo24h(startHour, startMin, startAmPm),
        endTime: isAllDay ? null : formatTo24h(endHour, endMin, endAmPm),

        // Dates
        startDate: selectedDate.toISOString(),
        // If it's one-time, endDate is the same day. If recurring, usually null.
        endDate: isRecurring ? null : selectedDate.toISOString(),

        isCompleted: false,
        category: "task",
      };

      // 3. Appwrite Call
      await databases.createDocument(
        DATABASE_ID,
        TASKS_TABLE_ID,
        "unique()",
        payload
      );

      resetAndClose();
    } catch (err: any) {
      console.error("Appwrite Create Error:", err);
      setError(err.message);
    }
  };

  const resetAndClose = () => {
    setTitle("");
    setTimers([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Surface style={styles.modalContent} elevation={5}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <IconButton icon="close" onPress={onClose} />
            </View>

            <EmoteSelectorSection
              emoji={emojiPic}
              onPress={() => setEmojiPickerVisible(true)}
              theme={theme}
              styles={styles}
            />

            <PaperTextInput
              label="Task Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <ScheduleSection
              isAllDay={isAllDay}
              setIsAllDay={setIsAllDay}
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              daysOfWeek={daysOfWeek}
              setDaysOfWeek={setDaysOfWeek}
              scheduleProps={{
                start: {
                  hour: startHour,
                  minute: startMin,
                  ampm: startAmPm,
                  onTimeChange: (h: string, m: string, ap: string) => {
                    setStartHour(h);
                    setStartMin(m);
                    setStartAmPm(ap);
                  },
                },
                end: {
                  hour: endHour,
                  minute: endMin,
                  ampm: endAmPm,
                  onTimeChange: (h: string, m: string, ap: string) => {
                    setEndHour(h);
                    setEndMin(m);
                    setEndAmPm(ap);
                  },
                },
              }}
            />

            <TimerManagementSection
              timers={timers}
              toggleTimer={toggleTimer}
              timerOptions={timerOptions}
              defaultTimer={defaultTimer}
              setDefaultTimer={setDefaultTimer}
              isCustomTimer={isCustomTimer}
              setIsCustomTimer={setIsCustomTimer}
              handleAddCustomTimer={handleAddCustomTimer}
            />

            <PaperTextInput
              label="Notes (optional)"
              mode="outlined"
              multiline
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleCreate}
              disabled={!title}
              style={styles.createBtn}
            >
              Create Task
            </Button>

            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>
        </Surface>
      </View>

      <CustomEmojiPicker
        visible={emojiPickerVisible}
        currentEmote={emojiPic}
        onSelect={(e) => {
          setEmojiPic(e);
          setEmojiPickerVisible(false);
        }}
        onClose={() => setEmojiPickerVisible(false)}
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
    input: { marginBottom: 16 },
    createBtn: { marginTop: 20, marginBottom: 30, borderRadius: 12 },
    error: { color: theme.colors.error, textAlign: "center", marginTop: 10 },
  });
