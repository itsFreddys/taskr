import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react"; // Added useState import
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

interface PickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmote: string;
}

export const CustomEmojiPicker = ({
  visible,
  onClose,
  onSelect,
  currentEmote,
}: PickerProps) => {
  // 1. Move state INSIDE the component
  const [emoteFav, setEmoteFav] = useState<string[]>(["⭐", "✅"]);
  const [emoteHistory, setEmoteHistory] = useState<string[]>([]);
  const [emojiPic, setEmojiPic] = useState<string>("✅");

  const theme = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (visible) {
      setEmojiPic(currentEmote);
    }

    const loadStoredData = async () => {
      try {
        const [savedHistory, savedFavs] = await Promise.all([
          AsyncStorage.getItem("emoji_history"),
          AsyncStorage.getItem("emoji_favorites"),
        ]);

        if (savedHistory) setEmoteHistory(JSON.parse(savedHistory));
        if (savedFavs) setEmoteFav(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to load emojis", e);
      }
    };
    if (visible) loadStoredData();
  }, [visible, currentEmote]);

  // 🟢 Helper to save data
  const persistData = async (key: string, data: string[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  const updateEmojiHistory = (emote: string) => {
    let updatedList;
    if (emoteHistory.includes(emote)) {
      updatedList = [emote, ...emoteHistory.filter((item) => item !== emote)];
    } else {
      updatedList = [emote, ...emoteHistory].slice(0, 12);
    }
    setEmoteHistory(updatedList);
    persistData("emoji_history", updatedList); // 🟢 Persist
  };

  const toggleFavorite = (emote: string) => {
    let updatedFavs;
    if (emoteFav.includes(emote)) {
      updatedFavs = emoteFav.filter((item) => item !== emote);
    } else {
      updatedFavs = [emote, ...emoteFav];
    }
    setEmoteFav(updatedFavs);
    persistData("emoji_favorites", updatedFavs); // 🟢 Persist
  };

  // 2. Define categories INSIDE so they react to state changes
  const EMOJI_CATEGORIES = [
    { title: "Favorites", data: emoteFav },
    { title: "Recently used", data: emoteHistory },
    {
      title: "Education",
      data: ["🎓", "📚", "🎒", "🧠", "⭐", "📢", "🧪", "🎨", "✏️", "📐"],
    },
    {
      title: "Health",
      data: ["💪", "🏃", "🧘", "🥗", "💧", "🍎", "🥦", "🛏️", "🧘‍♂️", "🚶"],
    },
    {
      title: "Productivity",
      data: ["💻", "📝", "💡", "📅", "📧", "⌛", "🎯", "🛠️", "✅", "📈"],
    },
    {
      title: "Student Needs",
      data: ["🎧", "🧸", "🧩", "🔤", "🤐", "🫂", "🤚", "👂", "👀", "🌈"],
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.modalOverlay}>
        <Surface style={styles.modalContent} elevation={5}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose an Indicator</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Emoji & Title */}
          <View style={styles.center}>
            <Text style={styles.emojiDisplay}>{emojiPic}</Text>
          </View>

          <FlatList
            data={EMOJI_CATEGORIES}
            keyExtractor={(item) => item.title}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <View style={styles.emojiGrid}>
                  {item.data.length > 0 ? (
                    item.data.map((emoji) => (
                      <TouchableOpacity
                        onPress={() => {
                          setEmojiPic(emoji);
                          onSelect(emoji);
                          updateEmojiHistory(emoji);
                          onClose();
                        }}
                        onLongPress={() => toggleFavorite(emoji)}
                        style={styles.emojiButton}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                        {emoteFav.includes(emoji) && (
                          <View style={styles.favIndicator}></View>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyEmoji}>
                      No {item.title.toLowerCase()} yet
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        </Surface>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: "75%",
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    emojiDisplay: { fontSize: 72 },
    categorySection: {
      marginBottom: 20,
    },
    categoryTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
      marginBottom: 10,
      textTransform: "uppercase",
    },
    emojiGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    emojiButton: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      position: "relative",
    },
    favIndicator: {
      position: "absolute",
      top: 2,
      right: 2,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#FFD700", // Gold color for favorite
    },
    emptyEmoji: {
      fontSize: 13,
      color: "#6c6c80",
      marginLeft: 5,
      fontStyle: "italic",
    },
    emojiText: {
      fontSize: 24,
    },
  });
