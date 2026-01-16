import { CustomEmojiPicker } from "@/components/CustomEmojiPicker";
import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  IconButton,
  TextInput as PaperTextInput,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

interface EditHabitProps {
  habit: Habit;
  visible: boolean;
  onClose: () => void;
}

export const EditHabit = ({ habit, visible, onClose }: EditHabitProps) => {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [emojiPic, setEmojiPic] = useState(habit.emote_pic);
  const [title, setTitle] = useState(habit.title);
  const [description, setDescritipion] = useState(habit.description);
  const [frequency, setFrequency] = useState<Frequency>(habit.frequency);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const styles = createStyles(theme);

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    // No-change check to save API calls
    if (
      title === habit.title &&
      description === habit.description &&
      frequency === habit.frequency &&
      emojiPic === habit.emote_pic
    ) {
      onClose();
      return;
    }

    try {
      await databases.updateDocument(DATABASE_ID, HABITS_TABLE_ID, habit.$id, {
        title,
        description,
        frequency,
        emote_pic: emojiPic,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating habit");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop tap-to-close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Surface style={styles.modalContent} elevation={5}>
          {/* Static Handle for visual consistency */}
          {/* <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View> */}

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Form Content */}
          <View style={styles.prompts}>
            <CustomEmojiPicker
              visible={emojiPickerVisible}
              onClose={() => setEmojiPickerVisible(false)}
              onSelect={(emoji) => {
                setEmojiPic(emoji);
                setEmojiPickerVisible(false);
              }}
            />

            <View style={styles.imageHeader}>
              <TouchableOpacity
                onPress={() => setEmojiPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiIcon}>{emojiPic}</Text>
                <Ionicons
                  name="add-circle-outline"
                  size={28}
                  color={theme.colors.outline}
                  style={styles.iconButton}
                />
              </TouchableOpacity>
            </View>

            <PaperTextInput
              style={styles.habit_input}
              label="Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
            />

            <PaperTextInput
              style={styles.habit_description_input}
              label="Description"
              mode="outlined"
              value={description}
              multiline
              numberOfLines={5}
              onChangeText={setDescritipion}
            />

            <SegmentedButtons
              style={styles.seg_buttons}
              value={frequency}
              onValueChange={(value) => setFrequency(value as Frequency)}
              buttons={FREQUENCIES.map((freq) => ({
                value: freq,
                label: freq.charAt(0).toUpperCase() + freq.slice(1),
                labelStyle: { fontWeight: "bold" },
              }))}
            />

            <View style={styles.footerButtons}>
              <Button
                style={styles.cancel_btn}
                onPress={onClose}
                mode="outlined"
              >
                Cancel
              </Button>
              <Button
                style={styles.add_btn}
                onPress={handleSave}
                mode="contained"
                disabled={!title || !description}
              >
                Save
              </Button>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </Surface>
      </View>
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
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      minHeight: "75%",
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 20,
    },
    dragHandleContainer: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 12,
    },
    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.outlineVariant,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    prompts: {
      paddingTop: 10,
    },
    habit_input: {
      marginBottom: 14,
    },
    habit_description_input: {
      marginBottom: 14,
      textAlignVertical: "top",
    },
    seg_buttons: {
      marginVertical: 20,
    },
    footerButtons: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginTop: 20,
    },
    cancel_btn: {
      width: 120,
      borderColor: theme.colors.outline,
    },
    add_btn: {
      width: 120,
    },
    emojiIcon: {
      fontSize: 100,
      textAlign: "center",
      marginVertical: 10,
    },
    imageHeader: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    iconButton: {
      position: "absolute",
      bottom: 10,
      right: -10,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: 10,
      textAlign: "center",
    },
  });
