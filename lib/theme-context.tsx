import { darkTheme, lightTheme } from "@/constants/Themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  // Load saved preference on boot
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Explicitly type the result of the promise
        const saved = await AsyncStorage.getItem("user-theme");
        
        if (saved) {
          // Cast the string to our specific ThemeMode type
          setThemeMode(saved as ThemeMode);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    };
  
    loadTheme();
  }, []);

  const handleSetTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem("user-theme", mode);
  };

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode: handleSetTheme, isDark }}
    >
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useAppTheme must be used within ThemeProvider");
  return context;
};
