const ProgressBar = ({ data1, data2 }) => {
  const total = data1 + data2;
  const percentage1 = (data1 / total) * 100;
  const percentage2 = (data2 / total) * 100;

  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden flex flex-row items-center justify-center bg-gray-200 dark:bg-gray-700 skeleton-box dark:skeleton-box-dark">
      <div
        className="h-full bg-sky-500 dark:bg-sky-700"
        style={{ width: `${percentage1}%` }}
      />
      <div
        className="h-full bg-indigo-500 dark:bg-indigo-700"
        style={{ width: `${percentage2}%` }}
      />
    </div>
  );
};

export default ProgressBar;
