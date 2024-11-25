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
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import useClickOutside from "@hooks/useClickOutside";
import useDebounce from "@hooks/useDebounce";
import { ErrorView } from "@views/index.js";
import { formatPriceBase, unformatPriceBase } from "@utils/formatPrice.js";
import { formatProductName } from "@utils/formatName.js";
import { Spinner } from "@components/index.js";

export const meta = ({ data }) => {
  return [
    { title: `F&F - ${formatProductName(data.product)}` },
    { name: "description", content: `${formatProductName(data.product)}` },
  ];
};

export const loader = async ({ params, request }) => {
  const referer = request.headers.get("Referer");
  const showActionButton = referer && referer.includes("/products");
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, productResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?categories&tags`),
      fetch(`${process.env.API_URL}/products/${params.product_id}`),
    ]);
    if (!initResponse.ok || !productResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok
        ? initResponse.status
        : productResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Products Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "The product you're looking for do not exist.";
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

    const [init, product] = await Promise.all([
      initResponse.json(),
      productResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      categories: init.data.categories,
      tags: init.data.tags,
      product: product.data,
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

export default function EditProduct() {
  const location = useLocation();
  const { state } = location;
  const {
    API_URL,
    categories,
    tags,
    product,
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
  //image upload
  const [image, setImage] = useState(product.image_uuid || "");
  const [preview, setPreview] = useState(product.image_url || "");
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
  const [selectedTags, setSelectedTags] = useState(product.tags || []);
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
    product_name: product.name || "",
    category_id: product.category_id || "",
    sales_price: formatPriceBase(product.sales_price),
    cost: formatPriceBase(product.cost),
    barcode: product.barcode || "",
    internal_reference: product.internal_reference || "",
    notes: product.notes || "",
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
      const response = await fetch(`${API_URL}/products/${params.product_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          category_id: formData.category_id,
          sales_price: unformatPriceBase(formData.sales_price),
          cost: unformatPriceBase(formData.cost),
          barcode: formData.barcode,
          internal_reference: formData.internal_reference,
          notes: formData.notes,
          image_uuid: image,
          image_url: preview,
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
    } finally {
      setLoadingUpdate(false);
    }
  };
  //delete product
  const handleDeleteProduct = async () => {
    setLoadingDelete(true);
    try {
      const response = await fetch(`${API_URL}/products/${params.product_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        navigate("/manufacturing/products");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete product:", errorData);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleFormatPrice = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/\./g, "");
    const updatedValue =
      rawValue === ""
        ? formatPriceBase(0)
        : formatPriceBase(parseFloat(rawValue));
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
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
                    state.map((nav, index) => (
                      <li key={index}>
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
                          to="/manufacturing/products"
                          className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                          Products
                        </Link>
                      </div>
                    </li>
                  )}
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {formatProductName(product)}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Product
                </h2>
                {showActionButton && (
                  <div className="inline-flex w-full sm:w-fit" role="group">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      {loadingUpdate ? <Spinner /> : <Check size={16} />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingDelete ? <Spinner /> : <TrashSimple size={16} />}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-2/3 gap-4 flex flex-col">
                <div className="sm:col-span-2 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Product Information
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-6">
                    <div className="sm:col-span-2">
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
                    <div>
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
                    <div>
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
                    <div className="sm:col-span-2">
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
                </div>
                <div className="sm:col-span-2 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Product Image
                  </p>
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
                        } flex flex-col items-center justify-center h-44 md:w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100`}
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
              </div>
              <div className="lg:w-1/3 gap-4 flex flex-col">
                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Pricing
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:gap-6">
                    <div>
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
                        onBlur={handleFormatPrice}
                      />
                      {actionData?.errors?.sales_price && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.sales_price}
                        </p>
                      )}
                    </div>
                    <div>
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
                        onBlur={handleFormatPrice}
                      />
                      {actionData?.errors?.cost && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                          {actionData.errors.cost}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Organize
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:gap-6">
                    <div>
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Category
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
                    <div>
                      <label
                        htmlFor="product_tag"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Tags
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
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
