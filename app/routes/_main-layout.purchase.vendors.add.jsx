import {
  Camera,
  CaretRight,
  Check,
  House,
  TrashSimple,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { ErrorView } from "@views/index.js";

export const meta = () => {
  return [
    { title: "F&F - New Vendors" },
    { name: "description", content: "New Vendors" },
  ];
};

export const loader = async () => {
  let apiEndpoint = process.env.API_URL;
  try {
    const VendorResponse = await fetch(`${process.env.API_URL}/vendors`);

    if (!VendorResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching Vendors.";
      let status;
      if (status === 500) {
        errorMessage = "Internal Server Error";
        errorDescription =
          "There is an issue on our server. Our team is working to resolve it.";
      } else if (status === 404) {
        errorMessage = "Vendors Not Found";
        errorDescription = "The vendors you're looking for do not exist.";
      }
      return {
        error: true,
        status,
        message: errorMessage,
        description: errorDescription,
      };
    }
    return {
      API_URL: apiEndpoint,
      error: false,
      status: 200,
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

export default function AddVendors() {
  const { API_URL, error, message, description, status } = useLoaderData();
  const navigate = useNavigate();
  const [actionData, setActionData] = useState();
  const [loading, setLoading] = useState(false);
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

  //vendors company
  const [selected, setSelected] = useState(1);
  const handleCheckboxChange = (type) => {
    setSelected((prevSelected) => (prevSelected === type ? null : type));
  };
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      type: selected,
    }));
  }, [selected]);

  const [formData, setFormData] = useState({
    name: "",
    type: null,
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    mobile: "",
    email: "",
    image_uuid: "",
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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone,
          mobile: formData.mobile,
          email: formData.email,
          image_uuid: image,
          image_url: preview,
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
          name: "",
          type: null,
          street: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
          mobile: "",
          email: "",
          image_uuid: "",
        });
        setLoading(false);
        navigate("/purchase/vendors");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDiscard = () => {
    navigate("/purchase/vendors");
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
                  <li>
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <Link
                        to="/purchase/vendors"
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Vendors
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        New
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Vendors
                </h2>
                <div className="inline-flex w-full sm:w-fit" role="group">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500  dark:hover:bg-gray-700"
                  >
                    {loading ? (
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
                    onClick={handleDiscard}
                    className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                  >
                    <X size={16} />
                    Discard
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-2/3 gap-4 flex flex-col">
                <div className="sm:col-span-2 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Vendor Information
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.name
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Type vendor name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.name && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.name}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Category
                      </label>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex items-center ps-4 border border-gray-200 rounded-lg dark:border-gray-700">
                          <input
                            checked={selected === 1}
                            id="bordered-radio-1"
                            type="radio"
                            name="bordered-radio"
                            onChange={() => handleCheckboxChange(1)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="bordered-radio-1"
                            className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Individual
                          </label>
                        </div>
                        <div className="flex items-center ps-4 border border-gray-200 rounded-lg dark:border-gray-700">
                          <input
                            checked={selected === 2}
                            id="bordered-radio-2"
                            type="radio"
                            name="bordered-radio"
                            onChange={() => handleCheckboxChange(2)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="bordered-radio-2"
                            className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Company
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Address
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 sm:gap-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="Street"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Street
                      </label>
                      <input
                        type="text"
                        name="street"
                        id="street"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.street
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="123 Main St"
                        value={formData.street}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.street && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.street}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.city
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Los Angeles"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.city && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.state
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="California"
                        value={formData.state}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.state && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="zip"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Zip
                      </label>
                      <input
                        type="text"
                        name="zip"
                        id="zip"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.zip
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="90210"
                        value={formData.zip}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.zip && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 gap-4 flex flex-col">
                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Vendor Image
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
                        className={`bg-gray-50 border ${actionData?.errors?.image_uuid
                            ? "border-red-500 dark:border-red-500 dark:hover:border-red-400"
                            : "border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                          } flex flex-col items-center justify-center h-44 md:w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100`}
                        onClick={handleFilePickerClick}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-300 dark:text-gray-400 text-5xl">
                          <Camera />
                          <p className="text-xs text-center mt-2 text-gray-300 dark:text-gray-400">
                            Vendor Image
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
                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-8">
                  <p className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-400">
                    Contact
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.phone
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="0341000100"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.phone && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="mobile"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Mobile
                      </label>
                      <input
                        type="text"
                        name="mobile"
                        id="mobile"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.mobile
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="0852118018256"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.mobile && (
                        <p className="mt-2 text-sm text-red-600">
                          {actionData?.errors.mobile}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        autoComplete="off"
                        className={`bg-gray-50 border ${actionData?.errors?.email
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {actionData?.errors?.email && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                          {actionData.errors.email}
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
