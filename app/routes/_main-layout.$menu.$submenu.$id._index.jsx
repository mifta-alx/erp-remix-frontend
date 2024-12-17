import {
  ArrowUpToLine,
  Check,
  ChevronRight,
  History,
  House,
  Receipt,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { DateInput, Menu, SearchInput, Spinner } from "@components/index.js";
import { ErrorView, TableQuotation, TableRFQ } from "@views/index.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import {
  formatPrice,
  formatPriceBase,
  unformatPriceBase,
} from "@utils/formatPrice.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";
import { json } from "@remix-run/node";
import { twMerge } from "tailwind-merge";
import { formatCustomerName } from "@utils/formatName.js";
import { useToast } from "@context/ToastContext.jsx";

export const meta = ({ data }) => {
  const { menu, result } = data;
  const reference = result.reference;
  const title = menu === "purchase" ? "Request for Quotation" : "Quotation";
  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference} ${title}` },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu, id } = params;
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
    const promises = [
      fetch(
        `${apiEndpoint}/init?vendors&materials&customers&products&payment_terms`
      ),
    ];

    if (menu === "purchase") {
      promises.push(fetch(`${apiEndpoint}/rfqs/${id}`));
    } else if (menu === "sales") {
      promises.push(fetch(`${apiEndpoint}/sales/${id}`));
    }

    const [initResponse, dataResponse] = await Promise.all(promises);

    if (!initResponse.ok || !dataResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status = !initResponse.ok ? initResponse.status : dataResponse.status;

      if (status === 404) {
        errorMessage = !initResponse.ok
          ? "Data Not Found"
          : `${
              menu === "purchase" ? "Request for Quotations" : "Quotations"
            } Not Found`;
        errorDescription = !initResponse.ok
          ? "The data you're looking for do not exist."
          : `${
              menu === "purchase" ? "Request for Quotations" : "Quotations"
            } you're looking for do not exist.`;
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

    const [init, result] = await Promise.all([
      initResponse.json(),
      dataResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      vendors: init.data.vendors,
      materials: init.data.materials,
      products: init.data.products,
      customers: init.data.customers,
      payment_terms: init.data.payment_terms,
      result: result.data,
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

export default function DetailedRequestForQuotation() {
  const params = useParams();
  const { menu, submenu, id } = params;
  const showToast = useToast();
  const navigate = useNavigate();
  const {
    API_URL,
    vendors,
    materials,
    products,
    payment_terms,
    customers,
    result,
    error,
    message,
    description,
    status,
  } = useLoaderData();
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [materialsArr, setMaterialsArr] = useState([]);
  const [productArr, setProductArr] = useState([]);
  const [actionData, setActionData] = useState();
  const [dataState, setDataState] = useState(result.state);
  const page = menu === "purchase" ? "bills" : "invoices";

  const thisDay = new Date().toISOString();

  const [dataTotal, setDataTotal] = useState({
    untaxed: result.total,
    taxes: result.taxes,
    total: result.total + result.taxes,
  });

  const [formData, setFormData] = useState({
    vendor_id: result.vendor_id,
    vendor_reference: result.vendor_reference || "",
    order_date: result.order_date,
    state: result.state,
    invoice_status: result.invoice_status,
    confirmation_date: result.confirmation_date || "",
    receipt: result.receipt || null,
    invoices: result.invoices,
    customer_id: result.customer_id,
    expiration: result.expiration,
    payment_term_id: result.payment_term_id,
  });

  const [hasTax, setHasTax] = useState(false);

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

  //state button update
  const [initialFormData, setInitialFormData] = useState({});
  const [initialMaterial, setInitialMaterial] = useState([]);
  const [initialProduct, setInitialProduct] = useState([]);
  const [submitted, setSubmitted] = useState(true);

  useEffect(() => {
    setInitialFormData(formData);
  }, []);

  useEffect(() => {
    if (menu === "purchase" && materialsArr.length > 0) {
      setInitialMaterial(materialsArr);
    } else if (menu === "sales" && productArr.length > 0) {
      setInitialProduct(productArr);
    }
  }, [materialsArr, productArr]);
  //cek apakah ada perubahan pada formData
  useEffect(() => {
    const isChanged =
      formData.vendor_id !== initialFormData.vendor_id ||
      formData.vendor_reference !== initialFormData.vendor_reference ||
      formData.order_date !== initialFormData.order_date ||
      formData.customer_id !== initialFormData.customer_id ||
      formData.expiration !== initialFormData.expiration ||
      formData.payment_term_id !== initialFormData.payment_term_id;

    if (isChanged) {
      setSubmitted(false);
    } else {
      setSubmitted(true);
    }
  }, [formData, initialFormData]);
  //cek apakah ada perubahan pada Material Array
  useEffect(() => {
    const hasChanges = (currentArr, initialArr) => {
      return currentArr.some((item, index) => {
        const initialItem = initialArr[index];
        return (
          initialItem &&
          (item.id !== initialItem.id ||
            item.qty !== initialItem.qty ||
            item.description !== initialItem.description ||
            item.qty !== initialItem.qty ||
            item.unit_price !== initialItem.unit_price ||
            item.tax !== initialItem.tax)
        );
      });
    };

    const isMaterialChanged = hasChanges(materialsArr, initialMaterial);
    const isProductChanged = hasChanges(productArr, initialProduct);

    if (isMaterialChanged || isProductChanged) {
      setSubmitted(false);
    }
  }, [materialsArr, productArr, initialMaterial, initialProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const mapItems = (items) =>
      items.map((item) => ({
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
      }));

    if (menu === "purchase") {
      setMaterialsArr(mapItems(result.items));
    } else if (menu === "sales") {
      setProductArr(mapItems(result.items));
    }
  }, [result]);

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);

    const dataRfq = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
    };

    const dataQuotation = {
      customer_id: formData.customer_id,
      expiration: formData.expiration,
      payment_term_id: formData.payment_term_id,
    };

    const formattedData = {
      ...(menu === "purchase" ? dataRfq : dataQuotation),
      state: 3,
      invoice_status: formData.invoice_status,
      confirmation_date: thisDay,
      scheduled_date: thisDay,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: (menu === "purchase" ? materialsArr : productArr).map((item) => ({
        component_id: item.component_id,
        type: item.type,
        id: item.id,
        description: item.description,
        qty: unformatToDecimal(item.qty),
        unit_price: unformatPriceBase(item.unit_price),
        tax: item.tax,
        subtotal: item.subtotal,
      })),
    };

    try {
      const endpoint = menu === "purchase" ? "rfqs" : "sales";
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
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
        setDataState(data.state);

        const formattedItems = data.items.map((item) => ({
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
        }));

        if (menu === "purchase") {
          setMaterialsArr(formattedItems);
        } else {
          setProductArr(formattedItems);
        }
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
      navigate(`/${menu}/${submenu}/${id}/transfers`);
    } else {
      navigate(`/${menu}/${submenu}/${id}/transfers/${formData.receipt[0].id}`);
    }
  };
  //sales specific function
  const handleOpenDelivery = () => {
    if (formData.receipt.length > 1) {
      navigate(`/${menu}/${submenu}/${id}/delivery`);
    } else {
      navigate(`/${menu}/${submenu}/${id}/delivery/${formData.receipt[0].id}`);
    }
  };
  //
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);

    const dataRfq = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
    };

    const dataQuotation = {
      customer_id: formData.customer_id,
      expiration: formData.expiration,
      payment_term_id: formData.payment_term_id,
    };

    const formattedData = {
      ...(menu === "purchase" ? dataRfq : dataQuotation),
      state: formData.state,
      invoice_status: formData.invoice_status,
      confirmation_date: formData.confirmation_date,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: (menu === "purchase" ? materialsArr : productArr).map((item) => ({
        component_id: item.component_id,
        type: item.type,
        id: item.id,
        description: item.description,
        qty: unformatToDecimal(item.qty),
        unit_price: unformatPriceBase(item.unit_price),
        tax: item.tax,
        subtotal: item.subtotal,
      })),
    };

    try {
      const endpoint = menu === "purchase" ? "rfqs" : "sales";
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: "PUT",
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
      setLoadingUpdate(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setLoadingCancel(true);

    const dataRfq = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
    };

    const dataQuotation = {
      customer_id: formData.customer_id,
      expiration: formData.expiration,
      payment_term_id: formData.payment_term_id,
    };

    const formattedData = {
      ...(menu === "purchase" ? dataRfq : dataQuotation),
      state: 4,
      invoice_status: formData.invoice_status,
      confirmation_date: thisDay,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: (menu === "purchase" ? materialsArr : productArr).map((item) => ({
        component_id: item.component_id,
        type: item.type,
        id: item.id,
        description: item.description,
        qty: unformatToDecimal(item.qty),
        unit_price: unformatPriceBase(item.unit_price),
        tax: item.tax,
        subtotal: item.subtotal,
      })),
    };

    try {
      const endpoint = menu === "purchase" ? "rfqs" : "sales";
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
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
      navigate(`/${menu}/${submenu}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleSetToDraft = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);

    const dataRfq = {
      vendor_id: formData.vendor_id,
      vendor_reference: formData.vendor_reference,
      order_date: formData.order_date,
    };

    const dataQuotation = {
      customer_id: formData.customer_id,
      expiration: formData.expiration,
      payment_term_id: formData.payment_term_id,
    };

    const formattedData = {
      ...(menu === "purchase" ? dataRfq : dataQuotation),
      state: 1,
      invoice_status: formData.invoice_status,
      confirmation_date: thisDay,
      total: dataTotal.untaxed,
      taxes: dataTotal.tax,
      items: (menu === "purchase" ? materialsArr : productArr).map((item) => ({
        component_id: item.component_id,
        type: item.type,
        id: item.id,
        description: item.description,
        qty: unformatToDecimal(item.qty),
        unit_price: unformatPriceBase(item.unit_price),
        tax: item.tax,
        subtotal: item.subtotal,
      })),
    };

    try {
      const endpoint = menu === "purchase" ? "rfqs" : "sales";
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
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
        setDataState(data.state);
        const formattedMaterial = data.items.map((material) => ({
          component_id: material.component_id,
          name: material.name,
          internal_reference: material.internal_reference,
          type: material.type,
          id: material.id,
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
    const requestData =
      menu === "purchase"
        ? { transaction_type: "BILL", rfq_id: id }
        : {
            transaction_type: "INV",
            sales_id: id,
            payment_term_id: formData.payment_term_id,
          };
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        const { data } = result;
        navigate(`/${menu}/${submenu}/${id}/${page}/${data.id}`);
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

  const ActionButtonCount = ({
    onClick,
    loading,
    children,
    icon,
    className,
    count,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "group disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700",
        className
      )}
    >
      {loading ? <Spinner /> : icon}
      {children}
      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-gray-100 bg-gray-800 dark:bg-gray-600 dark:text-white dark:group-hover:bg-primary-500 group-hover:bg-primary-700 group-hover:text-gray-100 rounded-full">
        {count}
      </span>
    </button>
  );

  const ActionLink = ({ to, count, children, icon }) => (
    <Link
      to={to}
      className="group disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
    >
      {icon}
      {children}
      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-gray-100 bg-gray-800 dark:bg-gray-600 dark:text-white dark:group-hover:bg-primary-500 group-hover:bg-primary-700 group-hover:text-gray-100 rounded-full">
        {count}
      </span>
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
          {menu === "purchase" ? "Confirm Order" : "Confirm"}
        </ActionButton>
      );
    }
    if (formData.state === 4) {
      return (
        <ActionButton
          onClick={handleSetToDraft}
          loading={loadingConfirm}
          icon={<History size={16} />}
          className={result.receipt.length === 0 && "rounded-lg"}
        >
          {menu === "purchase" ? "Set to Draft" : "Set to Quotation"}
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
          to={`/${menu}/${submenu}/${id}/${page}/${formData?.invoices[0]?.id}`}
          count={formData.invoices.length}
          icon={<Receipt size={16} />}
        >
          {menu === "purchase" ? "Vendor Bills" : "Invoices"}
        </ActionLink>
      );
    }
    if (
      menu === "sales" &&
      formData.state === 3 &&
      formData.invoice_status < 2 &&
      formData.receipt.length > 0
    ) {
      return (
        <ActionButtonCount
          onClick={handleOpenDelivery}
          loading={loadingConfirm}
          icon={<Truck size={16} />}
          count={formData.receipt.length}
        >
          Delivery
        </ActionButtonCount>
      );
    }
    if (formData.state === 3 && formData.invoice_status === 2) {
      return (
        <ActionButton
          onClick={handleCreateBill}
          loading={loadingConfirm}
          icon={<Check size={16} />}
        >
          {menu === "purchase" ? "Create Bill" : "Create Invoice"}
        </ActionButton>
      );
    }
    if (
      menu === "purchase" &&
      formData.state === 3 &&
      formData.invoice_status === 1
    ) {
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

  const handleSendEmail = () => alert("Send Email clicked!");
  const handleExport = () => alert("Export clicked!");
  const menuItems = [
    { label: "Send by Email", onClick: handleSendEmail, disabled: true },
    { label: "Export", onClick: handleExport },
  ];
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
                        {result.reference}
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
                  <RenderLeftButton />
                  {formData.state < 3 && (
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={submitted}
                      className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:dark:bg-gray-900 disabled:dark:text-gray-700 inline-flex items-center w-full sm:w-fit px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      {loadingUpdate ? (
                        <Spinner />
                      ) : (
                        <ArrowUpToLine size={16} />
                      )}
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
                      {menu === "purchase" ? "Cancel Order" : "Cancel"}
                    </button>
                  ) : result.receipt.length > 0 ? (
                    <ActionButtonCount
                      onClick={
                        menu === "purchase"
                          ? handleReceiveProduct
                          : handleOpenDelivery
                      }
                      icon={<Truck size={16} />}
                      count={formData.receipt.length}
                      className="rounded-e-lg rounded-s-none"
                    >
                      {menu === "purchase" ? "Receipt" : "Delivery"}
                    </ActionButtonCount>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mb-4 p-8">
              <div className="flex flex-row justify-between items-start text-gray-500">
                <div className="flex gap-4 items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                    {result.reference}
                  </h2>
                  {formData.state === 1 ? (
                    <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                      {menu === "purchase" ? "RFQ" : "Quotation"}
                    </span>
                  ) : formData.state === 2 ? (
                    <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                      <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                      {menu === "purchase" ? "RFQ Sent" : "Quotation Sent"}
                    </span>
                  ) : formData.state === 4 ? (
                    <span className="inline-flex items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                      {menu === "purchase" ? "Purchase Order" : "Sales Order"}
                    </span>
                  )}
                </div>
                <Menu menuItems={menuItems} />
              </div>
              {menu === "purchase" && formData.state >= 3 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Vendor
                      </p>
                      <Link
                        to={`/${menu}/${submenu}/vendors/${result.vendor_id}`}
                        className="bg-white text-primary-600 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                      >
                        {result.vendor_name}
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
                        {dataState === 3 ? "Confirmation Date" : "Order Date"}
                      </p>
                      <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                        {formatDisplayDatetime(
                          dataState === 3
                            ? formData.confirmation_date
                            : formData.order_date
                        )}
                      </p>
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
              ) : menu === "purchase" ? (
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
              ) : menu === "sales" && formData.state >= 3 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Customer
                      </p>
                      <Link
                        to={`/${menu}/${submenu}/customers/${result.customer_id}`}
                        className="bg-white text-primary-600 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-primary-500"
                      >
                        {result.customer_company_name
                          ? `${result.customer_company_name}, ${result.customer_name}`
                          : result.customer_name}
                      </Link>
                    </div>
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Order Date
                      </p>
                      <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                        {formatDisplayDatetime(formData.confirmation_date)}
                      </p>
                    </div>
                    <div>
                      <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Payment Terms
                      </p>
                      <p className="bg-white text-gray-500 font-medium text-sm rounded-lg block w-full dark:bg-gray-800 dark:placeholder-gray-400 dark:text-gray-400">
                        {!result.payment_term_name
                          ? "-"
                          : result.payment_term_name}
                      </p>
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
