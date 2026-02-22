import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors, { ThemeColors } from "@/constants/colors";

const THEME_KEY = "usdt_app_theme";

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: Colors.lightTheme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const theme = isDark ? Colors.darkTheme : Colors.lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
