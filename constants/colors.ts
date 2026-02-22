const palette = {
  emerald: "#10B981",
  emeraldDark: "#059669",
  gold: "#F59E0B",
  navy: "#0F172A",
  navyLight: "#1E293B",
  slate: "#334155",
  slateLight: "#94A3B8",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  cardBg: "#1E293B",
  red: "#EF4444",
  redLight: "#FEE2E2",
  greenLight: "#D1FAE5",
  border: "#334155",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  searchBg: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  headerBg: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: palette.offWhite,
  surface: palette.white,
  surfaceAlt: palette.offWhite,
  text: palette.navy,
  textSecondary: palette.slateLight,
  textMuted: palette.textMuted,
  border: "#E2E8F0",
  divider: "#F1F5F9",
  searchBg: palette.offWhite,
  inputBg: palette.white,
  inputBorder: "#E2E8F0",
  tabBarBg: palette.white,
  headerBg: palette.white,
  shadow: "#000",
};

const darkTheme: ThemeColors = {
  background: "#0B0F1A",
  surface: "#141926",
  surfaceAlt: "#1A2035",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#1E293B",
  divider: "#1E293B",
  searchBg: "#1A2035",
  inputBg: "#141926",
  inputBorder: "#1E293B",
  tabBarBg: "#0B0F1A",
  headerBg: "#141926",
  shadow: "#000",
};

export default {
  light: {
    text: palette.navy,
    background: palette.offWhite,
    tint: palette.emerald,
    tabIconDefault: palette.slateLight,
    tabIconSelected: palette.emerald,
  },
  palette,
  lightTheme,
  darkTheme,
};
