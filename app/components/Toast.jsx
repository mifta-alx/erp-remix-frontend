import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Check, Megaphone, X } from "lucide-react";

const Toast = ({
  title = "Item moved successfully.",
  status = "success",
  position = "top-right",
  dismissable = true,
  isVisible,
  onDismiss,
  ...props
}) => {
  const [isAnimating, setIsAnimating] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const baseClasses =
    "flex items-center w-full max-w-sm p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 transition-opacity duration-300 ease-in-out";

  const statusClasses = {
    success: "bg-green-100 dark:bg-green-800",
    danger: "bg-red-100 dark:bg-red-800",
    warning: "bg-amber-100 dark:bg-amber-800",
  };
  const iconClasses = {
    success:
      "bg-green-600 text-green-100 dark:text-green-800 dark:bg-green-200",
    danger: "bg-red-600 text-red-100 dark:text-red-800 dark:bg-red-200",
    warning:
      "bg-amber-600 text-amber-100 dark:text-amber-800 dark:bg-amber-200",
  };
  const icon = {
    success: <Check size={10} strokeWidth={5} />,
    danger: <X size={10} strokeWidth={5} />,
    warning: <Megaphone size={10} strokeWidth={5} />,
  };

  const positionClasses = {
    "top-right": "top-24 right-9",
    "top-left": "top-24 left-9",
    "bottom-right": "bottom-12 right-9",
    "bottom-left": "bottom-12 left-9",
  };
  if (!isVisible && !isAnimating) return null;
  return (
    <div
      className={twMerge("fixed z-50", positionClasses[position])}
      {...props}
    >
      <div
        className={twMerge(
          baseClasses,
          isAnimating
            ? isVisible
              ? "animate-fade-in"
              : "animate-fade-out" // Add animation classes
            : "opacity-0"
        )}
      >
        <div
          className={twMerge(
            "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ",
            statusClasses[status]
          )}
        >
          <div
            className={twMerge(
              "w-5 h-5 flex items-center justify-center rounded-full",
              iconClasses[status]
            )}
          >
            {icon[status]}
          </div>
        </div>
        <div className="mx-3 text-sm font-normal">{title}</div>
        {dismissable && (
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={onDismiss}
          >
            <X weight="bold" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
