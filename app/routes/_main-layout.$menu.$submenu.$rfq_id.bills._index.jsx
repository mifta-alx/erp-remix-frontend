import { Link, useLoaderData, useParams } from "@remix-run/react";
import {
  CaretRight,
  Check,
  CheckCircle,
  Clock,
  CurrencyDollarSimple,
  FileArrowDown,
  House,
  Printer,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { DateInput, Drawer, SearchInput, Spinner } from "@components/index.js";
import {
  formatPrice,
  formatPriceBase,
  unformatPriceBase,
} from "@utils/formatPrice.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import { ErrorView, TableVendorBill } from "@views/index.js";
import { formatBasicDate } from "@utils/formatDate.js";
import paid from "/paid.svg";
import { json } from "@remix-run/node";

export const meta = ({ data }) => {
  const reference =
    data.bill.state > 1
      ? data.bill.reference
      : `Draft bill (* ${data.bill.id})`;

  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference}` },
  ];
};

export const loader = async ({ request, params }) => {
  const url = new URL(request.url);
  const billId = url.searchParams.get("id");
  const { menu, submenu, rfq_id } = params;
  if (menu !== "purchase" || (submenu !== "rfq" && submenu !== "po")) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, invoiceResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?vendors&payment_terms`),
      fetch(`${process.env.API_URL}/invoices/${billId}`),
    ]);
    if (!initResponse.ok || !invoiceResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok
        ? initResponse.status
        : invoiceResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok ? "Data Not Found" : "Bill Not Found";
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : "Bill you're looking for do not exist.";
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

    const [init, bills] = await Promise.all([
      initResponse.json(),
      invoiceResponse.json(),
    ]);

    return {
      billId,
      API_URL: apiEndpoint,
      vendors: init.data.vendors,
      payment_terms: init.data.payment_terms,
      bill: bills.data,
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

export default function BillRequestForQuotation() {
  const params = useParams();
  const { menu, submenu, rfq_id } = params;
  const {
    billId,
    API_URL,
    vendors,
    payment_terms,
    bill,
    error,
    message,
    description,
    status,
  } = useLoaderData();
  // loading state
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  //data state
  const [materialsArr, setMaterialsArr] = useState([]);
  const [actionData, setActionData] = useState();
  const thisDay = new Date().toISOString();
  const [dataTotal, setDataTotal] = useState({
    untaxed: bill.total,
    taxes: bill.taxes,
    total: bill.total + bill.taxes,
  });

  const [formData, setFormData] = useState({
    vendor_id: bill.vendor_id,
    due_date: bill.due_date || thisDay,
    accounting_date: bill.accounting_date,
    rfq_id: bill.rfq_id,
    invoice_date: bill.invoice_date,
    state: bill.state,
    payment_term_id: bill.payment_term_id,
    payment_status: bill.payment_status,
    payment_date: bill.payment_date,
    payment_amount: bill.payment_amount,
    amount_due: bill.amount_due,
  });

  const [paymentData, setPaymentData] = useState({
    journal: 1,
    amount: formatPriceBase(dataTotal.total),
    payment_date: thisDay,
    memo: `${bill.transaction_type}/${bill.reference}`,
    payment_type: "outbound",
  });

  const journals = [
    { id: 1, name: "Bank" },
    { id: 2, name: "Cash" },
  ];

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      vendor_id: bill.vendor_id,
      due_date: bill.due_date || thisDay,
      accounting_date: bill.accounting_date,
      rfq_id: bill.rfq_id,
      invoice_date: bill.invoice_date,
      state: bill.state,
      payment_term_id: bill.payment_term_id,
      payment_status: bill.payment_status,
      payment_date: bill.payment_date,
      payment_amount: bill.payment_amount,
      amount_due: bill.amount_due,
    }));
    setMaterialsArr(
      bill.items.map((material) => ({
        component_id: material.component_id, //send
        name: material.name,
        internal_reference: material.internal_reference,
        type: material.type,
        material_id: material.id,
        description: material.description,
        qty: formatToDecimal(material.qty),
        unit_price: formatPriceBase(material.unit_price),
        tax: material.tax,
        subtotal: material.subtotal,
        qty_received: material.qty_received,
        qty_to_invoice: formatToDecimal(material.qty_to_invoice),
        qty_invoiced: formatToDecimal(material.qty_invoiced), //send
      }))
    );
  }, [bill]);

  //state button save
  const [initialFormData, setInitialFormData] = useState({});
  const [initialMaterial, setInitialMaterial] = useState([]);
  const [submitted, setSubmitted] = useState(true);
  //state additional
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({});
  const [usePaymentTerm, setUsePaymentTerm] = useState(false);
  useEffect(() => {
    setUsePaymentTerm(!!formData.payment_term_id);
  }, [formData.payment_term_id]);

  useEffect(() => {
    setInitialFormData(formData);
  }, []);

  useEffect(() => {
    if (materialsArr.length > 0) {
      setInitialMaterial(materialsArr);
    }
  }, [materialsArr]);
  //cek apakah ada perubahan pada formData
  useEffect(() => {
    const isChanged =
      formData.vendor_id !== initialFormData.vendor_id ||
      formData.due_date !== initialFormData.due_date ||
      formData.invoice_date !== initialFormData.invoice_date ||
      formData.accounting_date !== initialFormData.accounting_date ||
      formData.payment_term_id !== initialFormData.payment_term_id;

    if (isChanged) {
      setSubmitted(false);
    } else {
      setSubmitted(true);
    }
  }, [formData, initialFormData]);
  //cek apakah ada perubahan pada Material Array
  useEffect(() => {
    const isMaterialChanged = materialsArr.some((material, index) => {
      const initialMaterials = initialMaterial[index];
      return (
        initialMaterials &&
        material.qty_to_invoice !== initialMaterials.qty_to_invoice
      );
    });

    if (isMaterialChanged) {
      setSubmitted(false);
    }
  }, [materialsArr, initialMaterial]);
  //sum total
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

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const selected = vendors.find((vendor) => vendor.id === formData.vendor_id);
    setSelectedVendor(selected);
  }, [formData.vendor_id]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);
    const formattedData = {
      action_type: "confirm",
      vendor_id: formData.vendor_id,
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      accounting_date: formData.accounting_date,
      rfq_id: formData.rfq_id,
      invoice_date: formData.invoice_date,
      state: 2,
      transaction_type: "BILL",
      invoice_status: 3,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: materialsArr
        .filter((material) => material.type === "material")
        .map((material) => ({
          component_id: material.component_id,
          qty_invoiced: unformatToDecimal(material.qty_to_invoice),
        })),
    };
    try {
      const response = await fetch(`${API_URL}/invoices/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          vendor_id: data.vendor_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
          payment_amount: data.payment_amount,
          amount_due: data.amount_due,
        }));
        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
          name: material.name,
          internal_reference: material.internal_reference,
          type: material.type,
          material_id: material.id,
          description: material.description,
          qty: material.qty,
          unit_price: formatPriceBase(material.unit_price),
          tax: material.tax,
          subtotal: material.subtotal,
          qty_received: material.qty_received,
          qty_to_invoice: material.qty_to_invoice,
          qty_invoiced: formatToDecimal(material.qty_invoiced),
        }));

        setMaterialsArr(formattedMaterial);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    const formattedData = {
      action_type: "save",
      vendor_id: formData.vendor_id,
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      accounting_date: formData.accounting_date,
      rfq_id: formData.rfq_id,
      invoice_date: formData.invoice_date,
      state: 1,
      transaction_type: "BILL",
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: materialsArr
        .filter((material) => material.type === "material")
        .map((material) => ({
          component_id: material.component_id,
          qty_invoiced: unformatToDecimal(material.qty_to_invoice),
        })),
    };

    try {
      const response = await fetch(`${API_URL}/invoices/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          vendor_id: data.vendor_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
        }));

        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
          name: material.name,
          internal_reference: material.internal_reference,
          type: material.type,
          material_id: material.id,
          description: material.description,
          qty: material.qty,
          unit_price: formatPriceBase(material.unit_price),
          tax: material.tax,
          subtotal: material.subtotal,
          qty_received: material.qty_received,
          qty_to_invoice: formatToDecimal(material.qty_to_invoice),
          qty_invoiced: formatToDecimal(material.qty_invoiced),
        }));
        setSubmitted(true);
        setInitialFormData({
          vendor_id: data.vendor_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          rfq_id: data.rfq_id,
          invoice_date: data.invoice_date,
          state: data.state,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
        });
        setInitialMaterial(formattedMaterial);
        setMaterialsArr(formattedMaterial);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitted(true);
      setLoadingSave(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setLoadingCancel(true);
    const formattedData = {
      action_type: "cancel",
      vendor_id: formData.vendor_id,
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      accounting_date: formData.accounting_date,
      rfq_id: formData.rfq_id,
      invoice_date: formData.invoice_date,
      state: 3,
      transaction_type: "BILL",
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: materialsArr
        .filter((material) => material.type === "material")
        .map((material) => ({
          component_id: material.component_id,
          qty_invoiced: unformatToDecimal(material.qty_to_invoice),
        })),
    };

    try {
      const response = await fetch(`${API_URL}/invoices/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          vendor_id: data.vendor_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
        }));

        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
          name: material.name,
          internal_reference: material.internal_reference,
          type: material.type,
          material_id: material.id,
          description: material.description,
          qty: material.qty,
          unit_price: formatPriceBase(material.unit_price),
          tax: material.tax,
          subtotal: material.subtotal,
          qty_received: material.qty_received,
          qty_to_invoice: formatToDecimal(material.qty_to_invoice),
          qty_invoiced: formatToDecimal(material.qty_invoiced),
        }));
        setMaterialsArr(formattedMaterial);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleResetToDraft = async (e) => {
    e.preventDefault();
    setLoadingReset(true);
    const formattedData = {
      action_type: "reset",
      vendor_id: formData.vendor_id,
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      accounting_date: formData.accounting_date,
      rfq_id: formData.rfq_id,
      invoice_date: formData.invoice_date,
      state: 1,
      transaction_type: "BILL",
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: materialsArr
        .filter((material) => material.type === "material")
        .map((material) => ({
          component_id: material.component_id,
          qty_invoiced: unformatToDecimal(material.qty_invoiced),
        })),
    };
    try {
      const response = await fetch(`${API_URL}/invoices/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          vendor_id: data.vendor_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
        }));

        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
          name: material.name,
          internal_reference: material.internal_reference,
          type: material.type,
          material_id: material.id,
          description: material.description,
          qty: material.qty,
          unit_price: formatPriceBase(material.unit_price),
          tax: material.tax,
          subtotal: material.subtotal,
          qty_received: material.qty_received,
          qty_to_invoice: formatToDecimal(material.qty_to_invoice),
          qty_invoiced: formatToDecimal(material.qty_invoiced),
        }));

        setMaterialsArr(formattedMaterial);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleRegisterPayment = () => {
    setIsDrawerOpen(true);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    const formattedData = {
      invoice_id: billId,
      vendor_id: formData.vendor_id,
      journal: paymentData.journal,
      amount: unformatPriceBase(paymentData.amount),
      payment_date: paymentData.payment_date,
      memo: paymentData.memo,
      payment_type: paymentData.payment_type,
      payment_status: 2,
    };
    try {
      const response = await fetch(`${API_URL}/register-payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        setFormData((prevState) => ({
          ...prevState,
          state: data.state,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
          payment_amount: data.payment_amount,
          amount_due: data.amount_due,
        }));
        console.log(data);
        setIsDrawerOpen(false);
      } else {
        setActionData({ errors: result.errors || {} });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleFormatPrice = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/\./g, "");
    const updatedValue =
      rawValue === ""
        ? formatPriceBase(0)
        : formatPriceBase(parseFloat(rawValue));
    setPaymentData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
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
                  <li>
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <Link
                        to={`/${menu}/${submenu}/${rfq_id}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {bill.source_document}
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <CaretRight size={18} weight="bold" />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {formData.state > 1
                          ? bill.reference
                          : `Draft bill (* ${bill.id})`}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  {submenu === "rfq"
                    ? "Request for Quotations"
                    : "Purchase Orders"}
                </h2>
                {formData.state === 1 ? (
                  <span className="inline-flex gap-1 justify-center items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-gray-800 dark:text-gray-300">
                    <Clock weight="fill" /> Draft
                  </span>
                ) : formData.state === 2 ? (
                  <span className="inline-flex gap-1 justify-center items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                    <CheckCircle weight="fill" /> Posted
                  </span>
                ) : (
                  formData.state === 3 && (
                    <span className="inline-flex gap-1 justify-center items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                      <XCircle weight="fill" /> Cancelled
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-9/12 gap-4 flex flex-col">
                <div className="sm:col-span-2 flex flex-col gap-6 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-10">
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-md flex flex-row justify-between">
                    <div className="w-1/2 flex flex-col">
                      <h6 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                        F&F
                      </h6>
                      <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                        Office 149, 450 South Brand Brooklyn
                      </h6>
                      <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                        San Diego County, CA 91905, USA
                      </h6>
                      <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                        +1 (123) 456 7891, +44 (876) 543 2198
                      </h6>
                    </div>
                    {formData.state < 2 ? (
                      <div className="w-1/2 flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center justify-end">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Bill:
                          </label>
                          <input
                            type="text"
                            disabled
                            name="reference"
                            id="reference"
                            className={`bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 border ${
                              actionData?.errors?.reference
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            }
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                            value={bill.reference}
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-end">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Bill Date:
                          </label>
                          <div className="w-1/2">
                            <DateInput
                              error={actionData?.errors?.invoice_date}
                              onChange={handleChange}
                              value={formData.invoice_date}
                              name="invoice_date"
                            />
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-end">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Accounting Date:
                          </label>
                          <div className="w-1/2">
                            <DateInput
                              error={actionData?.errors?.accounting_date}
                              onChange={handleChange}
                              value={formData.accounting_date}
                              name="accounting_date"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-fit">
                        <h6 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-6">
                          {bill.transaction_type}/{bill.reference}
                        </h6>
                        <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                          <span>Bill Date: </span>
                          <span>{formatBasicDate(formData.invoice_date)}</span>
                        </h6>
                        <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                          <span>Accounting Date: </span>
                          <span>
                            {formatBasicDate(formData.accounting_date)}
                          </span>
                        </h6>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-1/2 space-y-4">
                      {formData.state < 2 ? (
                        <SearchInput
                          name="vendor_id"
                          data={vendors}
                          label="Vendor:"
                          placeholder="Select Vendor"
                          valueKey="id"
                          displayKey="name"
                          onChange={handleChange}
                          error={actionData?.errors?.vendor_id}
                          value={formData.vendor_id}
                        />
                      ) : (
                        <h6 className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          Vendor:
                        </h6>
                      )}
                      {selectedVendor && (
                        <div>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {selectedVendor.name}
                          </p>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {selectedVendor.street}
                          </p>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {selectedVendor.zip && `${selectedVendor.zip},`}
                            {selectedVendor.city}, {selectedVendor.state}
                          </p>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {selectedVendor.phone}
                          </p>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {selectedVendor.email}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 space-y-4">
                      {formData.state < 2 ? (
                        <>
                          {!usePaymentTerm && (
                            <div>
                              <label
                                htmlFor="order_date"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Due Date:
                              </label>
                              <DateInput
                                error={actionData?.errors?.due_date}
                                onChange={handleChange}
                                value={formData.due_date}
                                name="due_date"
                              />
                            </div>
                          )}
                          <SearchInput
                            name="payment_term_id"
                            data={payment_terms}
                            label={usePaymentTerm ? "Payment Terms" : "Or"}
                            placeholder="Payment Terms"
                            valueKey="id"
                            displayKey="name"
                            onChange={handleChange}
                            error={actionData?.errors?.payment_term_id}
                            value={formData.payment_term_id}
                          />
                        </>
                      ) : (
                        <>
                          <h6 className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                            Due Date:
                          </h6>
                          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                            {formatBasicDate(formData.due_date)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <hr className="border-dashed border-gray-200 dark:border-gray-500" />
                  <TableVendorBill
                    endpoint={API_URL}
                    currentState={formData.state}
                    actionData={actionData}
                    materialsArr={materialsArr}
                    setMaterialsArr={setMaterialsArr}
                    bill={bill}
                  />
                  <div className="flex justify-end relative">
                    {formData.payment_status === 2 && formData.state === 2 && (
                      <img
                        src={paid}
                        alt="paid-icon"
                        className="max-w-24 absolute z-10 top-4 right-16"
                      />
                    )}
                    <div className="flex flex-col gap-3 w-fit mt-2">
                      {dataTotal.taxes > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-end">
                          <div className="text-gray-800 dark:text-gray-100 font-semibold text-sm space-y-2">
                            <p>Untaxed Amount:</p>
                            <p>Taxes:</p>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 font-normal text-sm space-y-2">
                            <p className="font-semibold">
                              {formatPrice(dataTotal.untaxed)}
                            </p>
                            <p>{formatPrice(dataTotal.tax)}</p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 border-t items-center border-gray-300 dark:border-gray-600 gap-2 text-end py-2">
                        <div className="text-gray-500 dark:text-gray-400 font-normal text-sm space-y-2">
                          <p>Total:</p>
                        </div>
                        <div className="text-gray-800 dark:text-gray-100 font-semibold text-xl space-y-2">
                          <p>{formatPrice(dataTotal.total)}</p>
                        </div>
                      </div>
                      {formData.payment_status === 2 && (
                        <div className="text-gray-400 dark:text-gray-500 font-normal text-sm justify-end inline-flex gap-3">
                          <p className="italic">
                            Paid on {formatBasicDate(formData.payment_date)}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {formatPrice(formData.payment_amount)}
                          </p>
                        </div>
                      )}
                      {formData.state === 2 && (
                        <div className="text-gray-600 dark:text-gray-300 font-normal text-sm justify-end items-center inline-flex gap-3 border-t border-gray-300 dark:border-gray-600 pt-2">
                          <p>Amount Due:</p>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold text-xl space-y-2">
                            {formatPrice(formData.amount_due)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-3/12 gap-4 flex flex-col">
                <div className="sm:col-span-2 relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
                  {formData.state < 2 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="inline-flex items-center justify-center gap-2 text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        {loadingConfirm ? (
                          <Spinner />
                        ) : (
                          <Check size={16} weight="bold" />
                        )}
                        Confirm Bill
                      </button>
                      <button
                        onClick={handleCancel}
                        type="button"
                        className="text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      >
                        {loadingCancel ? <Spinner /> : "Cancel"}
                      </button>
                      <button
                        onClick={handleSave}
                        type="button"
                        disabled={submitted}
                        className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      >
                        {loadingSave ? <Spinner /> : "Save Changes"}
                      </button>
                    </>
                  ) : formData.state === 2 && formData.payment_status === 2 ? (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        {loadingConfirm ? (
                          <Spinner />
                        ) : (
                          <FileArrowDown size={16} weight="bold" />
                        )}
                        Download
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      >
                        {loadingConfirm ? (
                          <Spinner />
                        ) : (
                          <Printer size={16} weight="bold" />
                        )}
                        Print
                      </button>
                    </>
                  ) : (
                    formData.state === 2 &&
                    formData.payment_status < 2 && (
                      <>
                        <button
                          type="button"
                          onClick={handleRegisterPayment}
                          className="inline-flex items-center justify-center gap-2 text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                          {loadingConfirm ? (
                            <Spinner />
                          ) : (
                            <CurrencyDollarSimple size={16} weight="bold" />
                          )}
                          Register Payment
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToDraft}
                          className="text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                        >
                          {loadingReset ? <Spinner /> : "Reset to Draft"}
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        backdrop
        dismissable
        title="Register Payment"
        activateClickOutside
        transitionDuration="duration-500"
        transitionEase="ease-out"
      >
        <div className="flex flex-col gap-6">
          <SearchInput
            name="journal"
            data={journals}
            label="Journal"
            placeholder="Select Journal"
            valueKey="id"
            displayKey="name"
            onChange={handlePaymentChange}
            error={actionData?.errors?.vendor_id}
            value={paymentData.journal}
          />
          <div>
            <label
              htmlFor="payment_date"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Payment Date
            </label>
            <DateInput
              onChange={handlePaymentChange}
              value={paymentData.payment_date}
              name="payment_date"
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500 text-sm font-semibold dark:text-gray-400">
                Rp
              </span>
              <input
                className="disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="text"
                name="amount"
                disabled
                id="amount"
                onChange={handlePaymentChange}
                onBlur={handleFormatPrice}
                value={paymentData.amount}
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="memo"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Memo
            </label>
            <input
              type="text"
              name="memo"
              id="memo"
              onChange={handlePaymentChange}
              className={`bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 border
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
              value={paymentData.memo}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-row gap-4">
            <button
              type="button"
              onClick={handleCreatePayment}
              className="inline-flex items-center justify-center gap-2 text-white w-fit bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              {loadingCreate ? <Spinner /> : <Check size={16} weight="bold" />}
              Create Payment
            </button>
            <button
              type="button"
              className="text-gray-900 w-fit bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Discard
            </button>
          </div>
        </div>
      </Drawer>
    </section>
  );
}
