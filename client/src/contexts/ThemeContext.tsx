import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ColorTheme = "purple" | "blue" | "green" | "orange" | "pink";

interface ThemeColors {
  primary: string;
  primaryHover: string;
  gradient: string;
}

const colorThemes: Record<ColorTheme, ThemeColors> = {
  purple: {
    primary: "rgb(147, 51, 234)", // purple-600
    primaryHover: "rgb(126, 34, 206)", // purple-700
    gradient: "linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))", // purple-600 to pink-600
  },
  blue: {
    primary: "rgb(37, 99, 235)", // blue-600
    primaryHover: "rgb(29, 78, 216)", // blue-700
    gradient: "linear-gradient(to right, rgb(37, 99, 235), rgb(59, 130, 246))", // blue-600 to blue-500
  },
  green: {
    primary: "rgb(22, 163, 74)", // green-600
    primaryHover: "rgb(21, 128, 61)", // green-700
    gradient: "linear-gradient(to right, rgb(22, 163, 74), rgb(34, 197, 94))", // green-600 to green-500
  },
  orange: {
    primary: "rgb(234, 88, 12)", // orange-600
    primaryHover: "rgb(194, 65, 12)", // orange-700
    gradient: "linear-gradient(to right, rgb(234, 88, 12), rgb(251, 146, 60))", // orange-600 to orange-400
  },
  pink: {
    primary: "rgb(219, 39, 119)", // pink-600
    primaryHover: "rgb(190, 24, 93)", // pink-700
    gradient: "linear-gradient(to right, rgb(219, 39, 119), rgb(236, 72, 153))", // pink-600 to pink-500
  },
};

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme?: () => void;
  setColorTheme: (color: ColorTheme) => void;
  switchable: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem("colorTheme");
    return (stored as ColorTheme) || "purple";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  useEffect(() => {
    localStorage.setItem("colorTheme", colorTheme);

    // Apply CSS variables for current theme
    const root = document.documentElement;
    const colors = colorThemes[colorTheme];
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-hover', colors.primaryHover);
    root.style.setProperty('--theme-gradient', colors.gradient);
  }, [colorTheme]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const handleSetColorTheme = (color: ColorTheme) => {
    setColorTheme(color);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      colorTheme,
      toggleTheme,
      setColorTheme: handleSetColorTheme,
      switchable,
      colors: colorThemes[colorTheme],
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
