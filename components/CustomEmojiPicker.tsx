import React, { useState } from "react"; // Added useState import
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Text, Surface, IconButton } from "react-native-paper";

interface PickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export const CustomEmojiPicker = ({
  visible,
  onClose,
  onSelect,
}: PickerProps) => {
  // 1. Move state INSIDE the component
  const [emoteFav, setEmoteFav] = useState<string[]>(["⭐", "✅"]);
  const [emoteHistory, setEmoteHistory] = useState<string[]>([]);

  // 2. Define categories INSIDE so they react to state changes
  const EMOJI_CATEGORIES = [
    { title: "Favorites", data: emoteFav },
    { title: "History", data: emoteHistory },
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

  const updateEmojiHistory = (emote: string) => {
    // 3. Fixed .includes() typo
    const hasEmote = emoteHistory.includes(emote);

    if (hasEmote) {
      // Move existing emote to the front
      const updatedList = emoteHistory.filter((item) => item !== emote);
      setEmoteHistory([emote, ...updatedList]);
    } else {
      // Add new, slice to keep limit at 12
      setEmoteHistory((prev) => [emote, ...prev].slice(0, 12));
    }
  };

  const toggleFavorite = (emote: string) => {
    if (emoteFav.includes(emote)) {
      setEmoteFav(emoteFav.filter((item) => item !== emote));
    } else {
      setEmoteFav([emote, ...emoteFav]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.modalOverlay}>
        <Surface style={styles.modalContent} elevation={5}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose an Indicator</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
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
                        key={`${item.title}-${emoji}`}
                        style={styles.emojiButton}
                        onPress={() => {
                          onSelect(emoji);
                          updateEmojiHistory(emoji);
                        }}
                        // Long press to favorite/unfavorite
                        onLongPress={() => toggleFavorite(emoji)}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                        {/* Optional: Visual indicator if favorite */}
                        {emoteFav.includes(emoji) && (
                          <View style={styles.favIndicator} />
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
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
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c6c80",
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
    backgroundColor: "#f5f5f5",
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
