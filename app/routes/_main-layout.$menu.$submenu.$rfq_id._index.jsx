import {
  ArrowLineUp,
  CaretRight,
  Check,
  ClockClockwise,
  House,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DateInput, SearchInput, Spinner } from "@components/index.js";
import { ErrorView, TableRFQ } from "@views/index.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import {
  formatPrice,
  formatPriceBase,
  unformatPriceBase,
} from "@utils/formatPrice.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";
import { json } from "@remix-run/node";
import { twMerge } from "tailwind-merge";

export const meta = ({ data }) => {
  const reference = data.rfq.reference;
  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference} Request for Quotation` },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu, rfq_id } = params;
  if (menu !== "purchase" || (submenu !== "rfq" && submenu !== "po")) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }
  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, rfqResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?vendors&materials`),
      fetch(`${process.env.API_URL}/rfqs/${rfq_id}`),
    ]);
    if (!initResponse.ok || !rfqResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok ? initResponse.status : rfqResponse.status;

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

    const [init, rfq] = await Promise.all([
      initResponse.json(),
      rfqResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      vendors: init.data.vendors,
      materials: init.data.materials,
      rfq: rfq.data,
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

export default function DetailedRequestForQuotation() {
  const params = useParams();
  const { menu, submenu, rfq_id } = params;
  const navigate = useNavigate();
  const {
    API_URL,
    vendors,
    materials,
    rfq,
    error,
    message,
    description,
    status,
  } = useLoaderData();
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [actionData, setActionData] = useState();
  const [rfqState, setRfqState] = useState(rfq.state);

  const thisDay = new Date().toISOString();

  const [dataTotal, setDataTotal] = useState({
    untaxed: rfq.total,
    taxes: rfq.taxes,
    total: rfq.total + rfq.taxes,
  });

  const [formData, setFormData] = useState({
    vendor_id: rfq.vendor_id,
    vendor_reference: rfq.vendor_reference || "",
    order_date: rfq.order_date,
    state: rfq.state,
    invoice_status: rfq.invoice_status,
    confirmation_date: rfq.confirmation_date || "",
    receipt: rfq.receipt || null,
    invoices: rfq.invoices,
  });

  const [hasTax, setHasTax] = useState(false);

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
      const materialsWithTax = materialsArr.some(
        (material) => material.tax > 0
      );
      setHasTax(materialsWithTax);
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

  //state button update
  const [initialFormData, setInitialFormData] = useState({});
  const [initialMaterial, setInitialMaterial] = useState([]);
  const [submitted, setSubmitted] = useState(true);

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
      formData.vendor_reference !== initialFormData.vendor_reference ||
      formData.order_date !== initialFormData.order_date;

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
        (material.material_id !== initialMaterials.material_id ||
          material.material_qty !== initialMaterials.material_qty ||
          material.description !== initialMaterials.description ||
          material.qty !== initialMaterials.qty ||
          material.unit_price !== initialMaterials.unit_price ||
          material.tax !== initialMaterials.tax)
      );
    });

    if (isMaterialChanged) {
      setSubmitted(false);
    }
  }, [materialsArr, initialMaterial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    setMaterialsArr(
      rfq.items.map((material) => ({
        component_id: material.component_id,
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
        qty_to_invoice: material.qty_to_invoice,
        qty_invoiced: material.qty_invoiced,
      }))
    );
  }, [rfq]);

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);
    const formattedData = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
      state: 3,
      invoice_status: formData.invoice_status,
      confirmation_date: thisDay,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: materialsArr.map((material) => ({
        component_id: material.component_id,
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
      const response = await fetch(`${API_URL}/rfqs/${rfq_id}`, {
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
          confirmation_date: data.confirmation_date,
          receipt: data.receipt,
        }));
        setRfqState(data.state);
        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
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
          qty_to_invoice: material.qty_to_invoice,
          qty_invoiced: material.qty_invoiced,
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

  const handleReceiveProduct = () => {
    if (formData.receipt.length > 1) {
      navigate(`/${menu}/${submenu}/${rfq_id}/transfers?type=IN`);
    } else {
      navigate(
        `/${menu}/${submenu}/${rfq_id}/transfers/${formData.receipt[0].id}`
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const formattedData = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
      state: formData.state,
      invoice_status: formData.invoice_status,
      confirmation_date: formData.confirmation_date,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: materialsArr.map((material) => ({
        component_id: material.component_id,
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
      const response = await fetch(`${API_URL}/rfqs/${rfq_id}`, {
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
      navigate(`/purchase/rfq`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setLoadingCancel(true);
    const formattedData = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
      state: 4,
      invoice_status: formData.invoice_status,
      confirmation_date: null,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: materialsArr.map((material) => ({
        component_id: material.component_id,
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
      const response = await fetch(`${API_URL}/rfqs/${rfq_id}`, {
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
      navigate(`/purchase/rfq`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleSetToDraft = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);
    const formattedData = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
      state: 1,
      invoice_status: formData.invoice_status,
      confirmation_date: thisDay,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: materialsArr.map((material) => ({
        component_id: material.component_id,
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
      const response = await fetch(`${API_URL}/rfqs/${rfq_id}`, {
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
          confirmation_date: data.confirmation_date,
          receipt: data.receipt,
        }));
        setRfqState(data.state);
        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
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
          qty_to_invoice: material.qty_to_invoice,
          qty_invoiced: material.qty_invoiced,
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

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);
    const formattedData = {
      transaction_type: "BILL",
      rfq_id,
    };
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        navigate(`/purchase/rfq/${rfq_id}/bills?id=${data.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConfirm(false);
    }
  };

  //button left
  const ActionButton = ({ onClick, loading, children, icon, className }) => (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700",
        className
      )}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );

  const ActionLink = ({ to, count, children }) => (
    <Link
      to={to}
      className="group disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
    >
      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-gray-100 bg-gray-800 dark:bg-gray-600 dark:text-white dark:group-hover:bg-primary-500 group-hover:bg-primary-700 group-hover:text-gray-100 rounded-full">
        {count}
      </span>
      {children}
    </Link>
  );

  const RenderLeftButton = () => {
    if (formData.state < 3) {
      return (
        <ActionButton
          onClick={handleConfirmOrder}
          loading={loadingConfirm}
          icon={<Check size={16} />}
        >
          Confirm Order
        </ActionButton>
      );
    }
    if (formData.state === 4) {
      return (
        <ActionButton
          onClick={handleSetToDraft}
          loading={loadingConfirm}
          icon={<ClockClockwise size={16} />}
          className={rfq.receipt.length === 0 && "rounded-lg"}
        >
          Set to Draft
        </ActionButton>
      );
    }
    if (
      formData.state === 3 &&
      formData.invoice_status >= 2 &&
      formData.invoices.length > 0
    ) {
      return (
        <ActionLink
          to={`/${menu}/${submenu}/${rfq_id}/bills?id=${formData?.invoices[0]?.id}`}
          count={formData.invoices.length}
        >
          Vendor Bills
        </ActionLink>
      );
    }
    if (formData.state === 3 && formData.invoice_status === 2) {
      return (
        <ActionButton
          onClick={handleCreateBill}
          loading={loadingConfirm}
          icon={<Check size={16} />}
        >
          Create Bill
        </ActionButton>
      );
    }
    if (formData.state === 3 && formData.invoice_status === 1) {
      return (
        <ActionButton
          onClick={handleReceiveProduct}
          loading={loadingConfirm}
          icon={<Check size={16} />}
        >
          Receive Product
        </ActionButton>
      );
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
                        {rfq.reference}
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
                <div className="inline-flex w-full sm:w-fit" role="group">
                  <RenderLeftButton />
                  {formData.state < 3 && (
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={submitted}
                      className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      {loadingUpdate ? <Spinner /> : <ArrowLineUp size={16} />}
                      Update
                    </button>
                  )}
                  {formData.state < 4 && formData.invoice_status === 1 ? (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      {loadingCancel ? <Spinner /> : <X size={16} />}
                      Cancel Order
                    </button>
                  ) : rfq.receipt.length > 0 ? (
                    <Link
                      to={`/${menu}/${submenu}/${rfq_id}/transfers?type=IN`}
                      className="group disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-gray-100 bg-gray-800 dark:bg-gray-600 dark:text-white dark:group-hover:bg-primary-500 group-hover:bg-primary-700 group-hover:text-gray-100 rounded-full">
                        {formData.receipt.length}
                      </span>
                      Receipt
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
              <div className="flex flex-row justify-between items-start text-gray-500">
                <div className="flex gap-4 items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                    {rfq.reference}
                  </h2>
                  {formData.state === 1 ? (
                    <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                      RFQ
                    </span>
                  ) : formData.state === 2 ? (
                    <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                      <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                      RFQ Sent
                    </span>
                  ) : formData.state === 4 ? (
                    <span className="inline-flex items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                      Purchase Order
                    </span>
                  )}
                </div>
                {/*<div className="w-8 h-8 rounded-full bg-transparent flex hover:bg-gray-100 items-center justify-center">*/}
                {/*  <DotsThreeVertical weight="bold" size={24} />*/}
                {/*</div>*/}
              </div>
              {formData.state >= 3 ? (
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Vendor
                    </p>
                    <Link
                      to={`/${menu}/${submenu}/vendors/${rfq.vendor_id}`}
                      className="bg-white text-primary-600 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                    >
                      {rfq.vendor_name}
                    </Link>
                  </div>
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Vendor Reference
                    </p>
                    <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                      {!formData.vendor_reference
                        ? "-"
                        : formData.vendor_reference}
                    </p>
                  </div>
                  <div>
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {rfqState === 3 ? "Confirmation Date" : "Order Date"}
                    </p>
                    <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                      {formatDisplayDatetime(
                        rfqState === 3
                          ? formData.confirmation_date
                          : formData.order_date
                      )}
                    </p>
                  </div>
                </div>
              ) : (
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
              )}
              <TableRFQ
                endpoint={API_URL}
                currentState={formData.state}
                materials={materials}
                actionData={actionData}
                materialsArr={materialsArr}
                setMaterialsArr={setMaterialsArr}
              />
              <div className="flex justify-end">
                <div className="flex flex-col gap-3 w-fit mt-6">
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
                  <div className="grid grid-cols-2 border-t items-center border-gray-300 dark:border-gray-600 gap-2 text-end py-2">
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
