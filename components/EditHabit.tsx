import { CustomEmojiPicker } from "@/components/CustomEmojiPicker";
import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
  visible: boolean; // Add visibility control
  onClose: () => void; // Add close function
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

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    // If no changes were made, just close
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
      onClose(); // Close modal after successful save
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error updating habit");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.modalOverlay}>
        <Surface style={styles.modalContent} elevation={5}>
          {/* Header Section */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Form Section */}
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
                  color="#6c6c80"
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
              multiline={true}
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

            {error && (
              <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                {error}
              </Text>
            )}
          </View>
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
    height: "90%",
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
  prompts: {
    padding: 24,
  },
  habit_input: {
    marginBottom: 14,
  },
  habit_description_input: {
    marginBottom: 14,
    height: 150,
    textAlignVertical: "top",
  },
  seg_buttons: {
    marginBottom: 14,
  },
  footerButtons: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  cancel_btn: {
    // marginTop: 14,
    marginBottom: 14,
    width: 110,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
  },
  add_btn: {
    // marginTop: 14,
    width: 110,
    marginBottom: 14,
  },
  //   loginButton: {
  //     width: 200,
  //     height: 20,
  //     backgroundColor: "grey",
  //     borderRadius: 8,
  //     textAlign: "center",
  //   },
  iconButton: {
    padding: 0,
    position: "absolute",
    bottom: 30,
    right: -20,
  },
  emojiIcon: {
    fontSize: 120,
    textAlign: "center",
    alignSelf: "center",
    marginVertical: 24,
  },
  imageHeader: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
  },
  imageSelector: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    marginTop: 30,
  },
});
