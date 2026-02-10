import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Keyboard,
  ScrollView,
  Easing,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Text,
  useTheme,
  Searchbar,
  IconButton,
  List,
} from "react-native-paper";
import { TaskCard } from "@/components/task-card/TaskCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TaskActiveButtons } from "@/components/TaskActiveButtons";

import { SearchItem } from "@/components/task-list/SearchItem";
import { EmptyState } from "@/components/task-list/EmptyState";

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
  handleBringToToday, // 🟢 Passed from Streakscreen
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme, headerHeight);

  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Animation States ---
  const [searchBarAnimation] = useState(new Animated.Value(0));
  const [historyAnim] = useState(new Animated.Value(0));
  const [globalTrayAnim] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const TOTAL_SPACER_HEIGHT = headerHeight + 48;
  const HISTORY_ITEM_HEIGHT = 60;
  const GLOBAL_ITEM_HEIGHT = 60; // 🟢 Matches your styles.searchResultsItems height
  const GLOBAL_HEADER_HEIGHT = 45; // 🟢 Accounts for header padding

  // --- Search Logic ---
  const dailyMatches = (tasks || []).filter((task: any) => {
    if (task.type === "separator" || !task.title) return true;

    const safeQuery = (searchQuery || "").toLowerCase();
    return task.title.toLowerCase().includes(safeQuery);
  });

  // 2. Update Global Matches
  const globalMatches = (allTasks || []).filter((task: any) => {
    const query = (searchQuery || "").trim().toLowerCase();
    if (!query) return false;

    const matchesSearch = task.title?.toLowerCase().includes(query);
    const isAlreadyInDaily = dailyMatches.some((d: any) => d.$id === task.$id);

    return matchesSearch && !isAlreadyInDaily;
  });

  // --- Persistent History Loading ---
  useEffect(() => {
    const loadHistory = async () => {
      const saved = await AsyncStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    };
    loadHistory();
  }, []);

  // --- Animation Effects ---
  useEffect(() => {
    Animated.timing(searchBarAnimation, {
      toValue: searchToggle ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start();
  }, [searchToggle]);

  useEffect(() => {
    const count = Math.min(history.length, 5);
    const separatorCount = count > 0 ? count - 1 : 0;
    const totalSeparatorHeight = separatorCount * 1; // 1 is your itemSeparator height

    const targetHeight =
      isFocused && !searchQuery
        ? count * HISTORY_ITEM_HEIGHT + totalSeparatorHeight + 2
        : 0;

    Animated.timing(historyAnim, {
      toValue: targetHeight,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [isFocused, searchQuery, history]);

  useEffect(() => {
    const count = Math.min(globalMatches.length, 5);
    // Header (40) + (items * 72)
    const targetHeight =
      searchQuery.length > 0 && globalMatches.length > 0
        ? count * GLOBAL_ITEM_HEIGHT + GLOBAL_HEADER_HEIGHT
        : 0;

    Animated.timing(globalTrayAnim, {
      toValue: targetHeight,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [searchQuery, globalMatches.length]);

  // --- Interpolations ---
  const searchHeight = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  const historyHeight = historyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const globalHeight = globalTrayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  const totalHeight = Animated.add(
    searchHeight,
    Animated.add(historyAnim, globalTrayAnim)
  );

  // --- Handlers ---
  const handleSearchToggle = () => {
    if (searchToggle) {
      Keyboard.dismiss();
      setSearchQuery("");
    }
    setSearchToggle(!searchToggle);
  };

  const saveSearch = async (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...history.filter((h) => h !== query)].slice(
      0,
      5
    );
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const removeFromHistory = async (term: string) => {
    const filtered = history.filter((h) => h !== term);
    setHistory(filtered);
    await AsyncStorage.setItem("search_history", JSON.stringify(filtered));
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setIsFocused(false);
      }}
      accessible={false}
    >
      <View style={{ flex: 1 }}>
        <Animated.FlatList
          data={dailyMatches}
          onScroll={onScroll}
          keyExtractor={(item) => item.$id || item.id}
          scrollEventThrottle={16}
          contentContainerStyle={styles.contentContainer}
          // --- HEADER SECTION ---
          ListHeaderComponent={
            <View style={{ zIndex: 10 }}>
              <View style={{ height: TOTAL_SPACER_HEIGHT }} />
              <View style={styles.filterContainer}>
                {/* Filter Buttons & Search Toggle */}
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

                {/* Animated Search Tray Container */}
                <Animated.View
                  style={[
                    styles.growingContainer,
                    { height: totalHeight, opacity: 0.95 },
                  ]}
                >
                  <Searchbar
                    placeholder="Search tasks..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.seamlessSearch}
                    inputStyle={styles.globalSearchInput}
                    autoFocus={searchToggle}
                    clearIcon="close-circle-outline"
                    onSubmitEditing={() => {
                      saveSearch(searchQuery);
                      Keyboard.dismiss();
                    }}
                  />

                  {/* 1. History Tray */}
                  <Animated.View
                    style={{ height: historyHeight, opacity: historyAnim }}
                  >
                    <View style={styles.trayDivider} />
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {history.map((term, index) => (
                        <View key={`history-${index}`}>
                          {index > 0 && <View style={styles.itemSeparator} />}
                          <List.Item
                            style={styles.searchResultsItems}
                            title={term}
                            titleStyle={{ fontSize: 14 }}
                            left={(props) => (
                              <List.Icon {...props} icon="history" />
                            )}
                            right={(props) => (
                              <IconButton
                                {...props}
                                icon="close"
                                size={16}
                                onPress={() => removeFromHistory(term)}
                              />
                            )}
                            onPress={() => setSearchQuery(term)}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </Animated.View>

                  {/* 2. Global Results Tray */}
                  <Animated.View
                    style={{ height: globalHeight, opacity: globalTrayAnim }}
                  >
                    <View style={styles.trayDivider} />
                    <View style={styles.trayHeader}>
                      <Text style={styles.trayHeaderText}>Search Results:</Text>
                    </View>
                    <ScrollView keyboardShouldPersistTaps="always">
                      {globalMatches.map((item: any, index: number) => (
                        <View key={item.$id}>
                          {index > 0 && <View style={styles.itemSeparator} />}
                          <SearchItem
                            item={item}
                            onEdit={(task) =>
                              console.log("Navigate to Task:", task.$id)
                            }
                            onQuickAdd={(id) => {
                              handleBringToToday(id);
                              setSearchQuery("");
                              Keyboard.dismiss();
                            }}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </Animated.View>
                </Animated.View>
              </View>
            </View>
          }
          // --- EMPTY STATE ---
          ListEmptyComponent={
            <EmptyState searchQuery={searchQuery} activeButton={activeButton} />
          }
          // --- LIST ITEMS ---
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
    animContainer: { overflow: "hidden", zIndex: 11 }, // Searchbar slide container
    searchContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    growingContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12, // 🟢 Slightly tighter radius for a slimmer bar
      marginTop: 12,
      overflow: "hidden",
      elevation: 2,
    },
    seamlessSearch: {
      backgroundColor: "transparent", // 🟢 No separate background
      elevation: 0,
      height: 44,
      minHeight: 44,
      justifyContent: "center",
    },
    trayDivider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      opacity: 0.2,
      marginHorizontal: 12,
    },
    trayHeader: {
      padding: 10,
      backgroundColor: theme.colors.surface,
    },
    trayHeaderText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      opacity: 0.6,
    },
    searchResultsItems: {
      flexDirection: "row",
      height: 60,
      alignItems: "center",
    },
    itemSeparator: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      opacity: 0.4, // 🟢 Very faint line
      marginHorizontal: 16,
    },
    globalSearchInput: {
      fontSize: 15,
      minHeight: 0, // 🟢 Removes default height constraint
      paddingVertical: 0, // 🟢 Removes padding that pushes text down
      marginVertical: 0,
      textAlignVertical: "center", // 🟢 Forces Android centering
      includeFontPadding: false, // 🟢 Removes extra font-specific spacing
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
