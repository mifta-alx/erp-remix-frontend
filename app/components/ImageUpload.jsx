import { Camera, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ImageUpload = ({
  label = "Product Image",
  apiUrl,
  onUpload,
  onDelete,
  image,
  setImage,
  preview,
  setPreview,
  error,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const localImage = localStorage.getItem("image");
    const localImageUrl = localStorage.getItem("image_url");
    if (localImage) {
      setImage(localImage);
      setPreview(localImageUrl);
    }
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const apiData = new FormData();
      apiData.append("image", file);

      try {
        const response = await fetch(`${apiUrl}/upload-images`, {
          method: "POST",
          body: apiData,
        });

        const result = await response.json();
        if (!result.success) {
          console.error(result.message);
        } else {
          setPreview(result.data.url);
          setImage(result.data.uuid);
          localStorage.setItem("image_url", result.data.url);
          localStorage.setItem("image", result.data.uuid);
          if (onUpload) onUpload(result.data);
          fileInputRef.current.value = null;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleFilePickerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = async (uuid) => {
    if (!uuid) {
      console.error("Please add uuid");
    }
    try {
      const response = await fetch(`${apiUrl}/upload-images/${uuid}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPreview("");
        setImage("");
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        if (onDelete) onDelete(image);
        setIsHovered(false);
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  return (
    <div>
      {preview ? (
        <div
          className="relative cursor-pointer h-44 md:w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={preview}
            alt="Image Preview"
            className="h-full w-full object-cover rounded-lg"
          />
          {isHovered && (
            <div className="absolute top-0 right-0 left-0 bottom-0 rounded-lg flex items-center justify-center">
              <div className="absolute dark:bg-gray-800 bg-gray-600 rounded-lg opacity-40 w-full h-full" />
              <button
                type="button"
                className="bg-white dark:bg-gray-800 z-10 hover:dark:bg-gray-900 hover:bg-gray-100 text-gray-700 dark:text-gray-400 hover:dark:text-gray-500 hover:text-gray-600 text-2xl p-4 rounded-full"
                onClick={() => handleDeleteImage(image)}
              >
                <Trash />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`bg-gray-50 border ${
            error
              ? "border-red-500 dark:border-red-500 dark:hover:border-red-400"
              : "border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
          } flex flex-col items-center justify-center h-44 md:w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100`}
          onClick={handleFilePickerClick}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-300 dark:text-gray-400 text-5xl">
            <Camera size={56} strokeWidth={1.5} />
            <p className="text-xs text-center mt-2 text-gray-300 dark:text-gray-400">
              {label}
            </p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        id="image_file"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
export default ImageUpload;
