import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    headerTitle: "#f3f1f3",
    primary: "#7c4dff",
    background: "#ffffff",
    surface: "#f5f5f5",
    // --- Text Colors ---
    onSurface: "#1C1B1F", // Main headings / body text (Deep Black/Grey)
    onSurfaceVariant: "#49454F", // Secondary text / descriptions (Muted Grey)
    onPrimary: "#ffffff", // Text that sits ON TOP of purple buttons
    outline: "#79747E", // Faded labels or placeholder text
    error: "#B3261E", // Error messages
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    headerTitle: "#f3f1f3",
    primary: "#7c4dff",
    // primary: "#b39ddb",
    background: "#121212",
    surface: "#1e1e1e",
    // --- Text Colors ---
    onSurface: "#E6E1E5", // Main headings / body text (Off-white)
    onSurfaceVariant: "#CAC4D0", // Secondary text / descriptions (Light Grey)
    onPrimary: "#381E72", // Text that sits ON TOP of light purple buttons
    outline: "#938F99", // Faded labels or placeholder text
    error: "#F2B8B5", // Error messages (Light Red for dark bg)
  },
};
