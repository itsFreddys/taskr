import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton, Surface, useTheme } from "react-native-paper";

interface TimeAdjustersProps {
  onAdjust: (minutes: number) => void;
  onSelectPreset: (minutes: number) => void;
  presets: number[];
}

export const TimeAdjusters = ({
  onAdjust,
  onSelectPreset,
  presets,
}: TimeAdjustersProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.dialAdjustmentRow}>
      <IconButton
        icon="minus-circle-outline"
        size={32}
        onPress={() => onAdjust(-1)} // Decrease by 1 min
      />

      <View style={styles.presetChips}>
        {presets.map((minutes) => (
          <Surface key={minutes} style={styles.chip} elevation={1}>
            <Text
              variant="labelSmall"
              onPress={() => onSelectPreset(minutes * 60)}
            >
              {minutes}m
            </Text>
          </Surface>
        ))}
      </View>

      <IconButton
        icon="plus-circle-outline"
        size={32}
        onPress={() => onAdjust(1)} // Increase by 1 min
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    dialAdjustmentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30,
      width: "100%",
    },
    presetChips: {
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 10,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
  });
