import {
  CaretRight,
  Check,
  House,
  List,
  TrashSimple,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { ErrorView } from "@views/index.js";
import { SearchInput } from "@components/index.js";
import TableBom from "@views/TableBom.jsx";
import { formatToDecimal } from "@utils/formatDecimal.js";

export const meta = ({ data }) => {
  const formattedName = `${
    data.boms?.bom_reference ? data.boms.bom_reference + ":" : ""
  } ${
    data.boms?.product?.internal_reference
      ? `[${data.boms.product.internal_reference}]`
      : ""
  } ${data.boms?.product?.name || ""}`;
  return [
    { title: `F&F - ${formattedName}` },
    { name: "description", content: `${formattedName}` },
  ];
};

export const loader = async ({ params }) => {
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, bomsResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?products&materials`),
      fetch(`${process.env.API_URL}/boms/${params.bom_id}`),
    ]);
    if (!initResponse.ok || !bomsResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok ? initResponse.status : bomsResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Bills of Materials Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "Bills of Materials you're looking for do not exist.";
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

    const [init, boms] = await Promise.all([
      initResponse.json(),
      bomsResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      products: init.data.products,
      materials: init.data.materials,
      boms: boms.data,
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

export default function DetailedBoM() {
  const navigate = useNavigate();
  const params = useParams();
  const {
    API_URL,
    products,
    materials,
    boms,
    error,
    message,
    description,
    status,
  } = useLoaderData();
  const [loading, setLoading] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [actionData, setActionData] = useState();

  const formattedName = `${
    boms?.bom_reference ? boms.bom_reference + ":" : ""
  } ${
    boms?.product?.internal_reference
      ? `[${boms.product.internal_reference}]`
      : ""
  } ${boms?.product?.name || ""}`;

  const [formData, setFormData] = useState({
    product_id: boms.product.id || "",
    reference: boms.bom_reference || "",
    qty: formatToDecimal(boms.bom_qty) || formatToDecimal(1),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getDisplayStringProducts = (item) => {
    return item.internal_reference
      ? `[${item.internal_reference}] ${item.product_name}`
      : item.product_name;
  };

  const handleProductChange = (product) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      product_id: product,
    }));
  };

  const handleFormatDecimal = (value) => {
    const updatedValue =
      value === "" ? formatToDecimal(1) : formatToDecimal(parseFloat(value));
    setFormData((prevFormData) => ({
      ...prevFormData,
      qty: updatedValue,
    }));
  };

  useEffect(() => {
    setMaterialsArr(
      boms.bom_components.map((component) => ({
        material_id: component.material.id,
        searchTerm: `[${component.material.internal_reference}] ${component.material.name}`,
        material_qty: formatToDecimal(component.material_qty),
      }))
    );
  }, [boms]);

  const [initialFormData, setInitialFormData] = useState(formData);
  const [initialMaterial, setInitialMaterial] = useState([]);
  const [submitted, setSubmitted] = useState(true);

  useEffect(() => {
    if (materialsArr.length > 0) {
      setInitialMaterial(materialsArr); // Only update when materialsArr has data
    }
  }, [materialsArr]);

  // Handle formData changes separately
  useEffect(() => {
    const isChanged =
      formData.product_id !== initialFormData.product_id ||
      formData.qty !== initialFormData.qty ||
      formData.reference !== initialFormData.reference;

    if (isChanged) {
      setSubmitted(false);
    } else {
      setSubmitted(true);
    }
  }, [formData, initialFormData]);

  // Handle materialsArr changes separately
  useEffect(() => {
    const isMaterialChanged = materialsArr.some((material, index) => {
      const initialMaterials = initialMaterial[index];
      return (
        initialMaterials &&
        (material.material_id !== initialMaterials.material_id ||
          material.material_qty !== initialMaterials.material_qty)
      );
    });

    if (isMaterialChanged) {
      setSubmitted(false);
    }
  }, [materialsArr, initialMaterial]);

  // Handle actionData changes
  useEffect(() => {
    const isActionDataAvailable =
      actionData && Object.keys(actionData).length > 0;

    if (isActionDataAvailable) {
      setSubmitted(false);
    }
  }, [actionData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formattedData = {
      product_id: formData.product_id,
      bom_qty: formatToDecimal(parseFloat(formData.qty)),
      bom_reference: formData.reference,
      bom_components: materialsArr.map((material) => ({
        material_id: material.material_id,
        material_qty: formatToDecimal(material.material_qty),
      })),
    };

    try {
      const response = await fetch(`${API_URL}/boms/${params.bom_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const result = await response.json();
        setActionData({ errors: result.errors || {} });
        return;
      }
      setSubmitted(true);
      setActionData(null);
      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  //delete product
  const handleDeleteBom = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/boms/${params.bom_id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLoading(false);
        navigate("/manufacturing/boms");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete bom:", errorData);
      }
    } catch (error) {
      console.error("Error deleting bom:", error);
    } finally {
      setLoading(false);
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
                  <li>
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <Link
                        to="/manufacturing/boms"
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Bills of Materials
                      </Link>
                    </div>
                  </li>
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
                  Bills of Materials
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-fit">
                  <Link
                    to={`/manufacturing/boms/${params.bom_id}/overview`}
                    className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  >
                    <List size={16} weight="bold" />
                    BoM Overview
                  </Link>
                  <div className="inline-flex w-full sm:w-fit" role="group">
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={handleUpdate}
                      className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
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
                      onClick={handleDeleteBom}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      <TrashSimple size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Form onSubmit={handleUpdate}>
              <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                  <SearchInput
                    data={products}
                    label="Product"
                    placeholder="Select Product"
                    valueKey="product_id"
                    displayKey="product_name"
                    getDisplayString={getDisplayStringProducts}
                    onChange={handleProductChange}
                    error={actionData?.errors?.product_id}
                    value={formData.product_id}
                  />
                  <div>
                    <label
                      htmlFor="price"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      id="price"
                      className={`bg-gray-50 border 
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                      placeholder="BOM-001"
                      value={formData.reference}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="qty"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Quantity
                    </label>
                    <input
                      type="text"
                      id="qty"
                      name="qty"
                      className={`bg-gray-50 border ${
                        actionData?.errors?.bom_qty
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                      placeholder="0"
                      value={formData.qty}
                      onBlur={(e) => handleFormatDecimal(e.target.value)}
                      onChange={handleChange}
                    />
                    {actionData?.errors?.bom_qty && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {actionData.errors.bom_qty}
                      </p>
                    )}
                  </div>
                </div>
                <TableBom
                  materials={materials}
                  actionData={actionData}
                  materialsArr={materialsArr}
                  setMaterialsArr={setMaterialsArr}
                />
              </div>
            </Form>
          </>
        )}
      </div>
    </section>
  );
}
