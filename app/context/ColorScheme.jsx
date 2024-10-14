import { createContext, useContext, useEffect, useState } from "react";

const ColorSchemeContext = createContext();

export const ColorSchemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState("light");

  useEffect(() => {
    const savedColorScheme = localStorage.getItem("colorScheme") || "light";
    setColorScheme(savedColorScheme);
    document.body.classList.toggle("dark", savedColorScheme === "dark");
  }, []);

  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newColorScheme);
    localStorage.setItem("colorScheme", newColorScheme);
    document.body.classList.toggle("dark", newColorScheme === "dark");
  };

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => useContext(ColorSchemeContext);
