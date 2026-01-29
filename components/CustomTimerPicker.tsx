import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";

interface CustomTimerPickerProps {
  onAdd: (totalSeconds: number) => void;
  onCancel: () => void;
}

export const CustomTimerPicker = ({ onAdd, onCancel }: CustomTimerPickerProps) => {
  const theme = useTheme();
  // Using a Date object to track duration (e.g., 00:01:30 for 1min 30sec)
  const [date, setDate] = useState(new Date(0, 0, 0, 0, 0, 0)); 

  const handleAdd = () => {
    // Calculate total seconds to save to Appwrite/State
    const totalSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    onAdd(totalSeconds);
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
      <View style={styles.pickerContainer}>
        <DateTimePicker
          value={date}
          mode="countdown" // 🟢 iOS Specific: Creates the duration wheels
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) setDate(selectedDate);
          }}
          style={styles.picker}
          textColor={theme.colors.onSurface}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button 
          mode="text" 
          onPress={onCancel} 
          textColor={theme.colors.error}
          style={styles.flexBtn}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleAdd}
          style={styles.flexBtn}
        >
          Add Timer
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 10,
    marginTop: 10,
    width: "100%",
  },
  pickerContainer: {
    height: 200,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: "100%",
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  flexBtn: {
    flex: 1,
  },
});