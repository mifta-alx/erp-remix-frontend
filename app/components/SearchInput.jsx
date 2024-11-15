import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import useClickOutside from "@hooks/useClickOutside.js";

const SearchInput = ({
  data = [],
  label = "Label",
  placeholder = "Select item",
  valueKey = "",
  displayKey = "",
  getDisplayString,
  onChange,
  error,
  value,
}) => {
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
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
    setInputValue(getDisplayString ? getDisplayString(item) : item[displayKey]);
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
    <div>
      <label
        htmlFor="search-input"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>

      <div ref={dropdownRef} className="relative w-full">
        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500 dark:text-gray-400">
          <CaretDown weight="bold" size={16} />
        </div>
        <input
          type="text"
          name="search-input"
          id="search-input"
          className={`bg-gray-50 border ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownVisible(true)}
          autoComplete="off"
        />
        {isDropdownVisible && (
          <div
            id="dropdown"
            className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-md w-full max-h-32 overflow-y-auto mt-1 dark:bg-gray-700"
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
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};
export default SearchInput;
