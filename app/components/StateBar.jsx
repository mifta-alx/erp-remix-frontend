const StateBar = ({ data, status, total }) => {
  const percentage = (data / total) * 100;
  return (
    <div className="flex flex-row gap-4 items-center min-w-48">
      <p className="text-[15px] text-gray-700 w-10">
        <span className="font-medium">{percentage}</span>%
      </p>
      <div className="w-2/3 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full ${
            status !== "failed"
              ? "bg-primary-500 dark:bg-primary-700"
              : "bg-red-500 dark:bg-red-700"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StateBar;
