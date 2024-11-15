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
    useParams,
    useNavigate,
    useFetcher,
} from "@remix-run/react";
import { ErrorView, Loading } from "@views/index.js";
export const meta = () => {
    return [
        { title: "ERP-Edit Vendor" },
        { name: "description", content: "Edit Vendor" },
    ];
};

export const loader = async ({ params }) => {
    let apiEndpoint = process.env.API_URL;
    try {
        const [vendorResponse] =
            await Promise.all([
                fetch(`${process.env.API_URL}/vendors/${params.vendor_id}`),
            ]);
        if (!vendorResponse.ok) {
            let errorMessage = "An error occurred.";
            let errorDescription = "Something went wrong while fetching vendors.";
            let status;
            if (!vendorResponse.ok) {
                status = vendorResponse.status;
                if (status === 404) {
                    errorMessage = "Vendors Not Found";
                    errorDescription = "The Vendors you're looking for do not exist.";
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

        const [vendor] = await Promise.all([
            vendorResponse.json(),
        ]);

        return {
            API_URL: apiEndpoint,
            vendor: vendor.data,
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

export default function EditVendor() {
    const { API_URL, vendor, error, message, description, status } =
        useLoaderData();
    const fetcher = useFetcher();
    const params = useParams();
    const navigate = useNavigate();
    const [actionData, setActionData] = useState();
    const [loading, setLoading] = useState(false);
    //image upload
    const [image, setImage] = useState(vendor.image_uuid || "");
    const [preview, setPreview] = useState(vendor.image_url || "");
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
        console.log(event.target.files[0]);

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

    const [selected, setSelected] = useState(vendor.vendor_type);
    const handleCheckboxChange = (type) => {
        setSelected(selected === type ? null : type);
    };
    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            vendor_type: selected,
        }));
    }, [selected]);

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
    const [formData, setFormData] = useState({
        vendor_name: vendor.vendor_name || "",
        vendor_type: vendor.vendor_type || null,
        vendor_street: vendor.vendor_street || "",
        vendor_city: vendor.vendor_city || "",
        vendor_state: vendor.vendor_state || "",
        vendor_zip: vendor.vendor_zip || "",
        vendor_phone: vendor.vendor_phone || "",
        vendor_mobile: vendor.vendor_mobile || "",
        vendor_email: vendor.vendor_email || "",
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
        try {
            const response = await fetch(`${API_URL}/vendors/${params.vendor_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vendor_name: formData.vendor_name,
                    vendor_type: formData.vendor_type,
                    vendor_street: formData.vendor_street,
                    vendor_city: formData.vendor_city,
                    vendor_state: formData.vendor_state,
                    vendor_zip: formData.vendor_zip,
                    vendor_phone: formData.vendor_phone,
                    vendor_mobile: formData.vendor_mobile,
                    vendor_email: formData.vendor_email,
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
                    vendor_name: "",
                    vendor_type: null,
                    vendor_street: "",
                    vendor_city: "",
                    vendor_state: "",
                    vendor_zip: "",
                    vendor_phone: "",
                    vendor_mobile: "",
                    vendor_email: "",
                });
                navigate("/purchase/vendors");
            }
        } catch (error) {
            console.error(error);
        }
    };
    //delete product
    const handleDeleteVendor = async () => {
        try {
            const response = await fetch(`${API_URL}/vendors/${params.vendor_id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                localStorage.removeItem("image_url");
                localStorage.removeItem("image");
                navigate("/purchase/vendors");
            } else {
                const errorData = await response.json();
                console.error("Failed to delete vendor:", errorData);
            }
        } catch (error) {
            console.error("Error deleting vendor:", error);
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
                                                    Vendors
                                                </Link>
                                            </div>
                                        </li>
                                        <li aria-current="page">
                                            <div className="flex items-center text-gray-400">
                                                <CaretRight size={18} weight="bold" />
                                                <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                                                    Edit Vendor
                                                </span>
                                            </div>
                                        </li>
                                    </ol>
                                </nav>
                                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                                    Vendor
                                </h2>
                            </div>
                        </div>
                        {loading ? (
                            <Loading />
                        ) : (
                            <Form onSubmit={handleUpdate} encType="multipart/form-data">
                                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
                                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                        <div className="grid gap-4 sm:grid-cols-6 sm:gap-6 w-full order-2 md:order-1">
                                            <div className="sm:col-span-6 flex flex-row gap-3">
                                                <div className="flex items-center">
                                                    <input
                                                        id="default-radio-1"
                                                        type="radio"
                                                        value=""
                                                        checked={selected === 'Individual'}
                                                        name="default-radio"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        onChange={() => handleCheckboxChange('Individual')}
                                                    />
                                                    <label
                                                        htmlFor="default-radio-1"
                                                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                    >
                                                        Individual
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        id="default-radio-2"
                                                        type="radio"
                                                        value=""
                                                        checked={selected === 'Company'}
                                                        name="default-radio"
                                                        onChange={() => handleCheckboxChange('Company')}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label
                                                        htmlFor="default-radio-2"
                                                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                    >
                                                        Company
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="vendor_name"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Vendor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_name"
                                                    id="vendor_name"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_name
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder="Type vendor name"
                                                    value={formData.vendor_name}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_name && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label
                                                    htmlFor="vendor_street"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Street
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_street"
                                                    id="vendor_street"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_street
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder=""
                                                    value={formData.vendor_street}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_street && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_street}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="city"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_city"
                                                    id="vendor_city"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_city
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder=""
                                                    value={formData.vendor_city}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_city && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_city}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="vendor_state"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    State
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_state"
                                                    id="vendor_state"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_state
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder=""
                                                    value={formData.vendor_state}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_state && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_state}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="vendor_zip"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Zip
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_zip"
                                                    id="vendor_zip"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_zip
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder="12345"
                                                    value={formData.vendor_zip}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_zip && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                                        {actionData.errors.vendor_zip}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="vendor_phone"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_phone"
                                                    id="vendor_phone"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_phone
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder=""
                                                    value={formData.vendor_phone}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_phone && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="vendor_mobile"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Mobile
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_mobile"
                                                    id="vendor_mobile"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_mobile
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder=""
                                                    value={formData.vendor_mobile}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_mobile && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {actionData?.errors.vendor_mobile}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="vendor_email"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendor_email"
                                                    id="vendor_email"
                                                    autoComplete="off"
                                                    className={`bg-gray-50 border ${actionData?.errors?.vendor_email
                                                        ? "border-red-500 dark:border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                                    placeholder="example@gmail.com"
                                                    value={formData.vendor_email}
                                                    onChange={handleChange}
                                                />
                                                {actionData?.errors?.vendor_email && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                                        {actionData.errors.vendor_email}
                                                    </p>
                                                )}
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
                                                    className={`bg-gray-50 border ${actionData?.errors?.image_uuid
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
                                </div>
                                <div className="flex flex-row gap-3">
                                    <button
                                        type="submit"
                                        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                    >
                                        Update Vendor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteVendor()}
                                        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                    >
                                        Delete Vendor
                                    </button>
                                </div>
                            </Form>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
