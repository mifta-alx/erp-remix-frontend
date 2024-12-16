import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const ActionDropdown = ({ title = "Dropdown", items = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  let closeTimeout;

  const handleMouseLeave = (event) => {
    closeTimeout = setTimeout(() => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.relatedTarget)
      ) {
        setIsOpen(false);
      }
    }, 100); // Tambahkan waktu tunggu 100ms
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimeout); // Hentikan waktu tunggu jika mouse masuk kembali
    setIsOpen(true);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="text-gray-900 bg-white border border-gray-200 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 gap-2 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        {title}
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="dropdownHover"
          className="absolute right-1/2 transform translate-x-1/2 mt-1 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-max min-w-full dark:bg-gray-700"
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
