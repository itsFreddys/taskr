import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface TimeSelectorProps {
  label: string;
  hour: string;
  minute: string;
  ampm: string;
  onTimeChange: (h: string, m: string, ap: string) => void;
}

export const TimeSelector = ({
  label,
  hour,
  minute,
  ampm,
  onTimeChange,
}: TimeSelectorProps) => {
  const [show, setShow] = useState(false);
  const theme = useTheme();
  const styles = createdStyles(theme);

  // Create a Date object for the picker based on current state
  const getPickerDate = () => {
    const d = new Date();
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    d.setHours(h, parseInt(minute));
    return d;
  };

  const onChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes immediately. On iOS, it stays open.
    if (Platform.OS === "android") setShow(false);

    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();

      const newAmPm = hours >= 12 ? "PM" : "AM";
      const displayHour = (hours % 12 || 12).toString();
      const displayMin = minutes < 10 ? `0${minutes}` : minutes.toString();

      onTimeChange(displayHour, displayMin, newAmPm);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.trigger,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          onPress={() => setShow(!show)}
        >
          <Text style={[styles.timeText, { color: theme.colors.primary }]}>
            {hour}:{minute} {ampm}
          </Text>
        </TouchableOpacity>
      </View>

      {show && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={getPickerDate()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"} // 🟢 This creates the 'Dial'
            onChange={onChange}
            textColor={theme.colors.onSurface}
            style={styles.iosPicker}
          />
        </View>
      )}
    </View>
  );
};

const createdStyles = (theme: any) =>
  StyleSheet.create({
    container: { width: "100%" },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    label: { fontSize: 16, fontWeight: "500" },
    trigger: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      minWidth: 110,
      alignItems: "center",
    },
    timeText: { fontSize: 17, fontWeight: "700" },
    iosPicker: {
      height: 200, // 🟢 Compact dial height
      width: "100%",
      display: "flex",
    },
    pickerWrapper: {
      backgroundColor: theme.colors.surface, // 🟢 Ensure it has a background
      marginTop: 10,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      zIndex: 99, // 🟢 Force it to the front
    },
  });
