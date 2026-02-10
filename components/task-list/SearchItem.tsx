import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";

interface SearchItemProps {
  item: any;
  onEdit: (item: any) => void;
  onQuickAdd: (id: string) => void;
}

export const SearchItem = ({ item, onEdit, onQuickAdd }: SearchItemProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onEdit(item)}
        style={styles.editZone}
        android_ripple={{ color: theme.colors.surfaceVariant }}
      >
        <View style={styles.infoWrapper}>
          <Text style={styles.emoteText}>{item.emotePic || "📅"}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.desc}>
              Last active: {new Date(item.$updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.quickAddZone}>
        <IconButton
          icon="plus-circle-outline"
          iconColor={theme.colors.primary}
          size={24}
          onPress={() => onQuickAdd(item.$id)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", height: 60, alignItems: "center" },
  editZone: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    paddingLeft: 16,
  },
  infoWrapper: { flexDirection: "row", alignItems: "center" },
  textContainer: { marginLeft: 12, flex: 1 },
  emoteText: { fontSize: 22, width: 30, textAlign: "center" },
  title: { fontSize: 14, fontWeight: "600" },
  desc: { fontSize: 11, opacity: 0.6 },
  quickAddZone: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
