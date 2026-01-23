import { useAuth } from "@/lib/auth-context";
import { useAppTheme } from "@/lib/theme-context";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
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

export function GlobalSettingsMenu({ visible, onClose }: { visible: boolean, onClose: () => void }) {  
  const { user, signOut } = useAuth();
  // const [visible, setVisible] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);
  const { themeMode, setThemeMode } = useAppTheme();
  const theme = useTheme();

  // 1. Animation Logic
  // const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current; // Start off-screen to the right
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  // Trigger animation when 'visible' prop changes
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleLogoutPress = async () => {
    try {
      await signOut(); // This should trigger the router replace to /auth in your RouteGuard
      onClose();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const showDrawer = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setThemeExpanded(false);
    });
  };

  const getThemeIcon = (mode: string) => {
    if (mode === "light") return "white-balance-sunny";
    if (mode === "dark") return "moon-waning-crescent";
    return "cellphone-cog";
  };

  return (
        <Portal>
          {/* 2. Backdrop - Closes drawer on tap */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* 3. The Animated Drawer */}
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

            <ScrollView bounces={false}>
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
                      themeMode === "light" ? (
                        <List.Icon
                          {...props}
                          icon="check"
                          color={theme.colors.primary}
                        />
                      ) : null
                    }
                  />
                  <List.Item
                    title="Dark"
                    onPress={() => setThemeMode("dark")}
                    left={(props) => (
                      <List.Icon {...props} icon="moon-waning-crescent" />
                    )}
                    right={(props) =>
                      themeMode === "dark" ? (
                        <List.Icon
                          {...props}
                          icon="check"
                          color={theme.colors.primary}
                        />
                      ) : null
                    }
                  />
                  <List.Item
                    title="System"
                    onPress={() => setThemeMode("system")}
                    left={(props) => (
                      <List.Icon {...props} icon="cellphone-cog" />
                    )}
                    right={(props) =>
                      themeMode === "system" ? (
                        <List.Icon
                          {...props}
                          icon="check"
                          color={theme.colors.primary}
                        />
                      ) : null
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
                <List.Item
                title="Logout"
                titleStyle={{color: theme.colors.error}}
                left={props => <List.Icon {...props} icon="logout" color={theme.colors.error}/>}
                onPress={handleLogoutPress}/>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.versionText}>Taskr v1.0.4</Text>
            </View>
          </Animated.View>
        </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  menuButton: {
    margin: 0,
  },
  drawerContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    elevation: 16,
    zIndex: 1000,
    // Fix for visibility: ensure it spans the whole height
    height: height,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60, // Added padding for status bar area
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  menuList: {
    paddingBottom: 20,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
