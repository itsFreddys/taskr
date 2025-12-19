import CustomMenu from "@/components/CustomMenu";
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
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ID } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Surface, Text, TextInput, useTheme } from "react-native-paper";

// this page will provide extra details about the task, along with notes of the task
// also provide the user with options to delete or renew the task or edit task

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function HabitDetailsScreen() {
  // hold the fetched habit data
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // adding useStates in case edits are made
  const [title, setTitle] = useState<string>("");
  const [userNotes, setHabitNotes] = useState<string[] | null>();
  const [newNote, setNewNote] = useState<string>("");
  const [description, setDescritipion] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  const [visibleHabitMenuId, setVisibleHabitMenuId] = useState(false);
  const [visibleNoteMenuId, setVisibleNoteMenuId] = useState(false);

  const openHabitMenu = () => setVisibleHabitMenuId(true);
  const closeHabitMenu = () => setVisibleHabitMenuId(false);
  const openNoteMenu = () => setVisibleNoteMenuId(true);
  const closeNoteMenu = () => setVisibleNoteMenuId(false);

  const [habitMenuOpen, setHabitMenuOpen] = useState(false);
  const [noteMenuOpen, setNoteMenuOpen] = useState(false);

  const toggleHabitMenu = () => setVisibleHabitMenuId(!visibleHabitMenuId);
  const toggleNoteMenu = () => setVisibleNoteMenuId(!visibleNoteMenuId);

  const [dateTime, setDateTime] = useState<string[]>([
    "Weekday",
    "Month",
    "day",
    "time",
  ]);

  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>("");
  const theme = useTheme();

  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (user) {
      // let the subscription refresh the content when habits table is updated: create, update, delete
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealTimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabit(id as string);
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabit(id as string);
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabit(id as string);
          }
        }
      );

      fetchHabit(id as string);

      return () => {
        habitsSubscription();
      };
    }
  }, [user]);

  const handleDelButtonPress = () => {
    if (!id) return;

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this habit? This cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion Cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteHabit(id as string),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_TABLE_ID, id);
    } catch (error) {
      console.error(error);
    }
    console.log(`deleted habit ${id}`);
    router.back();
  };

  const fetchHabit = async (habitId: string) => {
    try {
      const response = await databases.getDocument<Habit>(
        DATABASE_ID,
        HABITS_TABLE_ID,
        habitId
      );
      setHabit(response as Habit);

      if (response.created_at) {
        const newDateTime = setupDateTime(response.created_at);
        // setDateTime(newDateTime);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuPress = () => {
    // 💡 Add logic here to open a modal or navigate to a settings screen
    console.log(`Opening menu for Habit ID: ${id}`);
    alert(`Menu options for ${id}`);
  };

  const setupDateTime = (strDate: string) => {
    const date = new Date(strDate);

    const options: Intl.DateTimeFormatOptions = {
      // 1. day of week
      weekday: "short",
      // 2. month and day
      month: "short",
      day: "numeric",
      // 3. time
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    // array of string:
    // [weekday, month day time]
    return date.toLocaleDateString("en-US", options).split(", ");
  };

  useLayoutEffect(() => {
    // fetchHabit(id as string);
    // Set the navigation options for this screen
    navigation.setOptions({
      // 1. Set the Title to the Habit ID (must be a string)
      title: `Habit Details`,

      // 2. Add the Menu Button to the right side
      headerRight: () => (
        <MaterialIcons
          name="menu" // The icon for a vertical menu
          size={24}
          color="#000" // Adjust color to match your theme
          onPress={handleMenuPress}
          style={{ marginLeft: 5 }} // Add some spacing
        />
      ),

      // 3. Ensure the Back Arrow is Visible (usually default, but good to ensure)
      headerLeft: undefined, // Clears any default override
    });
  }, [navigation, id]); // Re-run if navigation or ID changes

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

  const displayNote = (note: Note) => {
    return (
      // <View key={note.note_id}>
      <View>
        <Text style={styles.noteDate}>{note.last_updated}</Text>
        <Surface style={styles.noteCard} elevation={0}>
          <View style={styles.noteContent}>
            {/* ✅ Wrap the button in a Menu */}
            <View style={styles.menuAnchorContainer}>
              <CustomMenu
                visible={noteMenuOpen}
                onDismiss={() => setNoteMenuOpen(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setNoteMenuOpen(true)}
                    style={styles.noteOptionsButton}
                  >
                    <SimpleLineIcons name="options" size={18} color="#6c6c80" />
                  </TouchableOpacity>
                }
                items={[
                  { label: "Edit", onPress: () => console.log("edit") },
                  {
                    label: "Copy",
                    onPress: () => console.log("copy pressed"),
                  },
                  {
                    label: "Delete",
                    danger: true,
                    onPress: () => console.log("note delete pressed"),
                  },
                ]}
              />
            </View>

            <Text style={styles.noteDescription}>{note.description}</Text>
            <Text style={styles.noteFooter}>{note.user_id_updated}</Text>
          </View>
        </Surface>
      </View>
    );
  };

  const myNote: Note = {
    note_id: "3241",
    description: "the is the description of the note",
    user_id_updated: "David Vroom",
    last_updated: "Mon Dec 4 at 8:00 PM",
    created_at: "Fri Dec 1 at 3:30 PM",
  } as Note;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.segment}>
          <View style={styles.menuAnchorContainer}>
            <CustomMenu
              visible={habitMenuOpen}
              onDismiss={() => setHabitMenuOpen(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setHabitMenuOpen(true)}
                  style={styles.optionsButton}
                >
                  <SimpleLineIcons name="options" size={24} color="#6c6c80" />
                </TouchableOpacity>
              }
              items={[
                { label: "Edit", onPress: () => console.log("edit") },
                {
                  label: "Delete",
                  danger: true,
                  onPress: handleDelButtonPress,
                },
              ]}
            />
          </View>
          <Image
            source={require("../../assets/images/defaults/default-habit-img.png")}
            // CRUCIAL: Remember to set explicit width and height in styles
            style={styles.defaultImage}
          />
          <View style={styles.habitHeader}>
            <Text style={styles.habitTitle}>{habit?.title}</Text>
            <View style={styles.habitFreq}>
              <Text style={styles.habitFreqText}>
                {habit?.frequency.charAt(0).toUpperCase() +
                  habit?.frequency.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.habitDescription}>{habit?.description}</Text>
          <Text>Streak: {habit?.streak_count}</Text>
          <Text>Last Completed: {habit?.last_completed}</Text>
          <Text>Creation date: {`${dateTime[0]}, ${dateTime[1]}`}</Text>
        </View>
        <View style={styles.segment}>
          <Text style={styles.notesTitle}>Notes</Text>
          <TextInput
            style={{ marginBottom: 5 }}
            label="Add a Note"
            mode="outlined"
            onChangeText={setNewNote}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.innerNotesScroll}
          >
            {displayNote(myNote)}
            {/* {displayNote(myNote)}
            {displayNote(myNote)}
            {displayNote(myNote)}
            {displayNote(myNote)}
            {displayNote(myNote)}
            {displayNote(myNote)}
            {displayNote(myNote)} */}
          </ScrollView>
        </View>
        <Button
          textColor="#d32f2f"
          style={{ marginTop: 30 }}
          onPress={handleDelButtonPress}
          mode="text"
          disabled={!id || !user}
        >
          Delete Habit
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    // alignItems: "center",
  },
  segment: {
    flex: 1,
    // marginTop: 30,
    justifyContent: "center",
  },
  menuAnchorContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    position: "absolute", // This keeps the menu from shifting the Image/Title
    top: 0,
    right: 0,
    zIndex: 10,
  },
  defaultImage: {
    // ✅ MUST define width and height for local images
    width: 100, // Example size
    height: 100, // Example size
    alignSelf: "center", // Example centering
    marginVertical: 24,
  },
  prompts: {
    // padding: 24,
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
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  habitFreq: {
    // fontSize: 24,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 4,
    backgroundColor: "#ede7f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  habitFreqText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 18,
  },
  habitDescription: {
    fontSize: 20,
    marginBottom: 16,
    color: "#6c6c80",
  },
  innerNotesScroll: {
    height: 320,
    // borderWidth: 1,
    // borderColor: "#ccc",
    borderRadius: 18,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  notesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 20,
    color: "#22223b",
  },
  noteCard: {
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
    padding: 15,
    position: "relative",
  },
  noteDate: {
    fontSize: 10,
    marginBottom: 8,
    flex: 1,
    textAlign: "center",
    color: "#6c6c80",
  },
  optionsButton: {
    alignItems: "flex-end",
  },
  noteOptionsButton: {
    alignItems: "flex-end",
    marginRight: 15,
    marginTop: 8,
  },
  noteDescription: {
    flex: 1,
    fontSize: 15,
    marginVertical: 10,
    color: "#6c6c80",
  },
  noteFooter: {
    textAlign: "right",
    fontSize: 10,
    color: "#6c6c80",
  },
});
