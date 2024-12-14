import { XCircle } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import useClickOutside from "@hooks/useClickOutside.js";
import useDebounce from "@hooks/useDebounce.js";

const MultiSelect = ({
  apiUrl,
  error,
  label = "Tags",
  data,
  selectedTags,
  setSelectedTags,
}) => {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(dropdownRef, () => setIsOpen(false));
  const [tagKeywords, setTagKeywords] = useState("");
  const debounceKeywords = useDebounce(tagKeywords, 300);
  const tagResults = data
    ?.filter((tag) =>
      tag.name.toLowerCase().includes(debounceKeywords.toLowerCase())
    )
    .filter(
      (tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
    );

  const tagAlreadySelected = selectedTags.some(
    (tag) => tag.name.toLowerCase() === debounceKeywords.toLowerCase()
  );
  const handleSelectTag = (tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags((prevTags) => [...prevTags, tag]);
      setTagKeywords("");
    }
  };
  const handleRemoveTag = (tagId) => {
    setSelectedTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
  };
  const handleAddtag = async () => {
    try {
      const response = await fetch(`${apiUrl}/tags?type=product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name_tag: debounceKeywords }),
      });

      if (response.ok) {
        const result = await response.json();
        const newTag = result.data;
        setSelectedTags((prevTags) => [...prevTags, newTag]);
        setTagKeywords("");
        setIsOpen(false);
      } else {
        console.error("Failed to add tag");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };
  return (
    <div>
      <label
        htmlFor="product_tag"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <div ref={dropdownRef} className="relative">
        <div
          className={`bg-gray-50 border ${
            isOpen
              ? "border-primary-600 ring-1 ring-primary-600 dark:ring-primary-500 dark:border-primary-500"
              : error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } text-gray-900 text-sm rounded-lg flex flex-wrap gap-2 w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
        >
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center rounded bg-primary-100 dark:bg-primary-900 px-2 py-0.5 gap-2 text-xs font-medium text-primary-800 dark:text-primary-300"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="cursor-pointer"
              >
                <XCircle weight="fill" />
              </button>
            </div>
          ))}
          <input
            type="text"
            name="product_tag"
            id="product_tag"
            placeholder={selectedTags.length > 0 ? "" : "Food, Clothes, etc"}
            autoComplete="off"
            className="flex-grow flex-shrink min-w-[30px] max-w-full outline-0 bg-transparent"
            value={tagKeywords}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => setTagKeywords(e.target.value)}
          />
        </div>
        {isOpen && (
          <div
            className={
              "border-gray-300 dark:border-gray-600 border-[1px] absolute z-10 mt-1.5 w-full bg-gray-50 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto space-y-1 shadow-md"
            }
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {tagResults.length > 0 ? (
                tagResults.map((tag, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => handleSelectTag(tag)}
                    >
                      <p>{tag.name}</p>
                    </button>
                  </li>
                ))
              ) : tagKeywords ? (
                tagAlreadySelected ? (
                  <li className="inline-flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400">
                    <p>{tagKeywords} already selected</p>
                  </li>
                ) : (
                  <li>
                    <button
                      className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                      type="button"
                      onClick={() => handleAddtag()}
                    >
                      <p>Create "{tagKeywords}" tag</p>
                    </button>
                  </li>
                )
              ) : (
                <li className="inline-flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400">
                  <p>Start Typing...</p>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default MultiSelect;
