import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

const Drawer = ({
  activateClickOutside = true,
  open = false,
  onClose,
  dismissable = true,
  backdropClass,
  placement = "left",
  id = "drawer-example",
  children,
  title,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  const backdropDivClass = twMerge(
    "fixed top-0 start-0 z-50 w-full h-full bg-gray-900 bg-opacity-75",
    backdropClass
  );

  const openPlacementClasses = {
    left: "-translate-x-full",
    right: "translate-x-full",
    top: "-translate-y-full",
    bottom: "translate-y-full",
  };

  const placements = {
    left: "inset-y-0 start-0",
    right: "inset-y-0 end-0",
    top: "inset-x-0 top-0",
    bottom: "inset-x-0 bottom-0",
  };

  const drawerClass = twMerge(
    placements[placement],
    "fixed w-96 duration-300, ease-in-out transform transition-transform overflow-y-auto z-50 bg-white dark:bg-gray-800",
    !open ? openPlacementClasses[placement] : "translate-x-0 translate-y-0"
  );

  const handleClickOutside = () => {
    if (activateClickOutside && onClose) onClose();
  };

  return (
    <>
      {open && (
        <div
          role="presentation"
          className={backdropDivClass}
          onClick={handleClickOutside}
        />
      )}

      <div
        id={id}
        tabIndex={-1}
        aria-controls={id}
        aria-labelledby={id}
        className={drawerClass}
      >
        {title && (
          <div className="flex flex-row justify-between items-center p-6 border-b border-gray-200 dark:border-gray-500">
            <h5 className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              {title}
            </h5>
            {dismissable && (
              <button
                className="text-gray-400 hover:text-gray-200"
                type="button"
                onClick={handleClickOutside}
              >
                <X size={24} weight="bold" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </>
  );
};

export default Drawer;
