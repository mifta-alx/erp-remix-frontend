import { forwardRef, useEffect, useRef, useState } from "react";
import useClickOutside from "@hooks/useClickOutside.js";
import { CaretDown } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

const TableSearchInput = forwardRef(
  (
    {
      data = [],
      placeholder = "Select item",
      valueKey = "",
      displayKey = "",
      getDisplayString,
      onChange,
      error,
      value,
      parentClassName,
    },
    ref
  ) => {
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    useClickOutside(dropdownRef, () => setIsDropdownVisible(false));

    const filteredData = data?.filter((item) => {
      const keyString = getDisplayString
        ? getDisplayString(item)
        : item[displayKey];

      if (searchTerm) {
        return keyString.toLowerCase().includes(searchTerm.toLowerCase());
      }
      // Jika searchTerm kosong, tampilkan semua data
      return true;
    });
    const handleSelectItem = (item) => {
      const newValue = item[valueKey];
      setInputValue(
        getDisplayString ? getDisplayString(item) : item[displayKey]
      );
      setSearchTerm("");
      setIsDropdownVisible(false);
      onChange?.(newValue);
    };

    const handleSearchChange = (e) => {
      const targetValue = e.target.value;
      setSearchTerm(targetValue);
      setInputValue(targetValue);

      // Jika input kosong, kosongkan selectedItems
      if (targetValue === "") {
        onChange?.(""); // Menghapus item yang terpilih
      }
      setIsDropdownVisible(true);
    };

    useEffect(() => {
      if (value) {
        const selectedItem = data.find((item) => item[valueKey] === value);
        if (selectedItem) {
          setInputValue(
            getDisplayString
              ? getDisplayString(selectedItem)
              : selectedItem[displayKey]
          );
        }
      }
    }, [value, data, valueKey, displayKey, getDisplayString]);
    return (
      <div
        ref={dropdownRef}
        className={twMerge("relative w-full sm:w-1/2", parentClassName)}
      >
        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500 dark:text-gray-400">
          {isFocused && <CaretDown weight="bold" size={16} />}
        </div>
        <input
          ref={ref}
          type="text"
          name="search-input"
          id="search-input"
          className={`${
            error && inputValue === ""
              ? "border-red-500 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600 "
              : "border-transparent focus:border-primary-600 dark:focus:border-primary-500"
          } text-gray-900 border-b text-sm focus:outline-none focus:ring-0 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white`}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleSearchChange}
          onFocus={() => {
            setIsDropdownVisible(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
        />
        {isDropdownVisible && (
          <div
            id="dropdown"
            className="z-50 absolute bg-white divide-y divide-gray-100 rounded-lg border border-fade dark:border-gray-600 w-full max-h-32 overflow-y-auto dark:bg-gray-700"
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdown-button"
            >
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      {getDisplayString
                        ? getDisplayString(item)
                        : item[displayKey]}
                    </button>
                  </li>
                ))
              ) : (
                <li>
                  <span className="inline-flex w-full px-4 py-2 text-gray-500 dark:text-gray-400">
                    No results found
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
export default TableSearchInput;
