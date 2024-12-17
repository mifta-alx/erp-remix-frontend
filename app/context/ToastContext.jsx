import { createContext, useCallback, useContext, useState } from "react";
import { Toast } from "@components/index.js";

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback(
    (
      title,
      status = "danger",
      position = "top-right",
      dismissable = true,
      duration = 2000
    ) => {
      const newToast = { title, status, position, dismissable };
      setToast(newToast);
      setIsVisible(true);

      // set a timeout to hide the toast after the duration
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    },
    []
  );

  const removeToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Toast
          title={toast.title}
          status={toast.status}
          dismissable={toast.dismissable}
          isVisible={isVisible}
          onDismiss={removeToast}
        />
      )}
    </ToastContext.Provider>
  );
};
