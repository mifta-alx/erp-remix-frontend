import { Plus } from "lucide-react";
import { Link } from "@remix-run/react";

const EmptyView = ({ section = "Empty", icon, link = "", node_env }) => {
  return (
    <div className="border-dashed border-2 text-5xl border-gray-300 dark:border-gray-500 text-gray-300 dark:text-gray-500 flex rounded-lg h-full w-full items-center flex-col py-40 md:py-32">
      {icon}
      <p className="font-semibold text-sm text-gray-600 dark:text-white mt-4 capitalize text-center">
        No {section}
      </p>
      <p className="font-normal text-sm text-gray-400 dark:text-gray-500 mt-1 text-center">
        Get started by creating a new {section}
      </p>
      {node_env === "production" && (
        <Link
          to={link}
          className="text-gray-900 bg-white gap-2 mt-6 capitalize w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
        >
          <Plus size={16} />
          New {section}
        </Link>
      )}
    </div>
  );
};

export default EmptyView;
