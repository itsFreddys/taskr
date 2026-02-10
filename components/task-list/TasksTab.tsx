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
        setIsFocused(false); // Manually ensure state updates
      }}
      accessible={false} // Prevents screen readers from seeing the wrapper as a button
    >
      <View style={{ flex: 1 }}>
        <Animated.FlatList
          data={dailyMatches}
          onScroll={onScroll}
          keyExtractor={(item) => item.$id || item.id}
          scrollEventThrottle={16}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={
            <View style={{ zIndex: 10 }}>
              <View style={{ height: TOTAL_SPACER_HEIGHT }} />
              <View style={styles.filterContainer}>
                {/* Filter Buttons & Toggle */}
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
                    styles.growingContainer,
                    {
                      height: totalHeight,
                      opacity: 0.8,
                    },
                  ]}
                >
                  <Searchbar
                    placeholder="Search tasks..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.seamlessSearch} // Transparent background
                    inputStyle={styles.globalSearchInput}
                    autoFocus={searchToggle}
                    clearIcon="close-circle-outline"
                    onSubmitEditing={() => {
                      saveSearch(searchQuery);
                      Keyboard.dismiss();
                    }}
                  />

                  {/* History Tray */}
                  <Animated.View
                    style={{ height: historyHeight, opacity: historyAnim }}
                  >
                    <View style={styles.trayDivider} />
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {history.map((item, index) => (
                        <View key={index}>
                          {/* 🟢 Line break between items (except the first) */}
                          {index > 0 && <View style={styles.itemSeparator} />}

                          <List.Item
                            style={styles.searchResultsItems} // 🟢 Shared slim style
                            title={item}
                            titleStyle={{ fontSize: 14 }}
                            left={(props) => (
                              <List.Icon {...props} icon="history" />
                            )}
                            right={(props) => (
                              <IconButton
                                {...props}
                                icon="close"
                                size={16}
                                onPress={() => removeFromHistory(item)}
                              />
                            )}
                            onPress={() => setSearchQuery(item)}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </Animated.View>

                  {/* Global Results Tray */}
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
                          <View style={styles.searchResultsItems}>
                            <Pressable
                              onPress={() => {
                                console.log("redirect to task display");
                              }}
                              style={styles.editActionZone}
                            >
                              <View style={styles.infoWrapper}>
                                <Text style={styles.emoteText}>
                                  {item.emotePic}
                                </Text>
                                <View style={styles.textContainer}>
                                  <Text style={styles.searchItemTitle}>
                                    {item.title}
                                  </Text>
                                  <Text style={styles.searchItemDesc}>
                                    Last active:{" "}
                                    {new Date(
                                      item.$updatedAt
                                    ).toLocaleDateString()}
                                  </Text>
                                </View>
                              </View>
                            </Pressable>

                            <View style={styles.quickAddZone}>
                              <IconButton
                                icon="plus-circle-outline"
                                iconColor={theme.colors.primary}
                                size={24}
                                onPress={() => handleBringToToday(item.$id)}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </Animated.View>
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
                  : "No tasks found."}
              </Text>
            </View>
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
    tray: {
      backgroundColor: theme.colors.surfaceVariant,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      // marginTop: -5,
      overflow: "hidden",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      borderTopWidth: 1,
      borderColor: "rgba(0,0,0,0.15)",
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
    editActionZone: {
      flex: 1, // Takes up remaining space
      height: "100%",
      justifyContent: "center",
      paddingLeft: 16,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    textContainer: {
      marginLeft: 12,
      flex: 1,
    },
    quickAddZone: {
      width: 60,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.outlineVariant + "20", // Very faint separator
    },
    emoteText: {
      fontSize: 22,
      width: 30,
      textAlign: "center",
      textAlignVertical: "center",
      includeFontPadding: false,
    },
    searchItemTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: -2,
    },
    searchItemDesc: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
    },
    itemSeparator: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      opacity: 0.4, // 🟢 Very faint line
      marginHorizontal: 16,
    },
    globalSearch: {
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
      height: 45,
      borderRadius: 10,
      marginTop: 10,
      marginBottom: 0,
    },
    // globalSearchInput: { minHeight: 0, paddingVertical: 0, fontSize: 16 },
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
      height: 200,
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
      color: theme.colors.onSurfaceVariant,
    },
  });
