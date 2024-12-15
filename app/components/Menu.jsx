import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

const Menu = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-100 text-gray-500 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center justify-center focus:outline-none"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <EllipsisVertical size={24} strokeWidth={1.5} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md z-10 transform transition-all duration-300 ease-in-out origin-top-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <ul className="p-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`px-4 py-2 text-sm rounded-md cursor-pointer ${
                item.disabled
                  ? "text-gray-400 cursor-not-allowed dark:text-gray-600"
                  : "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Menu;
