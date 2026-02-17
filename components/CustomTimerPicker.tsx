import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, Modal } from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";

interface CustomTimerPickerProps {
  visible: boolean;
  onConfirm: (totalSeconds: number) => void;
  onClose: () => void;
}

export const CustomTimerPicker = ({
  visible,
  onConfirm,
  onClose,
}: CustomTimerPickerProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  // Using a Date object to track duration (e.g., 00:01:30 for 1min 30sec)
  const [date, setDate] = useState(new Date(0, 0, 0, 0, 0, 0));

  const handleConfirm = () => {
    // 1. Safety check: Ensure date is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date object in picker");
      return;
    }

    // 2. Calculate total seconds
    // Note: In 'countdown' mode on iOS, the hours/mins/secs are stored
    // in the time portion of the date object.
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // 3. ⚠️ IMPORTANT: Prevent adding a "0:00" timer
    if (totalSeconds <= 0) {
      onClose(); // Or show an error
      return;
    }

    // 4. Force to Integer just in case
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(Math.floor(totalSeconds));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide" // 🟢 This creates the slide-in effect
      transparent={true} // 🟢 Allows us to see the main screen behind the dim
      onRequestClose={onClose}
    >
      {/* 🟢 Backdrop: Tapping the dimmed area closes the picker */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* 🟢 The Content: We stop propagation so clicking the picker doesn't close it */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Surface style={styles.sheet} elevation={5}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="countdown"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      Haptics.selectionAsync();
                      setDate(selectedDate);
                    }
                  }}
                  style={styles.picker}
                  textColor={theme.colors.onSurface}
                />
              </View>

              <View style={styles.buttonRow}>
                <Button mode="text" onPress={onClose} style={styles.flexBtn}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={styles.flexBtn}
                >
                  Set Timer
                </Button>
              </View>
            </Surface>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)", // Dims the background
      justifyContent: "flex-end", // Anchors the content to the bottom
    },
    modalContainer: {
      width: "100%",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 20,
      paddingBottom: 40, // Extra padding for the bottom "safe area"
    },
    pickerContainer: { height: 200, justifyContent: "center" },
    picker: { height: "100%", width: "100%" },
    buttonRow: { flexDirection: "row", gap: 12, marginTop: 20 },
    flexBtn: { flex: 1 },
  });
