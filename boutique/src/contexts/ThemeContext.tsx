import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ColorTheme, EventTheme } from "@plug-certifie/shared";

interface ThemeContextType {
  colors: ColorTheme;
  activeEvent: EventTheme | null;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultColors: ColorTheme = {
  textPrimary: "#000000",
  textSecondary: "#666666",
  textHeading: "#000000",
  backgroundColor: "#ffffff",
  cardBackground: "#ffffff",
  borderColor: "#e5e5e5",
  buttonText: "#ffffff",
  buttonBackground: "#000000",
  linkColor: "#0000ff",
  accentColor: "#000000",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ColorTheme>(defaultColors);
  const [activeEvent, setActiveEvent] = useState<EventTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        // Load colors
        const colorsResponse = await fetch(`${apiUrl}/settings?key=colorTheme`);
        const colorsData = await colorsResponse.json();
        if (colorsData.success && colorsData.data) {
          setColors({ ...defaultColors, ...colorsData.data });
        }

        // Load events and find active one
        const eventsResponse = await fetch(`${apiUrl}/events`);
        const eventsData = await eventsResponse.json();
        if (eventsData.success && eventsData.data) {
          const events: EventTheme[] = eventsData.data;
          const now = new Date();
          const activeEvents = events.filter(
            (e) =>
              e.enabled &&
              new Date(e.startDate) <= now &&
              new Date(e.endDate) >= now
          );

          if (activeEvents.length > 0) {
            // Sort by priority (higher first)
            activeEvents.sort((a, b) => b.priority - a.priority);
            setActiveEvent(activeEvents[0]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading theme:", error);
        setLoading(false);
      }
    };

    loadTheme();

    // Refresh theme every 30 seconds
    const interval = setInterval(loadTheme, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--text-primary", colors.textPrimary);
    root.style.setProperty("--text-secondary", colors.textSecondary);
    root.style.setProperty("--text-heading", colors.textHeading);
    root.style.setProperty("--background-color", colors.backgroundColor);
    root.style.setProperty("--card-background", colors.cardBackground);
    root.style.setProperty("--border-color", colors.borderColor);
    root.style.setProperty("--button-text", colors.buttonText);
    root.style.setProperty("--button-background", colors.buttonBackground);
    root.style.setProperty("--link-color", colors.linkColor);
    root.style.setProperty("--accent-color", colors.accentColor);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, activeEvent, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

