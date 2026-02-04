import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, useTheme } from "react-native-paper";

interface TaskActiveProps {
  selected: string;
  onSelect: (value: string) => void;
}

export const TaskActiveButtons = ({ selected, onSelect }: TaskActiveProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const filters = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isSelected = selected === filter.value;
        return (
          <Chip
            key={filter.value}
            selected={isSelected}
            onPress={() => onSelect(filter.value)}
            mode="flat" // 🟢 Flat looks more modern in a scrollable list
            showSelectedOverlay
            style={[
              styles.chip,
              isSelected && { backgroundColor: theme.colors.primaryContainer },
            ]}
            textStyle={[
              styles.chipText,
              isSelected && {
                color: theme.colors.onPrimaryContainer,
                fontWeight: "700",
              },
            ]}
            compact
          >
            {filter.label}
          </Chip>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    chip: {
      marginRight: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 0, // 🟢 Removes border for a cleaner "pill" look
    },
    chipText: {
      fontSize: 13,
    },
  });
