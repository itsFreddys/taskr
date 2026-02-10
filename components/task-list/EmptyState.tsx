import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const EmptyState = ({ searchQuery, activeButton }: any) => {
  const theme = useTheme();

  const iconName = searchQuery
    ? "magnify-close"
    : activeButton === "completed"
    ? "check-all"
    : "clipboard-text-outline";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={48}
        color={theme.colors.outlineVariant}
      />
      <Text style={styles.text}>
        {searchQuery ? `No results for "${searchQuery}"` : "No tasks found."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  text: { color: "#aaa", marginTop: 12 },
});
