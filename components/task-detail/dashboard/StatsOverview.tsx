import React from "react";
import { View, StyleSheet } from "react-native";
import { StatCard } from "../shared/StatCard";
import { useTheme } from "react-native-paper";

interface StatsOverviewProps {
  currentStreak: number;
  totalCompletions: number;
  bestStreak: number;
}

export const StatsOverview = ({
  currentStreak,
  totalCompletions,
  bestStreak,
}: StatsOverviewProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.statsRow}>
      <StatCard
        label="Streak"
        value={currentStreak}
        icon="fire"
        color="#FF9800"
      />
      <StatCard
        label="Total"
        value={totalCompletions}
        icon="check-all"
        color="#4CAF50"
      />
      <StatCard label="Best" value={bestStreak} icon="trophy" color="#FFD700" />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 10,
    },
  });
