import {
  client,
  COMPLETITIONS_TABLE_ID,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
  RealTimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const [focusedHabitButton, setFocusedHabitButton] = useState<
    "all" | "active" | "completed"
  >("all");
  const router = useRouter();

  // use a useRef so when an action is performed, it reflects automatically rather than waiting for another
  // render to reflect the changes like a useState
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

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
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETITIONS_TABLE_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealTimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletitions();
          }
        }
      );

      fetchHabits();
      fetchCompletitions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      // fetch all the docs of the collection
      const response = await databases.listDocuments<Habit>(
        DATABASE_ID,
        HABITS_TABLE_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      // console.log(response.documents);
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompletitions = async () => {
    try {
      // setting today to 0:00 time of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // fetch all the docs of the collection
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        COMPLETITIONS_TABLE_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      // console.log(response.documents);
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions?.map((h) => h.habit_id));
    } catch (error) {
      console.error(error);
    }
  };

  const isHabitCompleted = (habitId: string) => {
    return completedHabits?.includes(habitId);
  };

  const renderLeftAction = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons
        name="check-circle-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );

  const renderRightAction = () => (
    <View style={styles.swipeActionRight}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_TABLE_ID, id);
    } catch (error) {
      console.error(error);
    }
    console.log("deleted habit");
  };

  const handleCompleteHabit = async (id: string) => {
    // check if user exists, if habit has been completed today already
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();
      // must pass in a unique id since you are creating a new entry to completitions
      await databases.createDocument(
        DATABASE_ID,
        COMPLETITIONS_TABLE_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );
      console.log("passed creation");
      // find the habit that is needed to complete and update
      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;
      await databases.updateDocument(DATABASE_ID, HABITS_TABLE_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
      console.log("completed habit");
    } catch (error) {
      console.error(error);
    }
  };

  const filteredHabits = habits?.filter((habit) => {
    const completed = isHabitCompleted(habit.$id);

    if (focusedHabitButton === "all") return true;
    if (focusedHabitButton === "active") return !completed;
    if (focusedHabitButton === "completed") return completed;

    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} variant="headlineSmall">
          Today's Habits
        </Text>
        <Button
          labelStyle={styles.signOutBtn}
          mode="text"
          onPress={signOut}
          icon={"logout"}
        >
          Sign Out
        </Button>
      </View>
      <View style={styles.habitButtons}>
        <Button
          style={styles.habitButton}
          labelStyle={styles.habitButtonLabel}
          mode={focusedHabitButton === "all" ? "contained-tonal" : "elevated"}
          onPress={() => setFocusedHabitButton("all")}
        >
          All
        </Button>
        <Button
          style={styles.habitButton}
          labelStyle={styles.habitButtonLabel}
          mode={
            focusedHabitButton === "active" ? "contained-tonal" : "elevated"
          }
          onPress={() => setFocusedHabitButton("active")}
        >
          Active
        </Button>
        <Button
          style={styles.habitButton}
          labelStyle={styles.habitButtonLabel}
          mode={
            focusedHabitButton === "completed" ? "contained-tonal" : "elevated"
          }
          onPress={() => setFocusedHabitButton("completed")}
        >
          Completed
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Habits yet. Add your first Habit!
            </Text>
          </View>
        ) : (
          filteredHabits?.map((habit, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              // render how the card is going to look when swiping
              // functions handle this
              renderLeftActions={renderLeftAction}
              renderRightActions={renderRightAction}
              onSwipeableOpen={(direction) => {
                if (direction === "right") {
                  // pass in the habit id so we know which habit
                  handleDeleteHabit(habit.$id);
                } else if (direction === "left") {
                  handleCompleteHabit(habit.$id);
                }

                // close the current habit that was swiped
                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Pressable
                onPress={() => router.push(`/habit-details/${habit.$id}`)}
              >
                <Surface
                  style={[
                    styles.card,
                    isHabitCompleted(habit.$id) && styles.completedCard,
                  ]}
                  elevation={0}
                >
                  <View key={habit.$id} style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {habit.title} {habit.emote_pic}
                    </Text>
                    <Text style={styles.cardDescription}>
                      {habit.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      {/* <View style={styles.cardStreak}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={18}
                          color={"#ff9800"}
                        />
                        <Text style={styles.streakText}>
                          {habit.streak_count} day streak
                        </Text>
                      </View> */}
                      <View style={styles.cardFreq}>
                        <Text style={styles.freqText}>
                          {habit.frequency.charAt(0).toUpperCase() +
                            habit.frequency.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              </Pressable>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "f5f5f5",
    // justifyContent: "center",
    // alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  habitButtons: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  habitButton: {
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  habitButtonLabel: {
    fontSize: 12,
    paddingVertical: 0,
    // paddingHorizontal: 4,
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
  },
  signOutBtn: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#ece0f3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: "#cac8cc",
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
    marginRight: 10,
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardStreak: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardFreq: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  freqText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
  swipeActionLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "#e53936",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
