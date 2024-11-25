import { twMerge } from "tailwind-merge";
import DateInputControl from "@components/DateInput/DateInputControl.jsx";

const Week = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sat"];

const positionClasses = {
  "bottom-right": "top-10 right-0",
  "bottom-left": "top-10 left-0",
  "top-right": "bottom-10 right-0",
  "top-left": "bottom-10 left-0",
};

const DateInputPopup = ({
  position = "bottom-right",
  currentMonth,
  currentYear,
  navigateMonth,
  children,
}) => {
  return (
    <div
      className={twMerge(
        "absolute my-1.5 z-30 block",
        positionClasses[position]
      )}
    >
      <div className="inline-block rounded-lg bg-white dark:bg-gray-700 shadow-lg p-4 w-max">
        <DateInputControl
          currentMonth={currentMonth}
          currentYear={currentYear}
          navigateToNextMonth={() => navigateMonth(1)}
          navigateToPrevMonth={() => navigateMonth(-1)}
        />
        <div className="grid grid-cols-7 mb-1">
          {Week.map((day) => (
            <span
              className="text-center h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400"
              key={day}
            >
              {day}
            </span>
          ))}
        </div>
        <div className="w-64 grid grid-cols-7">{children}</div>
      </div>
    </div>
  );
};

export default DateInputPopup;
