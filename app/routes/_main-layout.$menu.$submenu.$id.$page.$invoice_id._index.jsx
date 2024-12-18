import { Link, useLoaderData, useParams } from "@remix-run/react";
import {
  Check,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Clock,
  DollarSign,
  FileDown,
  History,
  House,
  Printer,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { DateInput, Drawer, SearchInput, Spinner } from "@components/index.js";
import {
  formatPrice,
  formatPriceBase,
  unformatPriceBase,
} from "@utils/formatPrice.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import { ErrorView, TableVendorBill, TableBillsAndInvoice } from "@views/index.js";
import { formatBasicDate } from "@utils/formatDate.js";
import paid from "/paid.svg";
import { json } from "@remix-run/node";
import { formatCustomerName } from "@utils/formatName.js";
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";

export const meta = ({ data }) => {
  const reference =
    data.invoice.state > 1
      ? data.invoice.reference
      : data.page === "bills"
        ? `Draft bill (* ${data.invoice.id})`
        : `Draft invoice (* ${data.invoice.id})`;

  return [
    { title: `F&F - ${reference}` },
    { name: "description", content: `${reference}` },
  ];
};

export const loader = async ({ params }) => {
  const { menu, submenu, id, page, invoice_id } = params;
  if (menu !== "purchase" && menu !== "sales") {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }

  if (
    (menu === "purchase" &&
      submenu !== "rfq" &&
      submenu !== "po" &&
      page !== "bills") ||
    (menu === "sales" &&
      submenu !== "quotation" &&
      submenu !== "sales-order" &&
      page !== "invoices")
  ) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }

  let apiEndpoint = process.env.API_URL;
  try {
    const [initResponse, invoiceResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/init?vendors&payment_terms&customers`),
      fetch(`${process.env.API_URL}/invoices/${invoice_id}`),
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

    const [init, invoices] = await Promise.all([
      initResponse.json(),
      invoiceResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      vendors: init.data.vendors,
      customers: init.data.customers,
      payment_terms: init.data.payment_terms,
      invoice: invoices.data,
      page,
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

export default function BillsAndInvoices() {
  const params = useParams();
  const { menu, submenu, id, page, invoice_id } = params;
  const {
    API_URL,
    vendors,
    customers,
    payment_terms,
    invoice,
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
  const type = page === "bills" ? "material" : page === "invoices" && "product";
  const [dataArr, setDataArr] = useState([]);
  const [actionData, setActionData] = useState();
  const thisDay = new Date().toISOString();
  const [dataTotal, setDataTotal] = useState({
    untaxed: invoice.total,
    taxes: invoice.taxes,
    total: invoice.total + invoice.taxes,
  });

  const [formData, setFormData] = useState({
    vendor_id: invoice.vendor_id,
    customer_id: invoice.customer_id,
    due_date: invoice.due_date || thisDay,
    accounting_date: invoice.accounting_date,
    delivery_date: invoice.delivery_date,
    rfq_id: invoice.rfq_id,
    sales_id: invoice.sales_id,
    invoice_date: invoice.invoice_date,
    state: invoice.state,
    payment_term_id: invoice.payment_term_id,
    payment_status: invoice.payment_status,
    payment_date: invoice.payment_date,
    payment_amount: invoice.payment_amount,
    amount_due: invoice.amount_due,
  });

  const [paymentData, setPaymentData] = useState({
    journal: 1,
    amount: formatPriceBase(dataTotal.total),
    payment_date: thisDay,
    memo: `${invoice.transaction_type}/${invoice.reference}`,
    payment_type: page === "bills" ? "outbound" : "inbound",
  });

  const journals = [
    { id: 1, name: "Bank" },
    { id: 2, name: "Cash" },
  ];

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      vendor_id: invoice.vendor_id,
      customer_id: invoice.customer_id,
      due_date: invoice.due_date || thisDay,
      accounting_date: invoice.accounting_date,
      delivery_date: invoice.delivery_date,
      rfq_id: invoice.rfq_id,
      sales_id: invoice.sales_id,
      invoice_date: invoice.invoice_date,
      state: invoice.state,
      payment_term_id: invoice.payment_term_id,
      payment_status: invoice.payment_status,
      payment_date: invoice.payment_date,
      payment_amount: invoice.payment_amount,
      amount_due: invoice.amount_due,
    }));
    setDataArr(
      invoice.items.map((item) => ({
        component_id: item.component_id, //send
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
        qty_to_invoice: formatToDecimal(item.qty_to_invoice),
        qty_invoiced: formatToDecimal(item.qty_invoiced), //send
      }))
    );
  }, [invoice]);

  //state button save
  const [initialFormData, setInitialFormData] = useState({});
  const [initialDataArr, setInitialDataArr] = useState([]);
  const [submitted, setSubmitted] = useState(true);
  //state additional
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({});
  const [selectedeCustomer, setSelectedCustomer] = useState({});
  const [usePaymentTerm, setUsePaymentTerm] = useState(false);

  useEffect(() => {
    setUsePaymentTerm(!!formData.payment_term_id);
  }, [formData.payment_term_id]);

  useEffect(() => {
    setInitialFormData(formData);
  }, []);

  useEffect(() => {
    if (dataArr.length > 0) {
      setInitialDataArr(dataArr);
    }
  }, [dataArr]);
  //cek apakah ada perubahan pada formData
  useEffect(() => {
    const isChanged =
      formData.vendor_id !== initialFormData.vendor_id ||
      formData.customer_id !== initialFormData.customer_id ||
      formData.due_date !== initialFormData.due_date ||
      formData.invoice_date !== initialFormData.invoice_date ||
      formData.accounting_date !== initialFormData.accounting_date ||
      formData.delivery_date !== initialFormData.delivery_date ||
      formData.payment_term_id !== initialFormData.payment_term_id;

    if (isChanged) {
      setSubmitted(false);
    } else {
      setSubmitted(true);
    }
  }, [formData, initialFormData]);
  //cek apakah ada perubahan pada Material Array
  useEffect(() => {
    const isDataChanged = dataArr.some((item, index) => {
      const initialDataArray = initialDataArr[index];
      return (
        initialDataArray &&
        item.qty_to_invoice !== initialDataArray.qty_to_invoice
      );
    });

    if (isDataChanged) {
      setSubmitted(false);
    }
  }, [dataArr, initialDataArr]);
  //sum total
  useEffect(() => {
    const handler = setTimeout(() => {
      const totalTax = dataArr.reduce(
        (acc, material) =>
          acc + parseFloat((material.tax / 100) * material.subtotal || 0),
        0
      );
      const totalSubtotal = dataArr.reduce(
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
  }, [dataArr]);

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
    if (page === "bills") {
      const selected = vendors.find(
        (vendor) => vendor.id === formData.vendor_id
      );
      setSelectedVendor(selected);
    } else {
      const selected = customers.find(
        (customer) => customer.id === formData.customer_id
      );
      setSelectedCustomer(selected);
    }
  }, [formData.vendor_id, formData.customer_id]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoadingConfirm(true);

    const billData = {
      vendor_id: formData.vendor_id,
      transaction_type: "BILL",
      rfq_id: formData.rfq_id,
      accounting_date: formData.accounting_date,
    };

    const invoiceData = {
      customer_id: formData.customer_id,
      transaction_type: "INV",
      sales_id: formData.sales_id,
      delivery_date: formData.delivery_date,
    };

    const formattedData = {
      action_type: "confirm",
      ...(page === "bills" ? billData : invoiceData),
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      invoice_date: formData.invoice_date,
      state: 2,
      invoice_status: 3,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: dataArr
        .filter((item) => item.type === type)
        .map((item) => ({
          component_id: item.component_id,
          qty_invoiced: unformatToDecimal(item.qty_to_invoice),
        })),
    };
    try {
      const response = await fetch(`${API_URL}/invoices/${invoice_id}`, {
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

        const formattedItem = data.items.map((item) => ({
          component_id: item.component_id,
          name: item.name,
          internal_reference: item.internal_reference,
          type: item.type,
          id: item.id,
          description: item.description,
          qty: item.qty,
          unit_price: formatPriceBase(item.unit_price),
          tax: item.tax,
          subtotal: item.subtotal,
          qty_received: item.qty_received,
          qty_to_invoice: formatToDecimal(item.qty_to_invoice),
          qty_invoiced: formatToDecimal(item.qty_invoiced),
        }));
        setDataArr(formattedItem);
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

    const billData = {
      vendor_id: formData.vendor_id,
      transaction_type: "BILL",
      rfq_id: formData.rfq_id,
      accounting_date: formData.accounting_date,
    };

    const invoiceData = {
      customer_id: formData.customer_id,
      transaction_type: "INV",
      sales_id: formData.sales_id,
      delivery_date: formData.delivery_date,
    };

    const formattedData = {
      action_type: "save",
      ...(page === "bills" ? billData : invoiceData),
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      invoice_date: formData.invoice_date,
      state: 1,
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: dataArr
        .filter((item) => item.type === type)
        .map((item) => ({
          component_id: item.component_id,
          qty_invoiced: unformatToDecimal(item.qty_to_invoice),
        })),
    };
    try {
      const response = await fetch(`${API_URL}/invoices/${invoice_id}`, {
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
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          delivery_date: data.delivery_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
        }));

        const formattedItem = data.items.map((item) => ({
          component_id: item.component_id,
          name: item.name,
          internal_reference: item.internal_reference,
          type: item.type,
          id: item.id,
          description: item.description,
          qty: item.qty,
          unit_price: formatPriceBase(item.unit_price),
          tax: item.tax,
          subtotal: item.subtotal,
          qty_received: item.qty_received,
          qty_to_invoice: formatToDecimal(item.qty_to_invoice),
          qty_invoiced: formatToDecimal(item.qty_invoiced),
        }));
        setSubmitted(true);
        setInitialFormData({
          vendor_id: data.vendor_id,
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          delivery_date: data.delivery_date,
          rfq_id: data.rfq_id,
          sales_id: data.sales_id,
          invoice_date: data.invoice_date,
          state: data.state,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
        });
        setInitialDataArr(formattedItem);
        setDataArr(formattedItem);
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

    const billData = {
      vendor_id: formData.vendor_id,
      transaction_type: "BILL",
      rfq_id: formData.rfq_id,
      accounting_date: formData.accounting_date,
    };

    const invoiceData = {
      customer_id: formData.customer_id,
      transaction_type: "INV",
      sales_id: formData.sales_id,
      delivery_date: formData.delivery_date,
    };

    const formattedData = {
      action_type: "cancel",
      ...(page === "bills" ? billData : invoiceData),
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      invoice_date: formData.invoice_date,
      state: 3,
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: dataArr
        .filter((item) => item.type === type)
        .map((item) => ({
          component_id: item.component_id,
          qty_invoiced: unformatToDecimal(item.qty_to_invoice),
        })),
    };

    try {
      const response = await fetch(`${API_URL}/invoices/${invoice_id}`, {
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
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          delivery_date: data.delivery_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
        }));

        const formattedItem = data.items.map((item) => ({
          component_id: item.component_id,
          name: item.name,
          internal_reference: item.internal_reference,
          type: item.type,
          id: item.id,
          description: item.description,
          qty: item.qty,
          unit_price: formatPriceBase(item.unit_price),
          tax: item.tax,
          subtotal: item.subtotal,
          qty_received: item.qty_received,
          qty_to_invoice: formatToDecimal(item.qty_to_invoice),
          qty_invoiced: formatToDecimal(item.qty_invoiced),
        }));
        setInitialFormData({
          vendor_id: data.vendor_id,
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          delivery_date: data.delivery_date,
          rfq_id: data.rfq_id,
          sales_id: data.sales_id,
          invoice_date: data.invoice_date,
          state: data.state,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
        });
        setInitialDataArr(formattedItem);
        setDataArr(formattedItem);
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

    const billData = {
      vendor_id: formData.vendor_id,
      transaction_type: "BILL",
      rfq_id: formData.rfq_id,
      accounting_date: formData.accounting_date,
    };

    const invoiceData = {
      customer_id: formData.customer_id,
      transaction_type: "INV",
      sales_id: formData.sales_id,
      delivery_date: formData.delivery_date,
    };

    const formattedData = {
      action_type: "reset",
      ...(page === "bills" ? billData : invoiceData),
      due_date: formData.payment_term_id ? null : formData.due_date,
      payment_term_id: formData.payment_term_id,
      invoice_date: formData.invoice_date,
      state: 1,
      invoice_status: 2,
      total: dataTotal.total,
      taxes: dataTotal.taxes,
      items: dataArr
        .filter((item) => item.type === type)
        .map((item) => ({
          component_id: item.component_id,
          qty_invoiced: unformatToDecimal(item.qty_to_invoice),
        })),
    };
    try {
      const response = await fetch(`${API_URL}/invoices/${invoice_id}`, {
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
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          invoice_date: data.invoice_date,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
        }));

        const formattedItem = data.items.map((item) => ({
          component_id: item.component_id,
          name: item.name,
          internal_reference: item.internal_reference,
          type: item.type,
          id: item.id,
          description: item.description,
          qty: item.qty,
          unit_price: formatPriceBase(item.unit_price),
          tax: item.tax,
          subtotal: item.subtotal,
          qty_received: item.qty_received,
          qty_to_invoice: formatToDecimal(item.qty_to_invoice),
          qty_invoiced: formatToDecimal(item.qty_invoiced),
        }));
        setInitialFormData({
          vendor_id: data.vendor_id,
          customer_id: data.customer_id,
          due_date: data.due_date,
          accounting_date: data.accounting_date,
          delivery_date: data.delivery_date,
          rfq_id: data.rfq_id,
          sales_id: data.sales_id,
          invoice_date: data.invoice_date,
          state: data.state,
          payment_term_id: data.payment_term_id,
          payment_status: data.payment_status,
          payment_date: data.payment_date,
        });
        setInitialDataArr(formattedItem);
        setDataArr(formattedItem);
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

    const billData = {
      vendor_id: formData.vendor_id,
    };

    const invoiceData = {
      customer_id: formData.customer_id,
    };

    const formattedData = {
      invoice_id,
      ...(page === "bills" ? billData : invoiceData),
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
  const printRef = useRef(null);
  const [useAlternateTable, setUseAlternateTable] = useState(false);
  const handleDownloadPdf = async () => {

    // Gunakan tabel alternatif
    setUseAlternateTable(true);
    // Tunggu hingga DOM diperbarui
    await new Promise((resolve) => setTimeout(resolve, 0));

    const element = printRef.current;
    if (!element) {
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
    });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("examplepdf.pdf");
    setUseAlternateTable(false);
  };
  const handlePrintPDF = async () => {
    setUseAlternateTable(true);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const element = printRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const data = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;

      document.body.appendChild(iframe);

      // Tunggu hingga iframe selesai memuat konten
      iframe.onload = () => {
        iframe.contentWindow.print();

        // Menghapus iframe setelah mencetak selesai
        iframe.contentWindow.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          setUseAlternateTable(false);
        };
      };

    } catch (error) {
      console.error('Terjadi kesalahan saat mencetak PDF:', error);
      setUseAlternateTable(false);
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
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to={`/${menu}/${submenu}/${id}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {invoice.source_document}
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        {formData.state > 1
                          ? invoice.reference
                          : page === "bills"
                            ? `Draft bill (* ${invoice.id})`
                            : `Draft invoice (* ${invoice.id})`}
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
                {formData.state === 1 ? (
                  <span className="inline-flex gap-1 justify-center items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-gray-800 dark:text-gray-300">
                    <Clock size={12} /> Draft
                  </span>
                ) : formData.state === 2 ? (
                  <span className="inline-flex gap-1 justify-center items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                    <CircleCheckBig size={12} /> Posted
                  </span>
                ) : (
                  formData.state === 3 && (
                    <span className="inline-flex gap-1 justify-center items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-3 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                      <CircleX size={12} /> Cancelled
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-9/12 w-full gap-4 flex flex-col" ref={printRef}>
                <div className={`flex flex-col gap-6 relative bg-white dark:bg-gray-800 rounded-lg p-10 ${setUseAlternateTable ? '' : 'border-gray-200 dark:border-gray-700 border'}`}>
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-md flex sm:flex-row flex-col sm:gap-0 gap-8 justify-between">
                    <div className="sm:w-1/2 w-full flex flex-col">
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
                      <div className="sm:w-1/2 w-full flex flex-col gap-2">
                        <div className="flex sm:flex-row flex-col gap-2 items-start sm:items-center sm:justify-end justify-start">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {page === "bills"
                              ? "Bill:"
                              : page === "invoices" && "Invoice:"}
                          </label>
                          <input
                            type="text"
                            disabled
                            name="reference"
                            id="reference"
                            className={`bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 border ${actionData?.errors?.reference
                              ? "border-red-500 dark:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              }
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block sm:w-1/2 w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                            value={invoice.reference}
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex sm:flex-row flex-col gap-2 items-start sm:items-center sm:justify-end justify-start">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {page === "bills"
                              ? "Bill Date:"
                              : page === "invoices" && "Invoice Date:"}
                          </label>
                          <div className="sm:w-1/2 w-full">
                            <DateInput
                              error={actionData?.errors?.invoice_date}
                              onChange={handleChange}
                              value={formData.invoice_date}
                              name="invoice_date"
                            />
                          </div>
                        </div>
                        <div className="flex sm:flex-row flex-col gap-2 items-start sm:items-center sm:justify-end justify-start">
                          <label
                            htmlFor="order_date"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {page === "bills"
                              ? "Accounting Date:"
                              : page === "invoices" && "Delivery Date:"}
                          </label>
                          <div className="sm:w-1/2 w-full">
                            <DateInput
                              error={
                                page === "bills"
                                  ? actionData?.errors?.accounting_date
                                  : actionData?.errors?.delivery_date
                              }
                              onChange={handleChange}
                              value={
                                page === "bills"
                                  ? formData.accounting_date
                                  : formData.delivery_date
                              }
                              name={
                                page === "bills"
                                  ? "accounting_date"
                                  : "delivery_date"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="sm:w-fit w-max">
                        <h6 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-6">
                          {invoice.transaction_type}/{invoice.reference}
                        </h6>
                        <h6 className="text-sm font-normal text-gray-700 dark:text-gray-400">
                          <span>
                            {page === "bills"
                              ? "Bill Date:"
                              : page === "invoices" && "Invoice Date:"}
                          </span>
                          <span>{formatBasicDate(formData.invoice_date)}</span>
                        </h6>
                        <h6 className="text-sm font-normal text-end text-gray-700 dark:text-gray-400">
                          <span>
                            {page === "bills"
                              ? "Accounting Date:"
                              : page === "invoices" && "Delivery Date:"}
                          </span>
                          <span>
                            {formatBasicDate(
                              page === "bills"
                                ? formData.accounting_date
                                : formData.delivery_date
                            )}
                          </span>
                        </h6>
                      </div>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                    {page === "bills" ? (
                      <div className="sm:w-1/2 w-full space-y-4">
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
                    ) : (
                      page === "invoices" && (
                        <div className="sm:w-1/2 w-full space-y-4">
                          {formData.state < 2 ? (
                            <SearchInput
                              name="customer_id"
                              data={customers}
                              label="Customer:"
                              placeholder="Select Customer"
                              valueKey="id"
                              displayKey="name"
                              getDisplayString={formatCustomerName}
                              onChange={handleChange}
                              error={actionData?.errors?.customer_id}
                              value={formData.customer_id}
                            />
                          ) : (
                            <h6 className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                              Customer:
                            </h6>
                          )}
                          {selectedeCustomer && (
                            <div>
                              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                {selectedeCustomer.name}
                              </p>
                              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                {selectedeCustomer.street}
                              </p>
                              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                {selectedeCustomer.zip &&
                                  `${selectedeCustomer.zip},`}
                                {selectedeCustomer.city},{" "}
                                {selectedeCustomer.state}
                              </p>
                              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                {selectedeCustomer.phone}
                              </p>
                              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                {selectedeCustomer.email}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    <div className="sm:w-1/2 w-full space-y-4">
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

                  <div ref={printRef}>
                    {useAlternateTable ? (
                      <TableBillsAndInvoice
                        endpoint={API_URL}
                        currentState={formData.state}
                        actionData={actionData}
                        dataArr={dataArr}
                        setDataArr={setDataArr}
                        invoice={invoice}
                        invoice_date={formData.invoice_date}
                      />
                    ) : (
                      <TableVendorBill
                        endpoint={API_URL}
                        currentState={formData.state}
                        actionData={actionData}
                        dataArr={dataArr}
                        setDataArr={setDataArr}
                        invoice={invoice}
                      />
                    )}
                  </div>

                  <div className="flex justify-end relative">
                    {formData.payment_status === 2 && formData.state === 2 && (
                      useAlternateTable ? (
                        <span className="absolute z-10 top-4 right-14 text-green-700 font-bold opacity-50 text-[70px] ">
                          PAID
                        </span>
                      ) : (
                        <img
                          src={paid}
                          alt="paid-icon"
                          className="max-w-24 absolute z-10 top-4 right-16"
                        />
                      )

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
                        {loadingConfirm ? <Spinner /> : <Check size={16} />}
                        {page === "bills"
                          ? "Confirm Bill"
                          : page === "invoices" && "Confirm"}
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
                        onClick={handleDownloadPdf}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        {loadingConfirm ? <Spinner /> : <FileDown size={16} />}
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPDF}
                        className="inline-flex items-center justify-center gap-2 text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      >
                        {loadingConfirm ? <Spinner /> : <Printer size={16} />}
                        Print
                      </button>
                    </>
                  ) : formData.state === 2 && formData.payment_status < 2 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRegisterPayment}
                        className="inline-flex items-center justify-center gap-2 text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        {loadingConfirm ? (
                          <Spinner />
                        ) : (
                          <DollarSign size={16} />
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
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetToDraft}
                      className="inline-flex items-center justify-center gap-2 text-gray-900 w-full bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                    >
                      {loadingReset ? <Spinner /> : <History size={16} />}
                      Reset to Draft
                    </button>
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
              {loadingCreate ? <Spinner /> : <Check size={16} />}
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
