import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescritipion] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>("");
  const theme = useTheme();

  const handleSubmit = async () => {
    // check if user exists first
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
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error creating the habit.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.prompts}>
        <TextInput
          style={styles.habit_input}
          label="Title"
          mode="outlined"
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.habit_input}
          label="Description"
          mode="outlined"
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
});
