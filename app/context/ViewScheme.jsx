import { createContext, useContext, useEffect, useState } from "react";

const ViewContext = createContext();

export const useViewContext = () => useContext(ViewContext);

export const ViewProvider = ({ children }) => {
  const [view, setView] = useState("gallery");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("view");
      if (savedView) {
        setView(savedView);
      }
      setIsLoaded(true);
    }
  }, []);

  const changeView = (newView) => {
    setView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem("view", newView);
    }
  };

  if (!isLoaded) {
    // Tampilkan loading atau komponen kosong saat data belum siap
    return null; //  bisa menampilkan spinner/placeholder
  }

  return (
    <ViewContext.Provider value={{ view, changeView }}>
      {children}
    </ViewContext.Provider>
  );
};
