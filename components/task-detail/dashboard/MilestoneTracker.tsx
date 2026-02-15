import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar, useTheme } from "react-native-paper";

interface MilestoneTrackerProps {
  currentStreak: number;
  nextMilestoneGoal: number;
}

export const MilestoneTracker = ({
  currentStreak,
  nextMilestoneGoal,
}: MilestoneTrackerProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const progress = currentStreak / nextMilestoneGoal;

  return (
    <View style={styles.milestoneSection}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Next Milestone
      </Text>

      <View style={styles.milestoneSecondHeader}>
        <Text variant="bodyMedium" style={styles.milestoneSubtitle}>
          {`${
            nextMilestoneGoal - currentStreak
          } days until a ${nextMilestoneGoal}-day streak!`}
        </Text>
        <Text variant="labelLarge" style={styles.milestonePercentage}>
          {`${Math.round(progress * 100)}%`}
        </Text>
      </View>

      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    milestoneSection: {
      marginTop: 25,
      width: "100%",
    },
    sectionTitle: { fontWeight: "bold" },
    milestoneSecondHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    milestonePercentage: { fontWeight: "bold", color: theme.colors.primary }, // You can pull this from theme
    milestoneSubtitle: { opacity: 0.7, marginBottom: 12 },
    progressBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.surfaceVariant,
    },
  });
