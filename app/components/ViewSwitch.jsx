import { LayoutGrid, Rows2 } from "lucide-react";
import { useViewContext } from "@context/ViewScheme.jsx";

const ViewSwitch = () => {
  const { view, changeView } = useViewContext();

  const buttonClass = (isActive) =>
    `inline-flex items-center px-4 py-2 text-sm font-medium border focus:z-10 ${
      isActive
        ? "text-primary-600 bg-primary-50 border-primary-400 hover:bg-primary-100 hover:text-primary-900 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-100 dark:hover:text-primary-50 dark:hover:bg-primary-800"
        : "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"
    }`;

  return (
    <div className="inline-flex" role="group">
      <button
        type="button"
        onClick={() => changeView("gallery")}
        className={`${buttonClass(view === "gallery")} rounded-s-lg`}
      >
        <LayoutGrid size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => changeView("list")}
        className={`${buttonClass(view === "list")} rounded-e-lg`}
      >
        <Rows2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ViewSwitch;
