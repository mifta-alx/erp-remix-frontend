import { CaretRight, Check, House, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import { ErrorView, StepperMO, TableMO } from "@views/index.js";
import { SearchInput, Spinner } from "@components/index.js";
import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatBomName, formatProductName } from "@utils/formatName.js";

export const meta = ({ data }) => {
  const reference = data.mo.reference;
  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference} Manufacturing Order` },
  ];
};

export const loader = async ({ params }) => {
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, moResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?products&boms`),
      fetch(`${process.env.API_URL}/manufacturing-orders/${params.mo_id}`),
    ]);
    if (!initResponse.ok || !moResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok ? initResponse.status : moResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Manufacturing Orders Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "Manufacturing Orders you're looking for do not exist.";
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

    const [init, mo] = await Promise.all([
      initResponse.json(),
      moResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      products: init.data.products,
      boms: init.data.boms,
      mo: mo.data,
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

const DetailedMo = () => {
  const params = useParams();
  const { API_URL, products, boms, mo, error, message, description, status } =
    useLoaderData();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [actionData, setActionData] = useState();
  const [filteredBoms, setFilteredBoms] = useState([]);
  const [dataBom, setDataBom] = useState();
  const [formData, setFormData] = useState({
    product_id: mo.product.id || "",
    bom_id: mo.bom_id || "",
    qty: formatToDecimal(mo.qty || 1),
    state: mo.state,
    status: mo.status || "process",
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

  useEffect(() => {
    const fixBom = boms.find((bom) => bom?.bom_id === formData.bom_id);
    setDataBom(fixBom);
  }, [formData.bom_id]);

  const [materials, setMaterials] = useState(mo.mo_components);

  useEffect(() => {
    if (formData.state > 1) {
      setMaterials(mo.mo_components);
    } else {
      const selectedBom = filteredBoms.find(
        (bom) => bom.bom_id === parseInt(formData.bom_id)
      );
      if (selectedBom) {
        setMaterials(selectedBom.bom_components);
      } else {
        setMaterials([]);
      }
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

  const handleCancel = async () => {
    if (formData.status !== "failed" || formData.state !== 5) {
      setLoadingCancel(true);
      //draft -> mark as to do
      const updatedFormData = {
        ...formData,
        state: parseInt(formData.state),
        status: "failed",
      };

      try {
        const response = await fetch(
          `${API_URL}/manufacturing-orders/${params.mo_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedFormData),
          }
        );
        if (response.ok) {
          const result = await response.json();
          const { data } = result;

          // Update formData dan materials
          setFormData((prevState) => ({
            ...prevState,
            state: data.state,
            status: data.status,
          }));

          setMaterials(data.mo_components);
        } else {
          console.error(
            "Failed to update manufacturing order:",
            response.status
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCancel(false);
      }
    } else {
      return false;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.status !== "failed" || formData.state < 5) {
      setLoadingUpdate(true);
      //updating state form data
      const updatedFormData = {
        ...formData,
        state: parseInt(formData.state) + 1,
      };

      try {
        const response = await fetch(
          `${API_URL}/manufacturing-orders/${params.mo_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedFormData),
          }
        );
        if (response.ok) {
          const result = await response.json();
          const { data } = result;

          // Update formData dan materials
          setFormData((prevState) => ({
            ...prevState,
            state: data.state,
            status: data.status,
          }));

          setMaterials(data.mo_components);
        } else {
          console.error(
            "Failed to update manufacturing order:",
            response.status
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUpdate(false);
      }
    } else {
      return false;
    }
  };

  const sourcePage = [
    {
      title: "Manufacturing Orders",
      url: "/manufacturing/mo",
    },
    {
      title: mo.reference,
      url: `/manufacturing/mo/${params.mo_id}`,
    },
  ];

  const getStringButton = {
    1: "Mark as To Do",
    2: "Check Availability",
    3: "Produce",
    4: "Mark as Done",
    5: "Done",
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
                        to="/manufacturing/mo"
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Manufacturing Orders
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {mo.reference}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full min-h-[38px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Manufacturing Orders
                </h2>
                {formData.state < 5 && formData.status !== "failed" && (
                  <div className="inline-flex w-full sm:w-fit" role="group">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      {loadingUpdate ? <Spinner /> : <Check size={16} />}
                      {getStringButton[formData.state]}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingCancel ? <Spinner /> : <X size={16} />}
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Form onSubmit={handleUpdate}>
              <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
                <div className="pt-8 sm:pb-20 pb-16">
                  <StepperMO
                    currentStep={formData.state}
                    status={formData.status}
                  />
                </div>
                {formData.state > 1 || formData.state === 0 ? (
                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Product
                      </p>
                      <Link
                        to={`/manufacturing/products/${mo.product.id}`}
                        state={sourcePage}
                        className="bg-white border border-gray-300 dark:border-gray-700 text-primary-600 font-medium text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                      >
                        {formatProductName(mo.product)}
                      </Link>
                    </div>
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Bills of Materials
                      </p>
                      <Link
                        to={`/manufacturing/boms/${mo.bom_id}`}
                        state={sourcePage}
                        className="bg-white border border-gray-300 dark:border-gray-700 text-primary-600 font-medium text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                      >
                        {formatBomName(dataBom)}
                      </Link>
                    </div>
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Quantity to Produce
                      </p>
                      <p className="bg-white border border-gray-300 dark:border-gray-700 text-gray-500 font-medium text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                        {formData.qty}
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}
                <TableMO
                  materials={materials}
                  currentState={formData.state}
                  status={formData.status}
                />
              </div>
            </Form>
          </>
        )}
      </div>
    </section>
  );
};

export default DetailedMo;
