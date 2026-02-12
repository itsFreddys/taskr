import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, useTheme, Searchbar, IconButton } from "react-native-paper";

// Components
import { TaskCard } from "@/components/task-card/TaskCard";
import { TaskActiveButtons } from "@/components/TaskActiveButtons";
import { EmptyState } from "@/components/task-list/EmptyState";
import { SearchTray } from "@/components/task-list/SearchTray";

// Hooks
import { useSearchLogic } from "@/hooks/useSearchLogic";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const TasksTab = ({
  onScroll,
  headerHeight,
  tasks,
  allTasks,
  activeButton,
  setActiveButton,
  onToggleTask,
  onMoveToTomorrow,
  onDelete,
  handleBringToToday,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);

  // 🧠 Logic abstracted to Custom Hook
  const search = useSearchLogic(allTasks, tasks);

  // --- Layout Calculations ---
  const searchHeight = search.searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  const totalHeight = Animated.add(
    searchHeight,
    Animated.add(search.historyAnim, search.globalTrayAnim)
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        search.setIsFocused(false);
      }}
      accessible={false}
    >
      <View style={{ flex: 1 }}>
        <Animated.FlatList
          data={search.dailyMatches}
          onScroll={onScroll}
          keyExtractor={(item) => item.$id || item.id}
          scrollEventThrottle={16}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={
            <View style={{ zIndex: 10 }}>
              <View style={{ height: headerHeight + 48 }} />
              <View style={styles.filterContainer}>
                {/* 1. Header Row (Filter + Search Toggle) */}
                <View style={styles.headerRow}>
                  <View style={styles.buttonWrapper}>
                    <TaskActiveButtons
                      selected={activeButton}
                      onSelect={setActiveButton}
                    />
                  </View>
                  <IconButton
                    icon={search.searchToggle ? "magnify-minus" : "magnify"}
                    onPress={search.handleSearchToggle}
                    mode="contained-tonal"
                    size={18}
                    style={styles.searchIcon}
                  />
                </View>

                {/* 2. Animated Search Section */}
                <Animated.View
                  style={[
                    styles.growingContainer,
                    { height: totalHeight, opacity: 0.95 },
                  ]}
                >
                  <Searchbar
                    placeholder="Search tasks..."
                    onChangeText={search.setSearchQuery}
                    value={search.searchQuery}
                    onFocus={() => search.setIsFocused(true)}
                    onBlur={() => search.setIsFocused(false)}
                    style={styles.seamlessSearch}
                    inputStyle={styles.globalSearchInput}
                    autoFocus={search.searchToggle}
                    clearIcon="close-circle-outline"
                    onSubmitEditing={() => {
                      search.saveSearch(search.searchQuery);
                      Keyboard.dismiss();
                    }}
                  />

                  <SearchTray
                    history={search.history}
                    historyAnim={search.historyAnim}
                    onRemoveHistory={search.removeFromHistory}
                    onSelectHistory={search.setSearchQuery}
                    globalMatches={search.globalMatches}
                    globalTrayAnim={search.globalTrayAnim}
                    onEditTask={(task) => console.log("Navigate:", task.$id)}
                    onQuickAdd={(id) => {
                      handleBringToToday(id);
                      search.setSearchQuery("");
                      Keyboard.dismiss();
                    }}
                  />
                </Animated.View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              searchQuery={search.searchQuery}
              activeButton={activeButton}
            />
          }
          renderItem={({ item }) =>
            item.type === "separator" ? (
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>Completed</Text>
                <View style={styles.separatorLine} />
              </View>
            ) : (
              <TaskCard
                task={item}
                onToggleComplete={onToggleTask}
                onMoveToTomorrow={onMoveToTomorrow}
                onDelete={onDelete}
              />
            )
          }
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: any, headerHeight: number) =>
  StyleSheet.create({
    contentContainer: { paddingBottom: 100, minHeight: SCREEN_HEIGHT },
    filterContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      zIndex: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      zIndex: 12,
      marginBottom: -10,
    },
    buttonWrapper: { flex: 1 },
    growingContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginTop: 12,
      overflow: "hidden",
      elevation: 2,
    },
    seamlessSearch: {
      backgroundColor: "transparent",
      elevation: 0,
      height: 44,
      minHeight: 44,
      justifyContent: "center",
    },
    globalSearchInput: {
      fontSize: 15,
      minHeight: 0,
      paddingVertical: 0,
      marginVertical: 0,
      textAlignVertical: "center",
      includeFontPadding: false,
      alignSelf: "center",
    },
    searchIcon: { margin: 0, marginLeft: 8, marginTop: -7 },
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
      color: theme.colors.onSurfaceVariant,
    },
  });
