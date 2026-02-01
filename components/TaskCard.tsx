import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Checkbox, Surface, Text, useTheme } from "react-native-paper";
import CustomMenu from "./CustomMenu";

export const TaskCard = ({
  task,
  onPress,
  onToggleComplete,
  onMoveToTomorrow,
  onRemove,
  style,
}: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isCompleted = task.status === "completed";

  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handleToggle = () => {
    !isCompleted
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.selectionAsync();
    onToggleComplete?.(task.$id, task.status);
  };

  const onLongPressLeft = (event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPos({ top: pageY, left: pageX });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLeftVisible(true);
  };

  const onLongPressRight = (event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPos({ top: pageY, left: pageX - 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRightVisible(true);
  };

  return (
    <Surface
      style={[styles.card, isCompleted && styles.completedCard, style]}
      elevation={isCompleted ? 0 : 1}
    >
      {/* 🟢 Inner container to fix the Shadow/Overflow warning */}
      <View style={styles.innerContainer}>
        <View style={styles.cardLayout}>
          {/* 🟢 LEFT ZONE: Tap to Complete | Long Press for Menu */}
          <View style={styles.flexFill}>
            <CustomMenu
              visible={leftVisible}
              onDismiss={() => setLeftVisible(false)}
              position={menuPos}
              items={[
                {
                  label: isCompleted ? "Mark Active" : "Mark Complete",
                  onPress: handleToggle,
                },
                {
                  label: "Postpone Tomorrow",
                  onPress: () => onMoveToTomorrow(task.$id),
                },
                {
                  label: "Remove Task",
                  onPress: () => onRemove(task.$id),
                  danger: true,
                },
              ]}
              anchor={
                <TouchableOpacity
                  style={styles.leftZone}
                  onPress={handleToggle} // 🟢 Changed to handleToggle
                  onLongPress={onLongPressLeft}
                  delayLongPress={300}
                >
                  {isCompleted && (
                    <View style={styles.actionZone}>
                      {/* Checkbox stays for visual confirmation, but tap is handled by the zone */}
                      <Checkbox
                        status="checked"
                        onPress={handleToggle}
                        color={theme.colors.primary}
                      />
                    </View>
                  )}

                  <View style={styles.infoZone}>
                    <View style={styles.titleRow}>
                      <Text style={styles.emoji}>{task.emotePic || "✅"}</Text>
                      <Text
                        style={[
                          styles.title,
                          isCompleted && styles.completedText,
                        ]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              }
            />
          </View>

          {/* 🟢 RIGHT ZONE: Tap for Details | Long Press for Timer/More */}
          {!isCompleted && (
            <View style={styles.rightContainer}>
              <CustomMenu
                visible={rightVisible}
                onDismiss={() => setRightVisible(false)}
                position={menuPos}
                items={[
                  {
                    label: "Start Timer",
                    onPress: () => console.log("Start Timer"),
                  },
                  { label: "Edit Task", onPress: onPress },
                ]}
                anchor={
                  <TouchableOpacity
                    style={styles.rightZone}
                    onPress={onPress} // 🟢 Stays as details/edit
                    onLongPress={onLongPressRight}
                    delayLongPress={300}
                  >
                    <MaterialCommunityIcons
                      name="timer-outline"
                      size={24}
                      color={theme.colors.outlineVariant}
                    />
                  </TouchableOpacity>
                }
              />
            </View>
          )}
        </View>
      </View>
    </Surface>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
    },
    innerContainer: {
      borderRadius: 16,
      overflow: "hidden", // 🟢 Clipping happens here, silencing the warning
      flex: 1,
    },
    completedCard: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.6,
    },
    cardLayout: {
      flexDirection: "row",
      height: 72,
      alignItems: "center",
    },
    flexFill: { flex: 1 },
    rightContainer: { width: 60 },
    leftZone: {
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
    },
    rightZone: {
      width: 60,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.surfaceVariant,
    },
    actionZone: {
      marginRight: 8,
      justifyContent: "center",
    },
    infoZone: {
      flex: 1,
      justifyContent: "center", // 🟢 Absolute vertical center for text
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    emoji: { fontSize: 18, marginRight: 8 },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: theme.colors.outline,
    },
  });
