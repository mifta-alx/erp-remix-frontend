import { twMerge } from "tailwind-merge";

const DateItem = ({
  dateObj,
  onClick,
  isFromPreviousMonth,
  isFromNextMonth,
  selected,
}) => {
  const displayDate = dateObj ? dateObj.getDate() : null;

  return (
    <button
      onClick={onClick}
      className={twMerge(
        "items-center flex justify-center cursor-pointer rounded-lg font-medium text-sm",
        selected && "bg-primary-600 dark:bg-blue-600",
        selected
          ? "text-white"
          : isFromPreviousMonth || isFromNextMonth
          ? "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
          : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
      )}
    >
      <span className="block flex-1 leading-9">
        {displayDate !== null ? displayDate : ""}
      </span>
    </button>
  );
};

export default DateItem;
