import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface Sound {
  id: string;
  icon: string;
}

interface SoundscapeSelectorProps {
  activeSoundId: string | null;
  onSelectSound: (id: string) => void;
}

const SOUNDS: Sound[] = [
  { id: "mute", icon: "volume-off" },
  { id: "rain", icon: "weather-pouring" },
  { id: "lofi", icon: "cassette" },
  { id: "forest", icon: "tree" },
  { id: "noise", icon: "waves" },
];

export const SoundscapeSelector = ({
  activeSoundId,
  onSelectSound,
}: SoundscapeSelectorProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.soundscapeRow}>
      {SOUNDS.map((sound) => (
        <IconButton
          key={sound.id}
          icon={sound.icon}
          size={24}
          mode={activeSoundId === sound.id ? "contained" : "contained-tonal"}
          style={
            activeSoundId === sound.id
              ? styles.activeButton
              : styles.soundButton
          }
          iconColor={
            activeSoundId === sound.id
              ? theme.colors.onPrimary
              : theme.colors.primary
          }
          onPress={() => onSelectSound(sound.id)}
        />
      ))}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    soundscapeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginTop: 40,
      marginBottom: 20,
    },
    soundButton: {
      margin: 0,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    activeButton: {
      margin: 0,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
  });
