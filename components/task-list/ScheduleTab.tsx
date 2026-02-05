import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ScheduleTab = ({ onScroll, headerHeight }: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const TOTAL_SPACER_HEIGHT = headerHeight + 48;

  return (
    <Animated.FlatList
      data={[]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={<View style={{ height: TOTAL_SPACER_HEIGHT }} />}
      ListEmptyComponent={
        <View
          style={[
            styles.emptyCard,
            { height: SCREEN_HEIGHT - TOTAL_SPACER_HEIGHT - 100 },
          ]}
        >
          <Text style={styles.emptyText}>No Schedule tracked.</Text>
        </View>
      }
      renderItem={null}
    />
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    contentContainer: { paddingBottom: 5, minHeight: SCREEN_HEIGHT },
    emptyCard: {
      flex: 1,
      margin: 16,
      backgroundColor: theme.colors.surface,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: { color: "#aaa" },
  });
