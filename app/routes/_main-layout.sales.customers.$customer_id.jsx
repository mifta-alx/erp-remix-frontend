import { Check, ChevronRight, House, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { ErrorView } from "@views/index.js";

import {
  ImageUpload,
  MultiSelect,
  SearchInput,
  Spinner,
} from "@components/index.js";
import { useToast } from "@context/ToastContext.jsx";

export const meta = ({ data }) => {
  const formattedName = `${
    data.customer?.internal_reference
      ? `[${data.customer.internal_reference}]`
      : ""
  } ${data.customer?.name || ""}`;
  return [
    { title: `F&F - ${formattedName}` },
    { name: "description", content: `${formattedName}` },
  ];
};

export const loader = async ({ params, request }) => {
  const referer = request.headers.get("Referer");
  let node_env = process.env.MODE;
  const showActionButton = referer && referer.includes("/customers");
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, customerResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?tags&type=customer&customers`),
      fetch(`${process.env.API_URL}/customers/${params.customer_id}`),
    ]);
    if (!initResponse.ok || !customerResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching customer.";
      let status = !initResponse.ok
        ? initResponse.status
        : customerResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Customers Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "The Customer you're looking for do not exist.";
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

    const [init, customer] = await Promise.all([
      initResponse.json(),
      customerResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      tags: init.data.tags,
      customers: init.data.customers,
      customer: customer.data,
      node_env,
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

export default function EditCustomer() {
  const {
    API_URL,
    customer,
    customers,
    tags,
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
    customer?.internal_reference ? `[${customer.internal_reference}]` : ""
  } ${customer?.name || ""}`;
  //image
  const [image, setImage] = useState(customer.image_uuid || "");
  const [preview, setPreview] = useState(customer.image_url || "");
  const [selected, setSelected] = useState(customer.type);
  const handleCheckboxChange = (type) => {
    setSelected((prevSelected) => (prevSelected === type ? null : type));
  };
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      type: selected,
    }));
  }, [selected]);
  //Customer tag
  const [selectedTags, setSelectedTags] = useState(customer.tags || []);

  //
  const [formData, setFormData] = useState({
    name: customer.name || "",
    company: customer.company || "",
    type: customer.type || null,
    street: customer.street || "",
    city: customer.city || "",
    state: customer.state || "",
    zip: customer.zip || "",
    phone: customer.phone || "",
    mobile: customer.mobile || "",
    email: customer.email || "",
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
        `${API_URL}/customers/${params.customer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            company: formData.company,
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
            tag_id: selectedTags.map((tag) => tag.id),
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
          name: "",
          company: "",
          type: null,
          street: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
          mobile: "",
          email: "",
        });
        navigate("/sales/customers");
        showToast(result.message, "success");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  //delete customer
  const handleDeleteCustomer = async () => {
    setLoadingDelete(true);
    try {
      const response = await fetch(
        `${API_URL}/customers/${params.customer_id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem("image_url");
        localStorage.removeItem("image");
        navigate("/sales/customers");
        showToast(result.message, "success");
      } else {
        showToast(result.message, "danger");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
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
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to="/sales/customers"
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Customers
                      </Link>
                    </div>
                  </li>
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
                  Customer
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
                      onClick={handleDeleteCustomer}
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
                    Customer Information
                  </p>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Customer Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="off"
                        className={`bg-gray-50 border ${
                          actionData?.errors?.name
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Type customer name"
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
                    {selected === 1 && (
                      <div className="sm:col-span-2">
                        <SearchInput
                          name="company"
                          data={customers}
                          label="Company Name"
                          placeholder="Select Company Name"
                          valueKey="id"
                          displayKey="name"
                          onChange={handleChange}
                          error={actionData?.errors?.company}
                          value={formData.company}
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <MultiSelect
                        data={tags}
                        apiUrl={API_URL}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        error={actionData?.errors?.tags}
                        placeholder="Job Position, Location, etc"
                      />
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.street
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.city
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.state
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.zip
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
                    Customer Image
                  </p>

                  <ImageUpload
                    apiUrl={API_URL}
                    error={actionData?.errors?.image_uuid}
                    image={image}
                    setImage={setImage}
                    preview={preview}
                    setPreview={setPreview}
                    node_env={node_env}
                  />
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.phone
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.mobile
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
                        className={`bg-gray-50 border ${
                          actionData?.errors?.email
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
