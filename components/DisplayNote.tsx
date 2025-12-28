import { Note } from "@/types/database.type";
import { SimpleLineIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import CustomMenu from "./CustomMenu"; // Adjust path if needed

interface DisplayNoteProps {
  note: Note;
}

export const DisplayNote = ({ note }: DisplayNoteProps) => {
  const [noteMenuOpen, setNoteMenuOpen] = useState(false);
  const [noteMenuPosition, setNoteMenuPosition] = useState({ top: 0, left: 0 });

  return (
    <View>
      <Text style={styles.noteDate}>{note.last_updated}</Text>
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
                  onPress: () => console.log("delete"),
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
