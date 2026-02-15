import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";

interface HeroHeaderProps {
  emoji: string;
  title: string;
  category: string;
}

export const HeroHeader = ({ emoji, title, category }: HeroHeaderProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.heroContent}>
      <Surface style={styles.emojiContainer} elevation={1}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </Surface>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.categoryText}>
        {category}
      </Text>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    heroContent: {
      alignItems: "center",
      marginBottom: 30,
      marginTop: 10,
    },
    emojiContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    emojiText: { fontSize: 40 },
    title: { fontWeight: "bold", textAlign: "center" },
    categoryText: { opacity: 0.6, marginTop: 4 },
  });
