import CustomMenu from "@/components/CustomMenu";
import { DisplayNote } from "@/components/DisplayNote";
import { EditHabit } from "@/components/EditHabit";
import {
  client,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
  RealTimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, Note } from "@/types/database.type";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

// --- Utilities ---
const setupDateTime = (strDate: string) => {
  const date = new Date(strDate);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleDateString("en-US", options).split(", ");
};

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  // --- UI State ---
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [habitMenuOpen, setHabitMenuOpen] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [habitMenuPosition, setHabitMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // --- Data Fetching ---
  const fetchHabit = useCallback(async () => {
    if (!id) return;
    try {
      const response = await databases.getDocument<Habit>(
        DATABASE_ID,
        HABITS_TABLE_ID,
        id as string
      );
      setHabit(response);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const channel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents.${id}`;
    const subscription = client.subscribe(
      channel,
      (response: RealTimeResponse) => {
        // Refresh on any change to this specific document
        fetchHabit();
      }
    );

    fetchHabit();
    return () => subscription();
  }, [user, id, fetchHabit]);

  // --- Handlers ---
  const handleDelete = async () => {
    Alert.alert("Delete Habit", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await databases.deleteDocument(
              DATABASE_ID,
              HABITS_TABLE_ID,
              id as string
            );
            router.back();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Habit Details",
      headerRight: () => (
        <MaterialIcons
          name="menu"
          size={24}
          color="#000"
          onPress={() => Alert.alert("Settings")}
        />
      ),
    });
  }, [navigation]);

  if (isLoading)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  const formattedDate = habit?.created_at
    ? setupDateTime(habit.created_at)
    : ["--", "--"];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.segment}>
          {/* Header Options */}
          <View style={styles.menuAnchorContainer}>
            <CustomMenu
              visible={habitMenuOpen}
              onDismiss={() => setHabitMenuOpen(false)}
              position={habitMenuPosition}
              anchor={
                <TouchableOpacity
                  onPress={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    setHabitMenuPosition({ top: pageY, left: pageX - 180 });
                    setHabitMenuOpen(true);
                  }}
                >
                  <SimpleLineIcons name="options" size={18} color="#6c6c80" />
                </TouchableOpacity>
              }
              items={[
                {
                  label: "Edit",
                  onPress: () => {
                    setHabitMenuOpen(false);
                    setIsEditModalVisible(true);
                  },
                },
                { label: "Delete", danger: true, onPress: handleDelete },
              ]}
            />
          </View>

          {/* Habit Info */}
          <Text style={styles.emojiIcon}>{habit?.emote_pic || "✅"}</Text>
          <View style={styles.habitHeader}>
            <Text style={styles.habitTitle}>{habit?.title}</Text>
            <View style={styles.habitFreq}>
              <Text style={styles.habitFreqText}>{habit?.frequency}</Text>
            </View>
          </View>
          <Text style={styles.habitDescription}>{habit?.description}</Text>

          <View style={styles.statsRow}>
            <Text>🔥 Streak: {habit?.streak_count || 0}</Text>
            <Text>
              📅 Created: {formattedDate[0]}, {formattedDate[1]}
            </Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.segment}>
          <Text style={styles.notesTitle}>Notes</Text>
          <TextInput
            label="Add a Note"
            mode="outlined"
            style={styles.noteInput}
          />
          <ScrollView style={styles.innerNotesScroll} nestedScrollEnabled>
            <DisplayNote
              note={
                {
                  note_id: "1",
                  description: "Static mock note for now",
                  user_id_updated: "System",
                  last_updated: "Today",
                  created_at: "Today",
                } as Note
              }
            />
          </ScrollView>
        </View>

        <Button
          textColor="#d32f2f"
          onPress={handleDelete}
          style={styles.bottomDelete}
        >
          Delete Habit
        </Button>
      </ScrollView>

      {habit && (
        <EditHabit
          habit={habit}
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  segment: { marginTop: 20 },
  menuAnchorContainer: { position: "absolute", top: 0, right: 0, zIndex: 10 },
  emojiIcon: { fontSize: 80, textAlign: "center", marginVertical: 20 },
  habitHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  habitTitle: { fontSize: 26, fontWeight: "bold", color: "#22223b" },
  habitFreq: {
    marginLeft: 15,
    backgroundColor: "#ede7f6",
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  habitFreqText: {
    color: "#7c4dff",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  habitDescription: { fontSize: 18, color: "#6c6c80", marginBottom: 15 },
  statsRow: { gap: 5 },
  notesTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  noteInput: { marginBottom: 15 },
  innerNotesScroll: { height: 250 },
  bottomDelete: { marginTop: 40, marginBottom: 20 },
});
