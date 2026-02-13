import { MaterialCommunityIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          // backgroundColor: "#f5f5f5",
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        // tabBarActiveTintColor: "#6200ee",
        tabBarActiveTintColor: theme.colors.primary,
        // tabBarInactiveTintColor: "#666666",
        tabBarInactiveTintColor: theme.colors.outline,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Daily Tasks",
          tabBarIcon: ({ color, size }) => (
            // <FontAwesome name="home" size={24} color={color} />
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size }) => (
            // <FontAwesome name="home" size={24} color={color} />
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, size }) => (
            // <FontAwesome name="home" size={24} color={color} />
            <MaterialCommunityIcons name="apps" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            // <FontAwesome name="home" size={24} color={color} />
            <Octicons name="person-fill" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
