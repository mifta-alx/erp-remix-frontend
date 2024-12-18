import { Check, ChevronRight, House, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { DateInput, SearchInput, Spinner } from "@components/index.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import { formatPriceBase } from "@utils/formatPrice.js";
import { ErrorView, TableDelivery } from "@views/index.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";
import { json } from "@remix-run/node";
import { formatCustomerName } from "@utils/formatName.js";

export const meta = ({ data }) => {
  const reference = data.receipt.reference;
  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference} Request for Quotation` },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu, sales_id, receipt_id } = params;
  if (
    menu !== "sales" ||
    (submenu !== "quotation" && submenu !== "sales-order")
  ) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, receiptResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?customers`),
      fetch(`${process.env.API_URL}/receipts/${receipt_id}`),
    ]);
    if (!initResponse.ok || !receiptResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching receipt.";
      let status = !initResponse.ok
        ? initResponse.status
        : receiptResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : "Receipt Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "The Receipt you're looking for does not exist or may have been removed.";
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

    const [init, receipt] = await Promise.all([
      initResponse.json(),
      receiptResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      customers: init.data.customers,
      payment_terms: init.data.payment_terms,
      receipt: receipt.data,
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

export default function DeliveryQuotation() {
  const params = useParams();
  const { menu, submenu, sales_id, receipt_id } = params;
  const { API_URL, receipt, customers, error, message, description, status } =
    useLoaderData();
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [productArr, setProductArr] = useState([]);
  const [actionData, setActionData] = useState();

  const thisDay = new Date().toISOString();

  const [receiptState, setReceiptState] = useState(receipt.state);

  const [formData, setFormData] = useState({
    source_document: receipt.source_document,
    reference: receipt.reference,
    scheduled_date: receiptState >= 3 ? receipt.scheduled_date : thisDay,
    state: receipt.state,
    customer_id: receipt.customer_id,
  });

  useEffect(() => {
    setProductArr(
      receipt.items.map((product) => ({
        component_id: product.component_id,
        name: product.name,
        internal_reference: product.internal_reference,
        type: product.type,
        id: product.id,
        description: product.description,
        qty: formatToDecimal(product.qty),
        unit_price: formatPriceBase(product.unit_price),
        tax: product.tax,
        subtotal: product.subtotal,
        qty_received: formatToDecimal(
          formData.state >= 4 ? product.qty_received : product.qty
        ),
        qty_to_invoice: product.qty_to_invoice,
        qty_invoiced: product.qty_invoiced,
        reserved: product.reserved,
      }))
    );
  }, [receipt]);

  const handleValidate = async () => {
    setLoadingValidate(true);
    const formattedData = {
      transaction_type: "OUT",
      customer_id: receipt.customer_id,
      sales_id: receipt.sales_id,
      state: 4,
      scheduled_date: formData.scheduled_date,
      invoice_status: 2,
      items: productArr.map((product) => ({
        component_id: product.component_id,
        type: product.type,
        id: product.id,
        qty: product.qty,
        qty_received: unformatToDecimal(product.qty_received),
      })),
    };

    try {
      const response = await fetch(`${API_URL}/receipts/${receipt_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.status === 201) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          scheduled_date: data.scheduled_date,
          receipt: data.receipt,
        }));
        setReceiptState(data.state);
        const formattedMaterial = data.items.map((product) => ({
          component_id: product.component_id,
          name: product.name,
          internal_reference: product.internal_reference,
          type: product.type,
          id: product.id,
          description: product.description,
          qty: formatToDecimal(product.qty),
          unit_price: formatPriceBase(product.unit_price),
          tax: product.tax,
          subtotal: product.subtotal,
          qty_received: product.qty_received,
          qty_to_invoice: product.qty_to_invoice,
          qty_invoiced: product.qty_invoiced,
          reserved: product.reserved,
        }));

        setProductArr(formattedMaterial);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingValidate(false);
    }
  };

  const handleCheckAvailability = async () => {
    setLoadingValidate(true);
    const formattedData = {
      transaction_type: "OUT",
      customer_id: receipt.customer_id,
      sales_id: receipt.sales_id,
      state: 2,
      scheduled_date: formData.scheduled_date,
      invoice_status: 2,
      items: productArr.map((product) => ({
        component_id: product.component_id,
        type: product.type,
        id: product.id,
        qty: product.qty,
        qty_received: unformatToDecimal(product.qty_received),
      })),
    };
    try {
      const response = await fetch(`${API_URL}/receipts/${receipt_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.status === 201) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          scheduled_date: data.scheduled_date,
          receipt: data.receipt,
        }));
        setReceiptState(data.state);

        const formattedItem = data.items.map((product) => ({
          component_id: product.component_id,
          name: product.name,
          internal_reference: product.internal_reference,
          type: product.type,
          id: product.id,
          description: product.description,
          qty: formatToDecimal(product.qty),
          unit_price: formatPriceBase(product.unit_price),
          tax: product.tax,
          subtotal: product.subtotal,
          qty_to_invoice: product.qty_to_invoice,
          qty_invoiced: product.qty_invoiced,
          qty_received: formatToDecimal(product.qty),
          reserved: product.reserved,
        }));

        setProductArr(formattedItem);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingValidate(false);
    }
  };

  const handleCancel = async () => {
    setLoadingCancel(true);
    const formattedData = {
      transaction_type: "OUT",
      customer_id: receipt.customer_id,
      sales_id: receipt.sales_id,
      state: 5,
      scheduled_date: formData.scheduled_date,
      invoice_status: 1,
      items: productArr.map((product) => ({
        component_id: product.component_id,
        id: product.id,
        qty_received: 0,
      })),
    };

    try {
      const response = await fetch(`${API_URL}/receipts/${receipt_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          scheduled_date: data.scheduled_date,
          receipt: data.receipt,
        }));

        const formattedItem = data.items.map((item) => ({
          component_id: item.component_id,
          name: item.name,
          internal_reference: item.internal_reference,
          type: item.type,
          id: item.id,
          description: item.description,
          qty: formatToDecimal(item.qty),
          unit_price: formatPriceBase(item.unit_price),
          tax: item.tax,
          subtotal: item.subtotal,
          qty_received: item.qty_received,
          qty_to_invoice: item.qty_to_invoice,
          qty_invoiced: item.qty_invoiced,
          reserved: item.reserved,
        }));

        setProductArr(formattedItem);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
                        {submenu === "quotation"
                          ? "Quotations"
                          : "Sales Orders"}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to={`/${menu}/${submenu}/${sales_id}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {receipt.source_document}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to={`/${menu}/${submenu}/${sales_id}/delivery`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        Delivery
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {receipt.reference}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  {submenu === "quotation" ? "Quotations" : "Sales Orders"}
                </h2>
                {formData.state < 4 && (
                  <div className="inline-flex w-full sm:w-fit" role="group">
                    {formData.state === 2 ? (
                      <button
                        type="button"
                        onClick={handleCheckAvailability}
                        className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                      >
                        {loadingValidate ? <Spinner /> : <Check size={16} />}
                        Check Availability
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleValidate}
                        className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                      >
                        {loadingValidate ? <Spinner /> : <Check size={16} />}
                        Validate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingCancel ? <Spinner /> : <X size={16} />}
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
              <div className="flex flex-row justify-between items-start text-gray-500">
                <div className="flex gap-4 items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                    {receipt.reference}
                  </h2>
                  {formData.state === 1 ? (
                    <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                      Draft
                    </span>
                  ) : formData.state === 2 ? (
                    <span className="inline-flex items-center bg-yellow-100 border border-yellow-500 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                      <span className="w-2 h-2 me-1 bg-yellow-500 rounded-full"></span>
                      Waiting
                    </span>
                  ) : formData.state === 3 ? (
                    <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                      <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                      Ready
                    </span>
                  ) : formData.state === 5 ? (
                    <span className="inline-flex items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                      Done
                    </span>
                  )}
                </div>
                {/*<div className="w-8 h-8 rounded-full bg-transparent flex hover:bg-gray-100 items-center justify-center">*/}
                {/*  <DotsThreeVertical weight="bold" size={24} />*/}
                {/*</div>*/}
              </div>
              {formData.state >= 4 ? (
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Delivery Address
                    </p>
                    <Link
                      to={`/purchase/vendors/${receipt.vendor_id}`}
                      className="bg-white text-primary-600 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                    >
                      {receipt.customer_company_name
                        ? `${receipt.customer_company_name}, ${receipt.customer_name}`
                        : receipt.customer_name}
                    </Link>
                  </div>
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Source Document
                    </p>
                    <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                      {receipt.source_document}
                    </p>
                  </div>
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Scheduled Date
                    </p>
                    <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                      {formatDisplayDatetime(formData.scheduled_date)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                  <SearchInput
                    name="customer_id"
                    data={customers}
                    disabled
                    label="Delivery Address"
                    placeholder="Select Customer"
                    valueKey="id"
                    displayKey="name"
                    onChange={handleChange}
                    getDisplayString={formatCustomerName}
                    error={actionData?.errors?.customer_id}
                    value={formData.customer_id}
                  />
                  <div>
                    <label
                      htmlFor="source_document"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Source Document
                    </label>
                    <input
                      type="text"
                      disabled
                      name="source_document"
                      id="source_document"
                      className={`bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                      value={formData.source_document}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="order_date"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Scheduled Date
                    </label>
                    <DateInput
                      name="scheduled_date"
                      onChange={handleChange}
                      value={formData.scheduled_date}
                    />
                  </div>
                </div>
              )}
              <TableDelivery
                currentState={formData.state}
                actionData={actionData}
                productArr={productArr}
                setProductArr={setProductArr}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
