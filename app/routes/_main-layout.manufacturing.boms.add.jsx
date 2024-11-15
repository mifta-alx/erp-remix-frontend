import { CaretRight, Check, House, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { ErrorView, Loading } from "@views/index.js";
import { SearchInput } from "@components/index.js";
import TableBom from "@views/TableBom.jsx";

export const meta = () => {
  return [
    { title: "F&F - Add Bills of Materials" },
    { name: "description", content: "Add Bills of Materials" },
  ];
};

export const loader = async () => {
  let apiEndpoint = process.env.API_URL;
  try {
    const response = await fetch(
      `${process.env.API_URL}/init?products&materials`
    );
    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching data.";
      let status = response.status;

      if (response.status === 500) {
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

    const { data } = await response.json();

    return {
      API_URL: apiEndpoint,
      products: data.products,
      materials: data.materials,
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

export default function AddBom() {
  const navigate = useNavigate();
  const { API_URL, products, materials, error, message, description, status } =
    useLoaderData();
  const [loading, setLoading] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [actionData, setActionData] = useState();

  const [formData, setFormData] = useState({
    product_id: "",
    reference: "",
    qty: "",
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

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formattedData = {
      product_id: formData.product_id,
      bom_qty: formData.qty || 0,
      bom_reference: formData.reference,
      bom_components: materialsArr.map((material) => ({
        material_id: material.material_id,
        material_qty: material.material_qty,
      })),
    };
    try {
      const response = await fetch(`${API_URL}/boms`, {
        method: "POST",
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
      setLoading(false);
      navigate(`/manufacturing/boms`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDiscard = () => {
    navigate("/manufacturing/boms");
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
                        New Bills of Materials
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Bills of Materials
                </h2>
                <div className="inline-flex w-full sm:w-fit" role="group">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                  >
                    <Check size={16} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="inline-flex items-center px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                  >
                    <X size={16} />
                    Discard
                  </button>
                </div>
              </div>
            </div>
            {loading ? (
              <Loading />
            ) : (
              <Form onSubmit={handleSubmit}>
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
            )}
          </>
        )}
      </div>
    </section>
  );
}
