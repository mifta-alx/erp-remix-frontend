import { Check, ChevronRight, House, Trash } from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { ErrorView } from "@views/index.js";
import { formatPriceBase, unformatPriceBase } from "@utils/formatPrice.js";
import {
  ImageUpload,
  MultiSelect,
  SearchInput,
  Spinner,
} from "@components/index.js";
import { useToast } from "@context/ToastContext.jsx";

export const meta = ({ data }) => {
  const formattedName = `${
    data.material?.internal_reference
      ? `[${data.material.internal_reference}]`
      : ""
  } ${data.material?.name || ""}`;
  return [
    { title: `F&F - ${formattedName}` },
    { name: "description", content: `${formattedName}` },
  ];
};

export const loader = async ({ params, request }) => {
  const referer = request.headers.get("Referer");
  let node_env = process.env.MODE;
  const showActionButton = referer && referer.includes("/materials");
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, materialResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?categories&tags&type=material`),
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
      node_env,
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
    node_env,
  } = useLoaderData();
  const showToast = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const [actionData, setActionData] = useState();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const formattedName = `${
    material?.internal_reference ? `[${material.internal_reference}]` : ""
  } ${material?.name || ""}`;
  //image upload
  const [image, setImage] = useState(material?.image_uuid || "");
  const [preview, setPreview] = useState(material?.image_url || "");
  //material tag
  const [selectedTags, setSelectedTags] = useState(material?.tags || []);
  //
  const [formData, setFormData] = useState({
    material_name: material?.name || "",
    category_id: material?.category_id || "",
    sales_price: formatPriceBase(material.sales_price),
    cost: formatPriceBase(material.cost),
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
            sales_price: unformatPriceBase(formData.sales_price),
            cost: unformatPriceBase(formData.cost),
            barcode: formData.barcode,
            internal_reference: formData.internal_reference,
            notes: formData.notes,
            image_uuid: image,
            image_url: preview,
            tags: selectedTags.map((tag) => tag.id),
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setActionData({ errors: result.errors || {} });
        } else {
          showToast(result.message, "danger");
        }
        return;
      }
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
        showToast(result.message, "success");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUpdate(false);
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
      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        navigate("/manufacturing/materials");
        showToast(result.message, "success");
      } else {
        showToast(result.message, "danger");
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
                      <House size={14} strokeWidth={1.8} />
                    </Link>
                  </li>
                  {state ? (
                    state.map((nav) => (
                      <li>
                        <div className="flex items-center text-gray-400">
                          <ChevronRight size={18} strokeWidth={2} />
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
                        <ChevronRight size={18} strokeWidth={2} />
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
                      <ChevronRight size={18} strokeWidth={2} />
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
                {node_env === "production" && (
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
                      onClick={handleDeleteMaterial}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingDelete ? <Spinner /> : <Trash size={14} />}
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
                    Material Information
                  </p>
                  <div className="grid gap-4 sm:grid-cols-6 sm:gap-6 w-full order-2 md:order-1">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Material Name
                      </label>
                      <input
                        type="text"
                        name="material_name"
                        id="name"
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
                    Material Image
                  </p>
                  <ImageUpload
                    apiUrl={API_URL}
                    error={actionData?.errors?.image_uuid}
                    image={image}
                    setImage={setImage}
                    preview={preview}
                    setPreview={setPreview}
                  />
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
                    <SearchInput
                      name="category_id"
                      data={categories}
                      label="Category"
                      placeholder="Select Category"
                      valueKey="category_id"
                      displayKey="category"
                      onChange={handleChange}
                      error={actionData?.errors?.category_id}
                      value={formData.category_id}
                    />
                    <MultiSelect
                      data={tags}
                      apiUrl={API_URL}
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      error={actionData?.errors?.tags}
                      type="material"
                      name="material_tag"
                    />
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
