import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Text,
  useTheme,
  Searchbar,
  IconButton,
  Button,
} from "react-native-paper";
import { TaskCard } from "@/components/task-card/TaskCard";
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

  const filteredTasks = tasks.filter((task: any) => {
    if (task.type === "separator" || !task.title) return true;

    return task.title.toLowerCase().includes((searchQuery || "").toLowerCase());
  });

  const TOTAL_SPACER_HEIGHT = headerHeight + 48;
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchBarAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(searchBarAnimation, {
      toValue: searchToggle ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [searchToggle]);

  const searchHeight = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const searchOpacity = searchBarAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const handleSearchToggle = () => {
    if (searchToggle) {
      setSearchQuery("");
    }
    setSearchToggle(!searchToggle);
  };

  return (
    <Animated.FlatList
      data={filteredTasks}
      onScroll={onScroll}
      keyExtractor={(item) => item.$id || item.id}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View>
          <View style={{ height: TOTAL_SPACER_HEIGHT }} />
          <View style={styles.filterContainer}>
            <View style={styles.headerRow}>
              <View style={styles.buttonWrapper}>
                <TaskActiveButtons
                  selected={activeButton}
                  onSelect={setActiveButton}
                />
              </View>
              <IconButton
                icon={searchToggle ? "magnify-minus" : "magnify"}
                onPress={handleSearchToggle}
                mode="contained-tonal"
                size={18}
                style={styles.searchIcon}
              />
            </View>

            <Animated.View
              style={[
                styles.searchContainer,
                {
                  height: searchHeight,
                  opacity: searchOpacity,
                  overflow: "hidden",
                },
              ]}
            >
              <Searchbar
                placeholder="Search tasks..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.globalSearch}
                inputStyle={styles.globalSearchInput}
                iconColor={theme.colors.primary}
                autoFocus={searchToggle} // Only autofocus when opening
                clearIcon="close-circle-outline"
              />
            </Animated.View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons
            name={
              searchQuery
                ? "magnify-close"
                : activeButton === "completed"
                ? "check-all"
                : "clipboard-text-outline"
            }
            size={48}
            color={theme.colors.outlineVariant}
          />
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : activeButton === "completed"
              ? "No completed tasks yet. Keep going!"
              : "No active tasks for today."}
          </Text>

          {/* 🟢 Add a 'Reset Search' button only when searching */}
          {searchQuery && (
            <Button
              mode="text"
              onPress={() => setSearchQuery("")}
              style={{ marginTop: 8 }}
            >
              Clear Search
            </Button>
          )}
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
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonWrapper: {
      flex: 1,
    },
    searchContainer: { paddingHorizontal: 0 },
    globalSearch: {
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
      height: 45,
      borderRadius: 10,
      justifyContent: "center",
      marginTop: 10,
    },
    globalSearchInput: {
      minHeight: 0,
      paddingVertical: 0,
      fontSize: 16,
      // alignSelf: "center",
      textAlignVertical: "center",
    },
    searchIcon: {
      margin: 0,
      marginLeft: 8,
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
