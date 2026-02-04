import React, { useState } from "react";
import { Appbar, useTheme } from "react-native-paper";
// ✅ Import useSegments to track path changes
import { useRouter, useSegments } from "expo-router";
import { GlobalSettingsMenu } from "./GlobalSettingsMenu";
import { getHeaderTitle } from "@react-navigation/elements";

export function CustomHeader({ options, route, back }: any) {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  // ✅ This hook forces the header to re-render whenever the URL/Path changes
  const segments = useSegments();

  // ✅ 1. Determine the active tab name from the path segments
  // Path: /(tabs)/streaks -> segments will be ["(tabs)", "streaks"]
  const activeTab = segments[1] || "index";

  // ✅ 2. Map the technical filenames to the titles
  const tabTitleMap: Record<string, string> = {
    index: "Today",
    "": "Today", // Fallback for the root of tabs
    streaks: "Streaks",
    "add-habit": "Add Habit",
    profile: "Profile",
  };

  // ✅ 3. Determine Final Title
  // If we are in the (tabs) group, use the map. Otherwise, use standard title.
  const isInsideTabs = segments[0] === "(tabs)";
  const title = isInsideTabs
    ? tabTitleMap[activeTab] || "Today"
    : getHeaderTitle(options, route.name);

  return (
    <>
      <Appbar.Header 
      elevated 
      style={{ 
        backgroundColor: theme.colors.primary,
        height: 42,
        justifyContent: 'center'
        }}>
        {back ? (
          <Appbar.BackAction color="white" size={20} onPress={() => router.back()} />
        ) : null}

        {/* title  */}
        <Appbar.Content
          title={title} // ✅ Now updates instantly on tab tap
          color="white"
          titleStyle={{ 
            fontWeight: "bold",
            fontSize: 20,
            lineHeight: 20
          }}
        />
        {/* menu icon */}
        <Appbar.Action
          icon="menu"
          color="white"
          size={28}
          onPress={() => setMenuVisible(true)}
          style={{marginRight: 10}}
        />
      </Appbar.Header>

      <GlobalSettingsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}
