import { ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DateInputControl = ({
  navigateToNextMonth,
  navigateToPrevMonth,
  currentMonth,
  currentYear,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <button
        className="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
        type="button"
        onClick={navigateToPrevMonth}
        aria-label="Previous Month"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-center font-semibold text-gray-900 dark:text-white text-sm">
        {`${monthNames[currentMonth]} ${currentYear}`}
      </span>
      <button
        className="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
        type="button"
        onClick={navigateToNextMonth}
        aria-label="Next Month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateInputControl;
