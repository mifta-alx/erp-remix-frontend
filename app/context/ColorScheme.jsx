import { createContext, useContext, useState, useEffect } from "react";

const ColorSchemeContext = createContext();

export const ColorSchemeProvider = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState(initialTheme || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.cookie = `theme=${theme};path=/;max-age=31536000`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ColorSchemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => useContext(ColorSchemeContext);
