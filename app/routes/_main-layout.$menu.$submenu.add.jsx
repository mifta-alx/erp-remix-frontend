import { CaretRight, Check, House, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DateInput, SearchInput, Spinner } from "@components/index.js";
import { ErrorView, TableRFQ } from "@views/index.js";
import { formatPrice, unformatPriceBase } from "@utils/formatPrice.js";
import { unformatToDecimal } from "@utils/formatDecimal.js";
import { json } from "@remix-run/node";

export const meta = () => {
  return [
    { title: "F&F - Add Request for Quotation" },
    { name: "description", content: "Add Request for Quotation" },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu } = params;
  if (menu !== "purchase" || (submenu !== "rfq" && submenu !== "po")) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }
  let apiEndpoint = process.env.API_URL;
  try {
    const response = await fetch(
      `${process.env.API_URL}/init?vendors&materials`
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
      vendors: data.vendors,
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

export default function AddRequestForQuotation() {
  const params = useParams();
  const { menu, submenu } = params;
  const navigate = useNavigate();
  const { API_URL, vendors, materials, error, message, description, status } =
    useLoaderData();
  const [loading, setLoading] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [actionData, setActionData] = useState();
  const [dataTotal, setDataTotal] = useState({
    untaxed: 0,
    taxes: 0,
    total: 0,
  });
  const thisDay = new Date();
  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor_reference: "",
    order_date: thisDay,
    state: 1,
    invoice_status: 1,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      const totalTax = materialsArr.reduce(
        (acc, material) =>
          acc + parseFloat((material.tax / 100) * material.subtotal || 0),
        0
      );
      const totalSubtotal = materialsArr.reduce(
        (acc, material) => acc + parseFloat(material.subtotal || 0),
        0
      );
      const totalPay = totalSubtotal + totalTax;

      setDataTotal((prevData) => ({
        ...prevData,
        tax: totalTax,
        untaxed: totalSubtotal,
        total: totalPay,
      }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [materialsArr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formattedData = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
      state: formData.state,
      invoice_status: formData.invoice_status,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: materialsArr.map((material) => ({
        type: material.type,
        material_id: material.material_id,
        description: material.description,
        qty: unformatToDecimal(material.qty),
        unit_price: unformatPriceBase(material.unit_price),
        tax: material.tax,
        subtotal: material.subtotal,
      })),
    };

    try {
      const response = await fetch(`${API_URL}/rfqs`, {
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
      navigate(`/${menu}/${submenu}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate(`/${menu}/${submenu}`);
  };
  // const handleDashboardClick = () => {
  //   console.log("Dashboard clicked!");
  // };
  //
  // const handleSettingsClick = () => {
  //   console.log("Settings clicked!");
  // };
  //
  // const items = [
  //   { label: "Send by Email", onClick: handleDashboardClick },
  //   { label: "Print", onClick: handleSettingsClick },
  // ];

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
                        to={`/${menu}/${submenu}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {submenu === "rfq"
                          ? "Request for Quotations"
                          : "Purchase Orders"}
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
                  Request for Quotation
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
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
              <div className="flex gap-4 items-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  New
                </h2>
                <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                  RFQ
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                <SearchInput
                  name="vendor_id"
                  data={vendors}
                  label="Vendor"
                  placeholder="Select Vendor"
                  valueKey="id"
                  displayKey="name"
                  onChange={handleChange}
                  error={actionData?.errors?.vendor_id}
                  value={formData.vendor_id}
                />
                <div>
                  <label
                    htmlFor="vendor_reference"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Vendor Reference
                  </label>
                  <input
                    type="text"
                    name="vendor_reference"
                    id="vendor_reference"
                    className={`bg-gray-50 border
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                    placeholder="Type Vendor Reference"
                    value={formData.vendor_reference}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="order_date"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Order Date
                  </label>
                  <DateInput
                    name="order_date"
                    onChange={handleChange}
                    value={formData.order_date}
                  />
                </div>
              </div>
              <TableRFQ
                endpoint={API_URL}
                currentState={formData.state}
                materials={materials}
                actionData={actionData}
                materialsArr={materialsArr}
                setMaterialsArr={setMaterialsArr}
              />
              <div className="flex justify-end">
                <div className="flex flex-col gap-2 w-fit mt-8">
                  <div className="grid grid-cols-2 gap-2 text-end">
                    <div className="text-gray-800 dark:text-gray-100 font-semibold text-sm space-y-2">
                      <p>Untaxed Amount:</p>
                      <p>Taxes:</p>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 font-normal text-sm space-y-2">
                      <p>{formatPrice(dataTotal.untaxed)}</p>
                      <p>{formatPrice(dataTotal.tax)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-t items-center border-gray-300 gap-2 text-end py-2">
                    <div className="text-gray-500 dark:text-gray-400 font-normal text-sm space-y-2">
                      <p>Total:</p>
                    </div>
                    <div className="text-gray-800 dark:text-gray-100 font-semibold text-xl space-y-2">
                      <p>{formatPrice(dataTotal.total)}</p>
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
