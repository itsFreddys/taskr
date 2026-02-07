import { useAuth } from "@/lib/auth-context";
import { useAppTheme } from "@/lib/theme-context";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.75;

export function GlobalSettingsMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { signOut } = useAuth();
  const { themeMode, setThemeMode } = useAppTheme();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [themeExpanded, setThemeExpanded] = useState(false);

  // --- Animation Refs ---
  // slideAnim: 0 is fully visible, DRAWER_WIDTH is off-screen
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 🟢 Smooth Parallel Entry: Slide + Fade
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Standard "Out" Easing
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 🟢 Smooth Parallel Exit
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease), // Accelerates as it leaves
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset local UI states after animation finishes
        setThemeExpanded(false);
      });
    }
  }, [visible]);

  const handleLogoutPress = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getThemeIcon = (mode: string) => {
    if (mode === "light") return "white-balance-sunny";
    if (mode === "dark") return "moon-waning-crescent";
    return "cellphone-cog";
  };

  return (
    <Portal>
      {/* 🟢 Animated Backdrop: Always mounted, visibility handled by opacity and pointerEvents */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* 🟢 Animated Drawer */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Settings</Text>
          <IconButton icon="close" onPress={onClose} />
        </View>

        <Divider />

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.menuList}>
            {/* Theme Accordion */}
            <List.Accordion
              title="Appearance"
              description={
                themeMode.charAt(0).toUpperCase() + themeMode.slice(1)
              }
              left={(props) => (
                <List.Icon {...props} icon={getThemeIcon(themeMode)} />
              )}
              expanded={themeExpanded}
              onPress={() => setThemeExpanded(!themeExpanded)}
            >
              <List.Item
                title="Light"
                onPress={() => setThemeMode("light")}
                left={(props) => (
                  <List.Icon {...props} icon="white-balance-sunny" />
                )}
                right={(props) =>
                  themeMode === "light" && (
                    <List.Icon
                      {...props}
                      icon="check"
                      color={theme.colors.primary}
                    />
                  )
                }
              />
              <List.Item
                title="Dark"
                onPress={() => setThemeMode("dark")}
                left={(props) => (
                  <List.Icon {...props} icon="moon-waning-crescent" />
                )}
                right={(props) =>
                  themeMode === "dark" && (
                    <List.Icon
                      {...props}
                      icon="check"
                      color={theme.colors.primary}
                    />
                  )
                }
              />
              <List.Item
                title="System"
                onPress={() => setThemeMode("system")}
                left={(props) => <List.Icon {...props} icon="cellphone-cog" />}
                right={(props) =>
                  themeMode === "system" && (
                    <List.Icon
                      {...props}
                      icon="check"
                      color={theme.colors.primary}
                    />
                  )
                }
              />
            </List.Accordion>

            <Divider />

            <List.Item
              title="Account Settings"
              left={(props) => (
                <List.Icon {...props} icon="account-circle-outline" />
              )}
            />
            <List.Item
              title="Notifications"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
            />
            <List.Item
              title="Help & Support"
              left={(props) => (
                <List.Icon {...props} icon="help-circle-outline" />
              )}
            />

            <Divider />

            <List.Item
              title="Logout"
              titleStyle={{ color: theme.colors.error }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="logout"
                  color={theme.colors.error}
                />
              )}
              onPress={handleLogoutPress}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Taskr v1.0.4</Text>
        </View>
      </Animated.View>
    </Portal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 999,
    },
    drawerContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      zIndex: 1000,
      height: height,
      // Add shadow for better depth
      shadowColor: "#000",
      shadowOffset: { width: -5, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 24,
    },
    drawerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    drawerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.onSurface,
    },
    scrollContent: {
      flexGrow: 1,
    },
    menuList: {
      paddingBottom: 20,
    },
    footer: {
      padding: 20,
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(0,0,0,0.1)",
      marginBottom: 20,
    },
    versionText: {
      fontSize: 12,
      opacity: 0.5,
    },
  });
