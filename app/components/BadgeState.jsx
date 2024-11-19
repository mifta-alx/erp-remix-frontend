import { twMerge } from "tailwind-merge";

const BadgeState = ({ currentState = 1, status = "process" }) => {
  const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
  const stateColor = {
    1: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", // draft, confirmed, in progress, done, cancelled
    2: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    4: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    5: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };
  const failedColor =
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  const colorClasses =
    status !== "failed" ? stateColor[currentState] : failedColor;

  const steps = {
    1: "Draft",
    2: "Confirmed",
    3: "In Progress",
    4: "In Progress",
    5: "Done",
  };
  const label = status !== "failed" ? steps[currentState] : "Cancelled";
  return <span className={twMerge(baseClasses, colorClasses)}>{label}</span>;
};

export default BadgeState;
