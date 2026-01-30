import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

interface TaskActiveProps {
  onSelect: (activeButton: string) => void;
}

export const TaskActiveButtons = ({ onSelect }: TaskActiveProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [focusedTaskButton, setFocusedTaskButton] = useState<
    "all" | "active" | "completed"
  >("all");

  return (
    <View style={styles.taskButtons}>
      <Button
        style={styles.taskButton}
        labelStyle={styles.taskButtonLabel}
        mode={focusedTaskButton === "all" ? "contained-tonal" : "elevated"}
        onPress={() => {
          setFocusedTaskButton("all");
          onSelect(focusedTaskButton);
        }}
      >
        All
      </Button>
      <Button
        style={styles.taskButton}
        labelStyle={styles.taskButtonLabel}
        mode={focusedTaskButton === "active" ? "contained-tonal" : "elevated"}
        onPress={() => {
          setFocusedTaskButton("active");
          onSelect(focusedTaskButton);
        }}
      >
        Active
      </Button>
      <Button
        style={styles.taskButton}
        labelStyle={styles.taskButtonLabel}
        mode={
          focusedTaskButton === "completed" ? "contained-tonal" : "elevated"
        }
        onPress={() => {
          setFocusedTaskButton("completed");
          onSelect(focusedTaskButton);
        }}
      >
        Completed
      </Button>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: 10,
      marginTop: 10,
      width: "100%",
    },
    taskButtons: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    taskButton: {
      marginRight: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    taskButtonLabel: {
      fontSize: 12,
      paddingVertical: 0,
      // paddingHorizontal: 4,
      fontWeight: "bold",
    },
  });
