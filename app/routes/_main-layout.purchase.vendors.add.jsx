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

export const meta = () => {
    return [
        { title: "ERP-Add Vendors" },
        { name: "description", content: "Add Vendors" },
    ];
};

export const loader = async () => {
    let apiEndpoint = process.env.API_URL;
    try {
        if (!apiEndpoint) {
            throw new Error("Something went wrong while fetching Vendors.");
        }
        // const [categoriesResponse, tagResponse] = await Promise.all([
        //     fetch(`${process.env.API_URL}/categories`),
        //     fetch(`${process.env.API_URL}/tags`),
        // ]);
        // if (!categoriesResponse.ok || !tagResponse.ok) {
        //     let errorMessage = "An error occurred.";
        //     let errorDescription = "Something went wrong while fetching Vendors.";
        //     let status;
        //     if (status === 500) {
        //         errorMessage = "Internal Server Error";
        //         errorDescription =
        //             "There is an issue on our server. Our team is working to resolve it.";
        //     }
        //     return {
        //         error: true,
        //         status,
        //         message: errorMessage,
        //         description: errorDescription,
        //     };
        // }
        return {
            API_URL: apiEndpoint,
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
    const { API_URL, error, message, description, status } =
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


    //vendors category
    const [selected, setSelected] = useState(null);
    const handleCheckboxChange = (type) => {
        setSelected(selected === type ? null : type);
    };
    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            vendor_type: selected,
        }));
    }, [selected]);

    const [formData, setFormData] = useState({
        vendor_name: "",
        vendor_type: null,
        vendor_street: "",
        vendor_city: "",
        vendor_state: "",
        vendor_zip: "",
        vendor_phone: "",
        vendor_mobile: "",
        vendor_email: "",
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
        try {
            const response = await fetch(`${API_URL}/vendors`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vendor_name: formData.vendor_name,
                    vendor_type: selected,
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
            console.log(response);
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
                    image_uuid: "",
                });
                navigate("/purchase/vendors");
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
                                                    Add Vendors
                                                </span>
                                            </div>
                                        </li>
                                    </ol>
                                </nav>
                                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                                    Add a new Vendor
                                </h2>
                            </div>
                        </div>
                        {fetcher.state === "loading" ? (
                            <p className="text-center text-gray-500">
                                Adding vendor, please wait...
                            </p>
                        ) : (
                            <Form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                    <div className="grid gap-4 sm:grid-cols-6 sm:gap-6 w-full order-2 md:order-1">
                                        <div className="sm:col-span-6">
                                            <div className="flex flex-row">
                                                <div className="flex items-center pr-4">
                                                    <input
                                                        type="checkbox"
                                                        name="vendor_type"
                                                        id="individual"
                                                        autoComplete="off"
                                                        checked={selected === 'Individual'}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        onChange={() => handleCheckboxChange('Individual')}
                                                    />
                                                    <label
                                                        htmlFor="individual"
                                                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                    >
                                                        Individual
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="vendor_type"
                                                        id="company"
                                                        autoComplete="off"
                                                        checked={selected === 'Company'}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        onChange={() => handleCheckboxChange('Company')}
                                                    />
                                                    <label
                                                        htmlFor="company"
                                                        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                    >
                                                        Company
                                                    </label>
                                                </div>
                                            </div>

                                            {/* {actionData?.errors?.material_name && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {actionData?.errors.material_name}
                                                </p>
                                            )} */}
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
                                                htmlFor="street"
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

                                        <div className="sm:col-span-3">
                                            <div className="">
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
                                            <div className="pt-3">
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
                                            <div className="pt-3">
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

                                        </div>
                                        <div className="sm:col-span-3">
                                            <div className="">
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
                                            <div className="pt-3">
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
                                            <div className="pt-3">
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
                                <button
                                    type="submit"
                                    className="text-gray-900 bg-white mt-4 sm:mt-6 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                >
                                    Add Vendor
                                </button>
                            </Form>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
