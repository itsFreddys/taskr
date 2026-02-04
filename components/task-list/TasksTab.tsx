import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import { TaskCard } from "@/components/TaskCard";
import { TaskActiveButtons } from "@/components/TaskActiveButtons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const TasksTab = ({
  onScroll,
  headerHeight,
  tasks,
  activeButton,
  setActiveButton,
  onToggleTask,
  onMoveToTomorrow,
  onDelete,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);
  const TOTAL_SPACER_HEIGHT = headerHeight + 48;

  return (
    <Animated.FlatList
      data={tasks}
      onScroll={onScroll}
      keyExtractor={(item) => item.$id || item.id}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View>
          <View style={{ height: TOTAL_SPACER_HEIGHT }} />
          <View style={styles.filterContainer}>
            <TaskActiveButtons
              selected={activeButton}
              onSelect={setActiveButton}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <View
          style={[
            styles.emptyCard,
            { height: SCREEN_HEIGHT - TOTAL_SPACER_HEIGHT - 200 },
          ]}
        >
          <MaterialCommunityIcons
            name={
              activeButton === "completed"
                ? "check-all"
                : "clipboard-text-outline"
            }
            size={48}
            color={theme.colors.outlineVariant}
          />
          <Text style={styles.emptyText}>
            {activeButton === "completed"
              ? "No completed tasks yet. Keep going!"
              : "No active tasks for today."}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        if (item.type === "separator") {
          return (
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Completed</Text>
              <View style={styles.separatorLine} />
            </View>
          );
        }

        return (
          <TaskCard
            task={item}
            onToggleComplete={onToggleTask}
            onMoveToTomorrow={onMoveToTomorrow}
            onDelete={onDelete}
            onPress={() => console.log("Edit Task", item.$id)}
          />
        );
      }}
    />
  );
};

const createStyles = (theme: any, headerHeight: number) =>
  StyleSheet.create({
    contentContainer: { paddingBottom: 100, minHeight: SCREEN_HEIGHT },
    filterContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    emptyCard: {
      flex: 1,
      margin: 16,
      borderStyle: "dashed",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: { color: "#aaa", marginTop: 12 },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 20,
      marginVertical: 16,
      opacity: 0.5,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
    },
    separatorText: {
      marginHorizontal: 12,
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: theme.colors.onSurfaceVariant,
    },
  });
