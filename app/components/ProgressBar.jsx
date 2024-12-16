const ProgressBar = ({ data1, data2 }) => {
  const total = data1 + data2;
  const percentage1 = (data1 / total) * 100;
  const percentage2 = (data2 / total) * 100;

  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden flex flex-row items-center justify-center">
      <div
        className="h-full bg-primary-500"
        style={{ width: `${percentage1}%` }}
      />
      <div
        className="h-full bg-purple-300"
        style={{ width: `${percentage2}%` }}
      />
    </div>
  );
};

export default ProgressBar;
