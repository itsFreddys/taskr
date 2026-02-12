import { useState, useEffect, useCallback, useMemo } from "react";
import { Animated, Keyboard, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for math (keep these synced with your UI heights)
const HISTORY_ITEM_HEIGHT = 60;
const GLOBAL_ITEM_HEIGHT = 60;
const GLOBAL_HEADER_HEIGHT = 45;

export const useSearchLogic = (allTasks: any[], dailyTasks: any[]) => {
  const [searchToggle, setSearchToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const filteredDaily = useMemo(() => {
    return (dailyTasks || []).filter((task: any) => {
      if (task.type === "separator" || !task.title) return true;
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [dailyTasks, searchQuery]);

  const filteredGlobal = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return (allTasks || []).filter((task: any) => {
      const matchesSearch = task.title?.toLowerCase().includes(query);
      const isAlreadyInDaily = filteredDaily.some(
        (d: any) => d.$id === task.$id
      );
      return matchesSearch && !isAlreadyInDaily;
    });
  }, [allTasks, searchQuery, filteredDaily]);

  // --- Animation Values ---
  const [searchBarAnim] = useState(new Animated.Value(0));
  const [historyAnim] = useState(new Animated.Value(0));
  const [globalTrayAnim] = useState(new Animated.Value(0));

  // --- Persistent History ---
  useEffect(() => {
    const loadHistory = async () => {
      const saved = await AsyncStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    };
    loadHistory();
  }, []);

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

  // --- Animation Effects ---
  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: searchToggle ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start();
  }, [searchToggle]);

  useEffect(() => {
    const count = Math.min(history.length, 5);
    const separatorCount = count > 0 ? count - 1 : 0;
    const targetHeight =
      isFocused && !searchQuery
        ? count * HISTORY_ITEM_HEIGHT + separatorCount * 1 + 2
        : 0;

    Animated.timing(historyAnim, {
      toValue: targetHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused, searchQuery, history]);

  useEffect(() => {
    const count = Math.min(filteredGlobal.length, 5);
    const targetHeight =
      searchQuery.length > 0 && count > 0
        ? count * GLOBAL_ITEM_HEIGHT +
          (count > 1 ? count - 1 : 0) +
          GLOBAL_HEADER_HEIGHT
        : 0;

    Animated.timing(globalTrayAnim, {
      toValue: targetHeight,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [searchQuery, filteredGlobal.length]);

  // --- Toggle Handler ---
  const handleSearchToggle = useCallback(() => {
    if (searchToggle) {
      Keyboard.dismiss();
      setSearchQuery("");
    }
    setSearchToggle(!searchToggle);
  }, [searchToggle]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    searchToggle,
    handleSearchToggle,
    isFocused,
    setIsFocused,
    history,
    dailyMatches: filteredDaily,
    globalMatches: filteredGlobal,

    // Animations
    searchBarAnim,
    historyAnim,
    globalTrayAnim,

    // Handlers
    saveSearch,
    removeFromHistory,
  };
};
