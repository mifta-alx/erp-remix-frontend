import { Check, ChevronRight, House, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DateInput, SearchInput, Spinner } from "@components/index.js";
import { ErrorView, TableQuotation, TableRFQ } from "@views/index.js";
import { formatPrice, unformatPriceBase } from "@utils/formatPrice.js";
import { unformatToDecimal } from "@utils/formatDecimal.js";
import { json } from "@remix-run/node";
import { formatCustomerName } from "@utils/formatName.js";
import { useToast } from "@context/ToastContext.jsx";

export const meta = ({ data }) => {
  const { menu } = data;
  const title = menu === "purchase" ? "Add Request for Quotation" : "Quotation";
  return [
    { title: `F&F - ${title}` },
    { name: "description", content: `${title}` },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu } = params;
  if (menu !== "purchase" && menu !== "sales") {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }

  if (
    (menu === "purchase" && submenu !== "rfq" && submenu !== "po") ||
    (menu === "sales" && submenu !== "quotation" && submenu !== "sales-order")
  ) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }

  let apiEndpoint = process.env.API_URL;
  try {
    const response = await fetch(
      `${process.env.API_URL}/init?vendors&materials&customers&products&payment_terms`
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
      products: data.products,
      customers: data.customers,
      payment_terms: data.payment_terms,
      menu,
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

export default function AddPageQuotation() {
  const params = useParams();
  const { menu, submenu } = params;
  const showToast = useToast();
  const navigate = useNavigate();
  const {
    API_URL,
    vendors,
    materials,
    products,
    payment_terms,
    customers,
    error,
    message,
    description,
    status,
  } = useLoaderData();
  const [loading, setLoading] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [productArr, setProductArr] = useState([]);
  const [actionData, setActionData] = useState();
  const [dataTotal, setDataTotal] = useState({
    untaxed: 0,
    taxes: 0,
    total: 0,
  });
  const thisDay = new Date();
  const [hasTax, setHasTax] = useState(false);
  const expirationDate = new Date();
  expirationDate.setDate(thisDay.getDate() + 30);
  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor_reference: "",
    order_date: thisDay,
    state: 1,
    invoice_status: 1,
    customer_id: "",
    expiration: expirationDate,
    payment_term_id: "",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      let totalTax = 0;
      let totalSubtotal = 0;

      if (menu === "purchase") {
        totalTax = materialsArr.reduce(
          (acc, material) =>
            acc + parseFloat((material.tax / 100) * material.subtotal || 0),
          0
        );
        totalSubtotal = materialsArr.reduce(
          (acc, material) => acc + parseFloat(material.subtotal || 0),
          0
        );
        const materialsWithTax = materialsArr.some(
          (material) => material.tax > 0
        );
        setHasTax(materialsWithTax);
      } else {
        totalTax = productArr.reduce(
          (acc, product) =>
            acc + parseFloat((product.tax / 100) * product.subtotal || 0),
          0
        );
        totalSubtotal = productArr.reduce(
          (acc, product) => acc + parseFloat(product.subtotal || 0),
          0
        );
        const productWithTax = productArr.some((product) => product.tax > 0);
        setHasTax(productWithTax);
      }

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
  }, [materialsArr, productArr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitRfq = async (e) => {
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
        id: material.id,
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
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setActionData({ errors: result.errors || {} });
        } else {
          showToast(result.message, "danger");
        }
        return;
      }
      navigate(`/${menu}/${submenu}`);
      showToast(result.message, "success");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuotation = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formattedData = {
      customer_id: formData.customer_id,
      expiration: formData.expiration,
      payment_term_id: formData.payment_term_id,
      state: formData.state,
      invoice_status: formData.invoice_status,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: productArr.map((product) => ({
        type: product.type,
        id: product.id,
        description: product.description,
        qty: unformatToDecimal(product.qty),
        unit_price: unformatPriceBase(product.unit_price),
        tax: product.tax,
        subtotal: product.subtotal,
      })),
    };

    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setActionData({ errors: result.errors || {} });
        } else {
          showToast(result.message, "danger");
        }
        return;
      }
      navigate(`/${menu}/${submenu}`);
      showToast(result.message, "success");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate(`/${menu}/${submenu}`);
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
                        to={`/${menu}/${submenu}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {menu === "purchase"
                          ? submenu === "rfq"
                            ? "Request for Quotations"
                            : "Purchase Orders"
                          : menu === "sales"
                          ? submenu === "quotation"
                            ? "Quotations"
                            : "Sales Orders"
                          : null}
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        New
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  {menu === "purchase"
                    ? submenu === "rfq"
                      ? "Request for Quotations"
                      : "Purchase Orders"
                    : menu === "sales"
                    ? submenu === "quotation"
                      ? "Quotations"
                      : "Sales Orders"
                    : null}
                </h2>
                <div className="inline-flex w-full sm:w-fit" role="group">
                  <button
                    type="button"
                    onClick={
                      menu === "purchase"
                        ? handleSubmitRfq
                        : handleSubmitQuotation
                    }
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
                  {menu === "purchase" ? "RFQ" : "Quotation"}
                </span>
              </div>
              {menu === "purchase" ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                    <SearchInput
                      name="customer_id"
                      data={customers}
                      label="Customer"
                      placeholder="Select Customer"
                      valueKey="id"
                      displayKey="name"
                      getDisplayString={formatCustomerName}
                      onChange={handleChange}
                      error={actionData?.errors?.customer_id}
                      value={formData.customer_id}
                    />
                    <div>
                      <label
                        htmlFor="expiration"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Expiration
                      </label>
                      <DateInput
                        name="expiration"
                        onChange={handleChange}
                        value={formData.expiration}
                      />
                    </div>
                    <div>
                      <SearchInput
                        name="payment_term_id"
                        data={payment_terms}
                        label="Payment Terms"
                        placeholder="Payment Terms"
                        valueKey="id"
                        displayKey="name"
                        onChange={handleChange}
                        error={actionData?.errors?.payment_term_id}
                        value={formData.payment_term_id}
                      />
                    </div>
                  </div>
                  <TableQuotation
                    endpoint={API_URL}
                    currentState={formData.state}
                    products={products}
                    actionData={actionData}
                    productArr={productArr}
                    setProductArr={setProductArr}
                  />
                </>
              )}
              <div className="flex justify-end">
                <div className="flex flex-col gap-2 w-fit mt-8">
                  {hasTax && (
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
                  )}
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
