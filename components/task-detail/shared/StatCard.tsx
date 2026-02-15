import React from "react";
import { StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export const StatCard = ({ label, value, icon, color }: StatCardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.statCard} elevation={1}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text variant="titleLarge" style={styles.statValue}>
        {value || "0"}
      </Text>
      <Text variant="labelSmall" style={styles.statLabel}>
        {label}
      </Text>
    </Surface>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    statCard: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 20,
      paddingHorizontal: 8,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      minHeight: 100,
    },
    statValue: {
      fontWeight: "bold",
      marginTop: 4,
      color: theme.colors.onSurface,
    },
    statLabel: {
      opacity: 0.6,
      textAlign: "center",
      fontSize: 11,
      marginTop: 2,
    },
  });
