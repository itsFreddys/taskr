import { DATABASE_ID, databases, HABIT_NOTES_TABLE_ID } from "@/lib/appwrite";
import { Note } from "@/types/database.type";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import CustomMenu from "./CustomMenu"; // Adjust path if needed

interface DisplayNoteProps {
  note: Note;
}

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

export const DisplayNote = ({ note }: DisplayNoteProps) => {
  const router = useRouter();
  const [noteMenuOpen, setNoteMenuOpen] = useState(false);
  const [noteMenuPosition, setNoteMenuPosition] = useState({ top: 0, left: 0 });

  const formattedDate = note?.updated_at
    ? setupDateTime(note.updated_at)
    : ["--", "--"];

  // --- Handlers ---
  const handleDeleteNote = async () => {
    Alert.alert("Delete Note", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await databases.deleteDocument(
              DATABASE_ID,
              HABIT_NOTES_TABLE_ID,
              note.$id as string
            );
            // router.back();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  return (
    <View>
      <Text style={styles.noteDate}>
        {formattedDate[0]}, {formattedDate[1]}
      </Text>
      <Surface style={styles.noteCard} elevation={0}>
        <View style={styles.noteContent}>
          <View style={styles.menuAnchorContainer}>
            <CustomMenu
              visible={noteMenuOpen}
              onDismiss={() => setNoteMenuOpen(false)}
              position={noteMenuPosition}
              anchor={
                <TouchableOpacity
                  onPress={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    setNoteMenuPosition({ top: pageY, left: pageX - 180 });
                    setNoteMenuOpen(true);
                  }}
                  style={styles.noteOptionsButton}
                >
                  <SimpleLineIcons name="options" size={18} color="#6c6c80" />
                </TouchableOpacity>
              }
              items={[
                { label: "Edit", onPress: () => console.log("edit") },
                { label: "Copy", onPress: () => console.log("copy") },
                {
                  label: "Delete",
                  danger: true,
                  onPress: handleDeleteNote,
                },
              ]}
            />
          </View>
          <Text style={styles.noteDescription}>{note.description}</Text>
          <Text style={styles.noteFooter}>{note.username}</Text>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  noteContent: { flex: 1, padding: 15, position: "relative" },
  noteDate: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: "center",
    color: "#6c6c80",
  },
  noteOptionsButton: { alignItems: "flex-end", marginRight: 15, marginTop: 8 },
  noteDescription: { fontSize: 15, marginVertical: 10, color: "#6c6c80" },
  noteFooter: { textAlign: "right", fontSize: 10, color: "#6c6c80" },
  menuAnchorContainer: { position: "absolute", top: 0, right: 0, zIndex: 10 },
});
