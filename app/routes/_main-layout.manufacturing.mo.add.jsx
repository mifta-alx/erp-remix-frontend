import { Check, ChevronRight, House, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { ErrorView, StepperMO, TableMO } from "@views/index.js";
import { SearchInput, Spinner } from "@components/index.js";
import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatBomName, formatProductName } from "@utils/formatName.js";

export const meta = () => {
  return [
    { title: "F&F - Add Manufacturing Order" },
    { name: "description", content: "Add Manufacturing Order" },
  ];
};

export const loader = async () => {
  let apiEndpoint = process.env.API_URL;
  try {
    const response = await fetch(`${process.env.API_URL}/init?products&boms`);
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
      boms: data.boms,
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

export default function AddMo() {
  const navigate = useNavigate();
  const { API_URL, products, boms, error, message, description, status } =
    useLoaderData();
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState();
  const [filteredBoms, setFilteredBoms] = useState([]);

  const [formData, setFormData] = useState({
    product_id: "",
    bom_id: "",
    qty: formatToDecimal(1),
    state: 1,
    status: "process",
  });

  useEffect(() => {
    const fetchFilteredBoms = async () => {
      if (formData.product_id) {
        try {
          const response = await fetch(
            `${API_URL}/boms?product_id=${formData.product_id}`
          );
          if (response.ok) {
            const { data } = await response.json();
            setFilteredBoms(data);

            if (data.length > 0) {
              setFormData((prevData) => ({
                ...prevData,
                bom_id: data[0].bom_id,
              }));
            } else {
              setFormData((prevData) => ({
                ...prevData,
                bom_id: "",
              }));
            }
          } else {
            console.error(
              "Failed to fetch filtered BoMs:",
              response.statusText
            );
            setFilteredBoms([]);
            setFormData((prevData) => ({
              ...prevData,
              bom_id: "",
            }));
          }
        } catch (error) {
          console.error("Error fetching filtered BoMs:", error);
          setFilteredBoms([]);
          setFormData((prevData) => ({
            ...prevData,
            bom_id: "",
          }));
        }
      } else {
        setFilteredBoms(boms);
      }
    };

    fetchFilteredBoms();
  }, [formData.product_id]);

  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const selectedBom = filteredBoms.find(
      (bom) => bom.bom_id === parseInt(formData.bom_id)
    );
    if (selectedBom) {
      setMaterials(selectedBom.bom_components);
    } else {
      setMaterials([]);
    }
  }, [formData.bom_id, filteredBoms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleBomChange = (e) => {
    const { name, value } = e.target;
    const selectedBom = filteredBoms.find(
      (bom) => bom.bom_id === parseInt(value)
    );
    if (selectedBom) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
        product_id: selectedBom.product.id,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
        product_id: null,
      }));
    }
  };
  const handleFormatDecimal = (value) => {
    const updatedValue =
      value === "" ? formatToDecimal(1) : formatToDecimal(parseFloat(value));
    setFormData((prevFormData) => ({
      ...prevFormData,
      qty: updatedValue,
    }));
  };

  const handleDiscard = () => {
    navigate("/manufacturing/mo");
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    setLoading(true);
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/manufacturing-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const result = await response.json();
        setActionData({ errors: result.errors || {} });
        return;
      }
      setLoading(false);
      navigate(`/manufacturing/mo`);
    } catch (error) {
      console.error(error);
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
                      <House size={14} strokeWidth={1.8} />
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to="/manufacturing/mo"
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Manufacturing Orders
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        New Manufacturing Orders
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Manufacturing Orders
                </h2>
                <div className="inline-flex w-full sm:w-fit" role="group">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                  >
                    {loading ? <Spinner /> : <Check size={16} />}
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
            <Form onSubmit={handleSubmit}>
              <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
                <div className="pt-8 pb-20">
                  <StepperMO
                    currentStep={formData.state}
                    status={formData.status}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                  <SearchInput
                    name="product_id"
                    data={products}
                    label="Product"
                    placeholder="Select Product"
                    valueKey="id"
                    displayKey="product_name"
                    getDisplayString={formatProductName}
                    onChange={handleChange}
                    error={actionData?.errors?.product_id}
                    value={formData.product_id}
                  />
                  <SearchInput
                    name="bom_id"
                    data={filteredBoms}
                    label="Bills of Materials"
                    placeholder="Select BoM"
                    valueKey="bom_id"
                    getDisplayString={formatBomName}
                    onChange={handleBomChange}
                    error={actionData?.errors?.bom_id}
                    value={formData.bom_id}
                  />
                  <div>
                    <label
                      htmlFor="qty"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Quantity to Produce
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
                      onBlur={(e) => handleFormatDecimal(e.target.value)}
                    />
                    {actionData?.errors?.bom_qty && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {actionData.errors.bom_qty}
                      </p>
                    )}
                  </div>
                </div>
                <TableMO materials={materials} />
              </div>
            </Form>
          </>
        )}
      </div>
    </section>
  );
}
