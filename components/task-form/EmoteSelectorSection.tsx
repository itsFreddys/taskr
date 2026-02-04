import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export const EmoteSelectorSection = ({ emoji, onPress, theme }: any) => (
  <View style={styles.center}>
    <TouchableOpacity onPress={onPress} style={[styles.emojiContainer, { backgroundColor: theme.colors.surface }]} activeOpacity={0.7}>
      <Text style={styles.emojiDisplay}>{emoji}</Text>
      <View style={[styles.addIconBadge, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", marginBottom: 24, marginTop: 10 },
  emojiContainer: { width: 100, height: 100, justifyContent: "center", alignItems: "center", borderRadius: 50 },
  emojiDisplay: { fontSize: 72, textAlign: "center", includeFontPadding: false },
  addIconBadge: { position: "absolute", bottom: 0, right: 0, borderRadius: 15 },
});