import { DATABASE_ID, databases, HABIT_NOTES_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context"; // Import Auth to check ownership
import { Note } from "@/types/database.type";
import { SimpleLineIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard"; // Import Clipboard
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  IconButton,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";

import { useRouter } from "expo-router";
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
  const { user } = useAuth();
  const [noteMenuOpen, setNoteMenuOpen] = useState(false);
  const [noteMenuPosition, setNoteMenuPosition] = useState({ top: 0, left: 0 });

  // edit states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedDescription, setEditedDescription] = useState(note.description);

  const isOwner = user?.$id === note.user_id;

  const formattedDate = note?.updated_at
    ? setupDateTime(note.updated_at)
    : ["--", "--"];

  // --- Handlers ---
  const handleCopyNote = async () => {
    await Clipboard.setStringAsync(note.description);
    setNoteMenuOpen(false);
    // Optional: Add a Toast or Alert to let user know it copied
  };

  const handleSaveEdit = async () => {
    // 1. Avoid API call if no changes made
    if (editedDescription.trim() === note.description) {
      setIsEditModalVisible(false);
      return;
    }

    try {
      await databases.updateDocument(
        DATABASE_ID,
        HABIT_NOTES_TABLE_ID,
        note.$id,
        {
          description: editedDescription,
          updated_at: new Date().toISOString(),
        }
      );
      setIsEditModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not update note.");
    }
  };

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
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Note</Text>
              <IconButton
                icon="close"
                onPress={() => setIsEditModalVisible(false)}
              />
            </View>

            <TextInput
              mode="outlined"
              multiline
              value={editedDescription}
              onChangeText={setEditedDescription}
              style={styles.editInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSaveEdit}>
                Save
              </Button>
            </View>
          </Surface>
        </SafeAreaView>
      </Modal>

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
                // Only show Edit/Delete if user owns the note
                ...(isOwner
                  ? [
                      {
                        label: "Edit",
                        onPress: () => {
                          setNoteMenuOpen(false);
                          setIsEditModalVisible(true);
                        },
                      },
                    ]
                  : []),
                {
                  label: "Copy",
                  onPress: handleCopyNote,
                },
                ...(isOwner
                  ? [
                      {
                        label: "Delete",
                        danger: true,
                        onPress: handleDeleteNote,
                      },
                    ]
                  : []),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  editInput: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
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
