import {
  CalendarDots,
  CaretRight,
  Checks,
  Clock,
  FilePdf,
  House,
  MagnifyingGlass,
  Plus,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { EmptyView, ErrorView } from "@views/index.js";
import { useEffect, useState } from "react";
import { formatPrice } from "@utils/formatPrice.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";

export const meta = () => {
  return [
    { title: "F&F - Purchase Orders" },
    { name: "description", content: "Management Purchase Orders" },
  ];
};

export const loader = async () => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/rfqs?purchase_order=true`
    );

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription =
        "Something went wrong while fetching purchase orders.";

      if (response.status === 404) {
        errorMessage = "Purchase Orders Not Found";
        errorDescription =
          "The Purchase Orders you're looking for does not exist or may have been removed.";
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
    const { data: purchase_orders } = await response.json();
    return { error: false, purchase_orders };
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

export default function PurchaseOrder() {
  const { error, purchase_orders, message, description, status } =
    useLoaderData();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(purchase_orders);
  }, []);
  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = purchase_orders.filter((item) =>
        item.reference.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, purchase_orders]);

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };
  const plannedLength = purchase_orders.filter(
    (item) => item.invoice_status === 1
  ).length;
  const waitingLength = purchase_orders.filter(
    (item) => item.invoice_status === 2
  ).length;
  const completedLength = purchase_orders.filter(
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
                  <House weight="fill" />
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center text-gray-400">
                  <CaretRight size={18} weight="bold" />
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                    Purchase Orders
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Purchase Orders
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-fit justify-end">
              <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                  <MagnifyingGlass size={16} weight="bold" />
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
              <div className="flex flex-row gap-3 sm:gap-4">
                {purchase_orders.length > 0 && (
                  <Link
                    to="/purchase/po/add"
                    className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Plus size={16} weight="bold" />
                    New
                  </Link>
                )}
                <button
                  type="button"
                  className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  <FilePdf size={16} />
                  Export
                </button>
              </div>
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
                  <CalendarDots size={26} />
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
                  <Checks size={26} />
                </div>
              </div>
            </div>
            {purchase_orders.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5 w-48">
                          Reference
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Confirmation Date
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Vendor
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-20 text-end">
                          Total
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5 w-32">
                          Billing Status
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length > 0 ? (
                        filteredData.map((purchase_order, index) => (
                          <tr
                            className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600"
                            key={index}
                            onClick={() =>
                              navigate(`/purchase/po/${purchase_order.id}`)
                            }
                          >
                            <td
                              scope="row"
                              className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white truncate ..."
                            >
                              {purchase_order.reference}
                            </td>
                            <td className="px-3 py-4">
                              {formatDisplayDatetime(
                                purchase_order.confirmation_date
                              )}
                            </td>
                            <td className="px-3 py-4">
                              {purchase_order.vendor_name}
                            </td>
                            <td
                              className={`px-3 py-4 text-end ${
                                purchase_order.invoice_status === 2 &&
                                "text-primary-500"
                              }`}
                            >
                              {formatPrice(
                                purchase_order.total + purchase_order.taxes
                              )}
                            </td>
                            <td className="pe-6 ps-3 py-4">
                              {purchase_order.invoice_status === 1 ? (
                                <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                  <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                                  Nothing to Bill
                                </span>
                              ) : purchase_order.invoice_status === 2 ? (
                                <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                  <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                                  Waiting Bills
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                  <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                  Fully Billed
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
                section="request for quotation"
                link="/purchase/po/add"
                icon={<Receipt />}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
