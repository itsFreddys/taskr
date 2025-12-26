import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  SafeAreaView,
} from "react-native";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput as PaperTextInput,
  useTheme,
} from "react-native-paper";
import { ID } from "react-native-appwrite";
import EmojiSelector, { Categories } from "react-native-emoji-selector";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescritipion] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>("");
  const theme = useTheme();

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [emojiPic, setEmojiPic] = useState("✅");

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_TABLE_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      );
      router.back();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creating habit");
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={emojiPickerVisible}
        animationType="slide"
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.imageSelector}>
            <Text style={styles.emojiIcon}>{emojiPic}</Text>
          </View>
          <View style={{ marginTop: 10, flex: 1 }}>
            <EmojiSelector
              onEmojiSelected={(emoji) => {
                setEmojiPic(emoji);
                setEmojiPickerVisible(false);
              }}
              showSearchBar={true}
              showTabs
              columns={8}
              category={Categories.objects}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.prompts}>
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
          onChangeText={setTitle}
        />
        <PaperTextInput
          style={styles.habit_description_input}
          label="Description"
          mode="outlined"
          multiline={true}
          numberOfLines={5}
          contentStyle={{ paddingTop: 10 }}
          onChangeText={setDescritipion}
        />
        <SegmentedButtons
          style={styles.seg_buttons}
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
            labelStyle: {
              fontWeight: "bold",
            },
          }))}
        />
        <Button
          style={styles.add_btn}
          onPress={handleSubmit}
          mode="contained"
          disabled={!title || !description}
        >
          Add Habit
        </Button>
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
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
  add_btn: {
    marginTop: 14,
    marginBottom: 14,
  },
  loginButton: {
    width: 200,
    height: 20,
    backgroundColor: "grey",
    borderRadius: 8,
    textAlign: "center",
  },
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
