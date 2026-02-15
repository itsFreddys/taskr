import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { TimelineDot } from "./TimelineDot";

interface TimelineProps {
  history: boolean[]; // Array of 7 booleans
}

export const Timeline = ({ history }: TimelineProps) => {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Last 7 Days
      </Text>
      <View style={styles.row}>
        {history.map((done, index) => (
          <TimelineDot
            key={index}
            isDone={done}
            isToday={index === history.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 65, width: "100%" },
  title: { fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },
});
