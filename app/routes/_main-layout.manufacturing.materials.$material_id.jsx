import {
  Camera,
  CaretRight,
  Check,
  House,
  TrashSimple,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import useClickOutside from "@hooks/useClickOutside";
import useDebounce from "@hooks/useDebounce";
import { ErrorView } from "@views/index.js";

export const meta = ({ data }) => {
  const formattedName = `${
    data.material?.internal_reference
      ? `[${data.material.internal_reference}]`
      : ""
  } ${data.material?.material_name || ""}`;
  return [
    { title: `F&F - ${formattedName}` },
    { name: "description", content: `${formattedName}` },
  ];
};

export const loader = async ({ params, request }) => {
  const referer = request.headers.get("Referer");
  const showActionButton = referer && referer.includes("/materials");
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, materialResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?categories&tags`),
      fetch(`${process.env.API_URL}/materials/${params.material_id}`),
    ]);
    if (!initResponse.ok || !materialResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching material.";
      let status = !initResponse.ok
        ? initResponse.status
        : materialResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Materials Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "The Material you're looking for do not exist.";
      } else if (status === 500) {
        errorMessage = "Internal Server Error";
        errorDescription =
          "There is an issue on our server. Our team is working to resolve it.";
      }
      return {
        error: true,
        status,
        message: errorMessage,
        description: errorDescription,
      };
    }

    const [init, material] = await Promise.all([
      initResponse.json(),
      materialResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      categories: init.data.categories,
      tags: init.data.tags,
      material: material.data,
      showActionButton,
    };
  } catch (error) {
    return {
      error: true,
      status: 500,
      message: "Server Connection Failed",
      description:
        "Failed to connect to the server. Please check your network or try again later.",
    };
  }
};

export default function EditMaterial() {
  const location = useLocation();
  const { state } = location;
  const {
    API_URL,
    categories,
    tags,
    material,
    error,
    message,
    description,
    status,
    showActionButton,
  } = useLoaderData();

  const params = useParams();
  const navigate = useNavigate();
  const [actionData, setActionData] = useState();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const formattedName = `${
    material?.internal_reference ? `[${material.internal_reference}]` : ""
  } ${material?.material_name || ""}`;
  //image upload
  const [image, setImage] = useState(material?.image_uuid || "");
  const [preview, setPreview] = useState(material?.image_url || "");
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
        const response = await fetch(`${API_URL}/upload-images`, {
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
      const response = await fetch(`${API_URL}/upload-images/${uuid}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPreview("");
        setImage("");
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        setIsHovered(false);
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  //
  //material tag
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(dropdownRef, () => setIsOpen(false));
  const [tagKeywords, setTagKeywords] = useState("");
  const debounceKeywords = useDebounce(tagKeywords, 300);
  const [selectedTags, setSelectedTags] = useState(material?.tags || []);
  const tagResults = tags
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
      const response = await fetch(`${API_URL}/tags`, {
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
  //
  const [formData, setFormData] = useState({
    material_name: material?.material_name || "",
    category_id: material?.category_id || "",
    sales_price: material?.sales_price || 0,
    cost: material?.cost || 0,
    barcode: material?.barcode || "",
    internal_reference: material?.internal_reference || "",
    notes: material?.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  //update data
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    try {
      const response = await fetch(
        `${API_URL}/materials/${params.material_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            material_name: formData.material_name,
            category_id: formData.category_id,
            sales_price: formData.sales_price || 0,
            cost: formData.cost || 0,
            barcode: formData.barcode,
            internal_reference: formData.internal_reference,
            notes: formData.notes,
            image_uuid: image,
            image_url: preview,
            tags: selectedTags.map((tag) => tag.id),
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        setActionData({ errors: result.errors || {} });
        return;
      }
      const result = await response.json();
      if (result.success) {
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        setFormData({
          material_name: "",
          category_id: "",
          sales_price: 0,
          cost: 0,
          barcode: "",
          internal_reference: "",
          notes: "",
          image_uuid: "",
        });
        navigate("/manufacturing/materials");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  //delete material
  const handleDeleteMaterial = async () => {
    setLoadingDelete(true);
    try {
      const response = await fetch(
        `${API_URL}/materials/${params.material_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        navigate("/manufacturing/materials");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete material:", errorData);
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {error ? (
          <ErrorView
            status={status}
            message={message}
            description={description}
          />
        ) : (
          <>
            <div className="mb-4 items-start justify-between gap-3 flex flex-col md:mb-8">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <li className="inline-flex items-center">
                    <Link
                      to={"/"}
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white"
                    >
                      <House weight="fill" />
                    </Link>
                  </li>
                  {state ? (
                    state.map((nav) => (
                      <li>
                        <div className="flex items-center text-gray-400">
                          <CaretRight size={18} weight="bold" />
                          <Link
                            to={nav.url}
                            className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                          >
                            {nav.title}
                          </Link>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="flex items-center text-gray-400">
                        <CaretRight size={18} weight="bold" />
                        <Link
                          to="/manufacturing/materials"
                          className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                          Materials
                        </Link>
                      </div>
                    </li>
                  )}
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {formattedName}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Material
                </h2>
                {showActionButton && (
                  <div className="inline-flex w-full sm:w-fit" role="group">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      {loadingUpdate ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <Check size={16} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteMaterial}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingDelete ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <TrashSimple size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Form onSubmit={handleUpdate} encType="multipart/form-data">
              <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="grid gap-4 sm:grid-cols-6 sm:gap-6 w-full order-2 md:order-1">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="material_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Material Name
                      </label>
                      <input
                        type="text"
                        name="material_name"
                        id="material_name"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.material_name
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Type material name"
                        value={formData.material_name}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.material_name && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.material_name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Material Category
                      </label>
                      <select
                        id="category"
                        name="category_id"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.category_id
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } capitalize text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        value={formData.category_id}
                        onChange={handleChange}
                      >
                        <option value="" hidden>
                          Select category
                        </option>
                        {categories.length > 0 &&
                          categories.map((category) => (
                            <option
                              key={category.category_id}
                              value={category.category_id}
                            >
                              {category.category}
                            </option>
                          ))}
                      </select>

                      {actionData?.errors?.category_id && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.category_id}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Sales Price
                      </label>
                      <input
                        type="text"
                        name="sales_price"
                        id="price"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.sales_price
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Rp. 0"
                        value={formData.sales_price}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.sales_price && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.sales_price}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="cost"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Cost
                      </label>
                      <input
                        type="text"
                        name="cost"
                        id="cost"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.cost
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Rp. 0"
                        value={formData.cost}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.cost && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                          {actionData.errors.cost}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="barcode"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        id="barcode"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.barcode
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="PRO-001"
                        value={formData.barcode}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.barcode && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.barcode}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="internal_reference"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Internal Reference
                      </label>
                      <input
                        type="text"
                        name="internal_reference"
                        id="internal_reference"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.internal_reference
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="PRO-001"
                        value={formData.internal_reference}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.internal_reference && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.internal_reference}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="material_tag"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Material Tag
                      </label>
                      <div ref={dropdownRef} className="relative">
                        <div
                          className={`bg-gray-50 border ${
                            isOpen
                              ? "border-primary-600 ring-1 ring-primary-600 dark:ring-primary-500 dark:border-primary-500"
                              : actionData?.errors?.material_tag
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg flex flex-row gap-2 flex-wrap w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                        >
                          <div className="flex flex-wrap gap-2">
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
                          </div>
                          <input
                            type="text"
                            name="material_tag"
                            id="material_tag"
                            placeholder="Food, Clothes, etc"
                            autoComplete="off"
                            className="flex-grow outline-0 bg-transparent"
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

                      {actionData?.errors?.material_tag && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.material_tag}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="notes"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        rows="4"
                        name="notes"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Your notes here"
                        value={formData.notes}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="md:mt-7 order-1 md:order-2">
                    {preview ? (
                      <div
                        className="relative cursor-pointer h-40 md:w-40"
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
                              <TrashSimple weight="bold" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`bg-gray-50 border ${
                          actionData?.errors?.image_uuid
                            ? "border-red-500 dark:border-red-500 dark:hover:border-red-400"
                            : "border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                        } flex flex-col items-center justify-center h-40 md:w-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100`}
                        onClick={handleFilePickerClick}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-300 dark:text-gray-400 text-5xl">
                          <Camera />
                          <p className="text-xs text-center mt-2 text-gray-300 dark:text-gray-400">
                            materials Image
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
                    {actionData?.errors?.image_uuid && (
                      <p className="mt-2 text-sm text-red-600">
                        {actionData?.errors.image_uuid}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          </>
        )}
      </div>
    </section>
  );
}
