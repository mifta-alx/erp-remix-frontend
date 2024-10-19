import {
  Camera,
  CaretRight,
  House,
  TrashSimple,
  XCircle,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useFetcher,
} from "@remix-run/react";
import useClickOutside from "../hooks/useClickOutside";
import useDebounce from "../hooks/useDebounce";

export const loader = async () => {
  let apiEndpoint = process.env.API_URL;
  try {
    const [categoriesResponse, tagResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/categories`),
      fetch(`${process.env.API_URL}/tags`),
    ]);
    if (!categoriesResponse.ok || !tagResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status;
      if (!categoriesResponse.ok) {
        status = categoriesResponse.status;
        if (status === 404) {
          errorMessage = "Categories Not Found";
          errorDescription = "The categories you're looking for do not exist.";
        }
      } else if (!tagResponse.ok) {
        status = tagResponse.status;
        if (status === 404) {
          errorMessage = "Tags Not Found";
          errorDescription = "The tags you're looking for do not exist.";
        }
      }

      if (status === 500) {
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

    const [categories, tags] = await Promise.all([
      categoriesResponse.json(),
      tagResponse.json(),
    ]);

    return {
      categories: categories.data,
      API_URL: apiEndpoint,
      tags: tags.data,
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

export default function AddProduct() {
  const { API_URL, categories, tags, error, message, description, status } =
    useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [actionData, setActionData] = useState();
  //image upload
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
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
  //product tag
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(dropdownRef, () => setIsOpen(false));
  const [tagKeywords, setTagKeywords] = useState("");
  const debounceKeywords = useDebounce(tagKeywords, 300);
  const [selectedTags, setSelectedTags] = useState([]);
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
    product_name: "",
    category_id: "",
    sales_price: "",
    cost: "",
    barcode: "",
    internal_reference: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  //submit data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          category_id: formData.category_id,
          sales_price: formData.sales_price,
          cost: formData.cost,
          barcode: formData.barcode,
          internal_reference: formData.internal_reference,
          notes: formData.notes,
          image_uuid: image,
          image_url : preview,
          tags: selectedTags.map((tag) => tag.id),
        }),
      });
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
          product_name: "",
          category_id: "",
          sales_price: 0,
          cost: 0,
          barcode: "",
          internal_reference: "",
          notes: "",
          image_uuid: "",
        });
        navigate("/manufacturing/products");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {error ? (
          <div className="py-48  px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
                {status}
              </h1>
              <p className="mb-4 text-3xl tracking-tight first-letter:capitalize font-bold text-gray-900 md:text-4xl dark:text-white">
                {message}
              </p>
              <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
              <div>
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
                    <li>
                      <div className="flex items-center text-gray-400">
                        <CaretRight size={18} weight="bold" />
                        <Link
                          to="/manufacturing/products"
                          className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                          Products
                        </Link>
                      </div>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center text-gray-400">
                        <CaretRight size={18} weight="bold" />
                        <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                          Add Product
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Add a new product
                </h2>
              </div>
            </div>
            {fetcher.state === "loading" ? (
              <p className="text-center text-gray-500">
                Adding product, please wait...
              </p>
            ) : (
              <Form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="grid gap-4 sm:grid-cols-6 sm:gap-6 w-full order-2 md:order-1">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="product_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="product_name"
                        id="product_name"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.product_name
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Type product name"
                        value={formData.product_name}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.product_name && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.product_name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Product Category
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
                        htmlFor="product_tag"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Product Tag
                      </label>
                      <div ref={dropdownRef} className="relative">
                        <div
                          className={`bg-gray-50 border ${
                            isOpen
                              ? "border-primary-600 ring-1 ring-primary-600 dark:ring-primary-500 dark:border-primary-500"
                              : actionData?.errors?.product_tag
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
                            name="product_tag"
                            id="product_tag"
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

                      {actionData?.errors?.product_tag && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.product_tag}
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
                            Product Image
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
                <button
                  type="submit"
                  className="text-gray-900 bg-white mt-4 sm:mt-6 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                  Add product
                </button>
              </Form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
