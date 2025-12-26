import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Button, Text, Surface, IconButton } from "react-native-paper";

// 1. Define your curated categories relevant to Taskr
const EMOJI_CATEGORIES = [
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
                  {item.data.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiButton}
                      onPress={() => onSelect(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
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
    height: "70%",
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
  },
  emojiText: {
    fontSize: 24,
  },
});
