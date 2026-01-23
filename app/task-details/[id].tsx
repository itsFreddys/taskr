import CustomMenu from "@/components/CustomMenu";
import { DisplayNote } from "@/components/DisplayNote";
import { EditHabit } from "@/components/EditHabit";
import { GlobalSettingsMenu } from "@/components/GlobalSettingsMenu";
import {
  client,
  DATABASE_ID,
  databases,
  HABIT_NOTES_TABLE_ID,
  HABITS_TABLE_ID,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, Note } from "@/types/database.type";
import { Ionicons } from "@expo/vector-icons";
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
import { ID, Query } from "react-native-appwrite";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

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
  const [errorText, setErrorText] = useState<string | null>(null);
  const [habitMenuOpen, setHabitMenuOpen] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [habitMenuPosition, setHabitMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const theme = useTheme();
  const styles = createStyles(theme);

  // --- Notes States
  const [newNote, setNewNote] = useState<string>("");
  const [Notes, setNotes] = useState<Note[]>();

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

  const fetchNotes = useCallback(async () => {
    if (!id) return;

    try {
      // fetch all the docs of the notes collection
      const response = await databases.listDocuments<Note>(
        DATABASE_ID,
        HABIT_NOTES_TABLE_ID,
        [Query.equal("habit_id", id as string), Query.orderDesc("created_at")]
      );
      setNotes(response.documents as Note[]);
    } catch (error) {
      console.error("Fetch Notes Error:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to Habit changes
    const habitChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents.${id}`;
    // Subscribe to ALL notes for this specific habit
    const notesChannel = `databases.${DATABASE_ID}.collections.${HABIT_NOTES_TABLE_ID}.documents`;

    const unsubscribeHabit = client.subscribe(habitChannel, () => fetchHabit());

    const unsubscribeNotes = client.subscribe(notesChannel, (response) => {
      // Only refresh if the note belongs to this habit
      const payload = response.payload as Note;
      if (payload && payload.habit_id === id) {
        fetchNotes();
      }
    });

    fetchHabit();
    fetchNotes();

    return () => {
      unsubscribeHabit();
      unsubscribeNotes();
    };
  }, [user, id, fetchHabit, fetchNotes]);

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

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     title: "Task Details",
  //     headerStyle: { backgroundColor: theme.colors.background },
  //     headerTitleStyle: {
  //       color: theme.colors.onSurface,
  //       fontWeight: "bold",
  //     },
  //     // --- Right Side (Menu) ---
  //     headerRight: () => <GlobalSettingsMenu />,
  //     //   (
  //     //   <TouchableOpacity
  //     //     onPress={() => Alert.alert("Settings")}
  //     //     style={styles.headerIconContainer}
  //     //   >
  //     //     <MaterialIcons name="menu" size={24} color="#22223b" />
  //     //   </TouchableOpacity>
  //     // )
  //     // --- Left Side (Back) ---
  //     headerLeft: () => (
  //       <TouchableOpacity
  //         onPress={() => router.back()}
  //         style={styles.headerIconContainer}
  //       >
  //         <Ionicons name="chevron-back-outline" size={24} color="#22223b" />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation]);

  if (isLoading)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  const formattedDate = habit?.created_at
    ? setupDateTime(habit.created_at)
    : ["--", "--"];

  const submitNewNote = async () => {
    if (!user) return;
    setErrorText(null);
    if (newNote.length < 4) {
      setErrorText("Note needs to be at least 5 characters.");
      return;
    }

    const currentDate = new Date().toISOString();

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABIT_NOTES_TABLE_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          username: user.name,
          description: newNote,
          created_at: currentDate,
          updated_at: currentDate,
        }
      );
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Error creating new note."
      );
    }
  };

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
                  <SimpleLineIcons
                    name="options"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
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
            style={styles.noteInput}
            label="Add a Note"
            mode="outlined"
            value={newNote}
            onChangeText={setNewNote}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={async () => {
              await submitNewNote();
              setNewNote(""); // clear after submit if you want
            }}
          />
          {errorText && (
            <Text style={{ color: theme.colors.error, marginBottom: 10 }}>
              {errorText}
            </Text>
          )}
          <ScrollView style={styles.innerNotesScroll} nestedScrollEnabled>
            {Notes && Notes.length > 0 ? (
              Notes.map((item) => <DisplayNote key={item.$id} note={item} />)
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                No notes yet. Add one above!
              </Text>
            )}
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    headerIconContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      // We remove backgroundColor and borderRadius to make it "invisible"
      marginHorizontal: 8, // Space from the screen edges
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 24,
    },
    segment: { marginTop: 20 },
    menuAnchorContainer: { position: "absolute", top: 0, right: 0, zIndex: 10 },
    emojiIcon: { fontSize: 80, textAlign: "center", marginVertical: 20 },
    habitHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    habitTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    habitFreq: {
      marginLeft: 15,
      backgroundColor: "#ede7f6",
      paddingHorizontal: 10,
      borderRadius: 12,
      height: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    habitFreqText: {
      textAlign: "center",
      justifyContent: "center",
      color: "#7c4dff",
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    habitDescription: {
      fontSize: 18,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 15,
    },
    statsRow: { gap: 5 },
    notesTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 10,
    },
    noteInput: { marginBottom: 15 },
    innerNotesScroll: { height: 320 },
    bottomDelete: {
      alignSelf: "center",
      marginTop: 40,
      marginBottom: 20,
      width: 150,
      color: theme.colors.error,
    },
  });
