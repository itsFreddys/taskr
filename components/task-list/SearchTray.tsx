import React from "react";
import { Animated, ScrollView, View, StyleSheet } from "react-native";
import { Text, IconButton, List, useTheme } from "react-native-paper";
import { SearchItem } from "./SearchItem";

interface SearchTrayProps {
  // History State
  history: string[];
  historyAnim: Animated.Value;
  onRemoveHistory: (term: string) => void;
  onSelectHistory: (term: string) => void;

  // Global Results State
  globalMatches: any[];
  globalTrayAnim: Animated.Value;
  onQuickAdd: (id: string) => void;
  onEditTask: (task: any) => void;
}

export const SearchTray = ({
  history,
  historyAnim,
  onRemoveHistory,
  onSelectHistory,
  globalMatches,
  globalTrayAnim,
  onQuickAdd,
  onEditTask,
}: SearchTrayProps) => {
  const theme = useTheme();

  const historyOpacity = historyAnim.interpolate({
    inputRange: [0, 20], // Fades in quickly over the first 20 pixels
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const globalOpacity = globalTrayAnim.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <>
      {/* 1. History Tray */}
      <Animated.View
        style={{
          height: historyAnim,
          opacity: historyOpacity,
          overflow: "hidden",
        }}
      >
        <View style={styles.trayDivider} />
        <ScrollView keyboardShouldPersistTaps="handled">
          {history.map((term, index) => (
            <View key={`history-${index}`}>
              {index > 0 && <View style={styles.itemSeparator} />}
              <List.Item
                style={styles.trayItem}
                title={term}
                titleStyle={{ fontSize: 14 }}
                left={(props) => <List.Icon {...props} icon="history" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    size={16}
                    onPress={() => onRemoveHistory(term)}
                  />
                )}
                onPress={() => onSelectHistory(term)}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* 2. Global Results Tray */}
      <Animated.View
        style={{
          height: globalTrayAnim,
          opacity: globalOpacity,
          overflow: "hidden",
        }}
      >
        <View style={styles.trayDivider} />
        <View style={styles.trayHeader}>
          <Text style={styles.trayHeaderText}>Search Results:</Text>
        </View>
        <ScrollView keyboardShouldPersistTaps="always">
          {globalMatches.map((item, index) => (
            <View key={item.$id}>
              {index > 0 && <View style={styles.itemSeparator} />}
              <SearchItem
                item={item}
                onEdit={onEditTask}
                onQuickAdd={onQuickAdd}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  trayDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 12,
  },
  trayHeader: { padding: 10, paddingLeft: 16 },
  trayHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    opacity: 0.5,
    textTransform: "uppercase",
  },
  trayItem: { height: 60, justifyContent: "center" },
  itemSeparator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 16,
  },
});
