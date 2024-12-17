import {
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Clock,
  House,
  Plus,
  ReceiptText,
  Search,
} from "lucide-react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { EmptyView, ErrorView } from "@views/index.js";
import { useEffect, useState } from "react";
import { formatPrice } from "@utils/formatPrice.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";

export const meta = () => {
  return [
    { title: "F&F - Sales Orders" },
    { name: "description", content: "Sales Orders" },
  ];
};

export const loader = async () => {
  let node_env = process.env.MODE;
  try {
    const response = await fetch(
      `${process.env.API_URL}/sales?sales_order=true`
    );

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription =
        "Something went wrong while fetching sales orders.";

      if (response.status === 404) {
        errorMessage = "Sales Orders Not Found";
        errorDescription =
          "The Sales Orders you're looking for does not exist or may have been removed.";
      } else if (response.status === 500) {
        errorMessage = "Internal Server Error";
        errorDescription =
          "There is an issue on our server. Our team is working to resolve it.";
      }
      return {
        error: true,
        status: response.status,
        message: errorMessage,
        description: errorDescription,
      };
    }
    const { data: sales_orders } = await response.json();
    return { error: false, sales_orders, node_env };
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

export default function SalesOrder() {
  const { error, sales_orders, message, description, status, node_env } =
    useLoaderData();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(sales_orders);
  }, []);
  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = sales_orders.filter((item) =>
        item.reference.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, sales_orders]);

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };
  const plannedLength = sales_orders.filter(
    (item) => item.invoice_status === 1
  ).length;
  const waitingLength = sales_orders.filter(
    (item) => item.invoice_status === 2
  ).length;
  const completedLength = sales_orders.filter(
    (item) => item.invoice_status === 3
  ).length;
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
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
              <li aria-current="page">
                <div className="flex items-center text-gray-400">
                  <ChevronRight size={18} strokeWidth={2} />
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                    Sales Orders
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Sales Orders
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-fit justify-end">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                  <Search size={16} strokeWidth={1.8} />
                </div>
                <input
                  type="text"
                  id="simple-search"
                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search"
                  value={keyword}
                  onChange={handleSearch}
                />
              </div>
              {sales_orders.length > 0 && (
                <Link
                  to="/sales/sales-order/add"
                  className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  <Plus size={16} />
                  New
                </Link>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <ErrorView
            status={status}
            message={message}
            description={description}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 mb-6 md:divide-x divide-gray-300 dark:divide-gray-500 bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 sm:rounded-lg overflow-hidden">
              <div className="px-6 py-3 md:py-0 flex justify-between items-start">
                <div className="flex flex-col">
                  <h4 className="text-2xl text-gray-700 dark:text-white font-medium">
                    {plannedLength}
                  </h4>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-normal">
                    Planned
                  </p>
                </div>
                <div className="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 p-2 rounded-md">
                  <CalendarDays size={26} />
                </div>
              </div>
              <div className="px-6 py-3 md:py-0 flex justify-between items-start">
                <div className="flex flex-col">
                  <h4 className="text-2xl text-gray-700 dark:text-white font-medium">
                    {waitingLength}
                  </h4>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-normal">
                    Waiting Payment
                  </p>
                </div>
                <div className="bg-primary-100 text-primary-500 dark:bg-primary-900 dark:text-primary-300 p-2 rounded-md">
                  <Clock size={26} />
                </div>
              </div>
              <div className="px-6 py-3 md:py-0 flex justify-between items-start">
                <div className="flex flex-col">
                  <h4 className="text-2xl text-gray-700 dark:text-white font-medium">
                    {completedLength}
                  </h4>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-normal">
                    Completed
                  </p>
                </div>
                <div className="bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300 p-2 rounded-md">
                  <CheckCheck size={26} />
                </div>
              </div>
            </div>
            {sales_orders.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5 w-48">
                          Number
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Order Date
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Customer
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-20 text-end">
                          Total
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5 w-32">
                          Invoice Status
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length > 0 ? (
                        filteredData.map((sales_order, index) => (
                          <tr
                            className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600"
                            key={index}
                            onClick={() =>
                              navigate(`/sales/sales-order/${sales_order.id}`)
                            }
                          >
                            <td
                              scope="row"
                              className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white truncate ..."
                            >
                              {sales_order.reference}
                            </td>
                            <td className="px-3 py-4">
                              {formatDisplayDatetime(
                                sales_order.confirmation_date
                              )}
                            </td>
                            <td className="px-3 py-4">
                              {sales_order.customer_company_name
                                ? `${sales_order.customer_company_name}, ${sales_order.customer_name}`
                                : sales_order.customer_name}
                            </td>
                            <td
                              className={`px-3 py-4 text-end ${
                                sales_order.invoice_status === 2 &&
                                "text-primary-500"
                              }`}
                            >
                              {formatPrice(
                                sales_order.total + sales_order.taxes
                              )}
                            </td>
                            <td className="pe-6 ps-3 py-4">
                              {sales_order.invoice_status === 1 ? (
                                <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                  <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                                  Nothing to Invoice
                                </span>
                              ) : sales_order.invoice_status === 2 ? (
                                <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                  <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                                  To Invoice
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                  <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                  Fully Invoiced
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b dark:border-gray-700 text-sm bg-white dark:bg-gray-800">
                          <td
                            colSpan="5"
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            No result found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyView
                section="sales orders"
                link="/sales/sales-order/add"
                icon={<ReceiptText size={40} />}
                node_env={node_env}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
