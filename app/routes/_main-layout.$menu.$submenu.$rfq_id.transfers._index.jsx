import {
  CaretRight,
  House,
  MagnifyingGlass,
  Receipt,
} from "@phosphor-icons/react";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { EmptyView, ErrorView } from "@views/index.js";
import { useEffect, useState } from "react";
import { formatDisplayDatetime } from "@utils/formatDate.js";
import { json } from "@remix-run/node";

export const meta = () => {
  return [
    { title: "F&F - Transfers" },
    { name: "description", content: "Transfers" },
  ];
};

export const loader = async ({ request, params }) => {
  const { menu, submenu, rfq_id } = params;
  if (menu !== "purchase" || (submenu !== "rfq" && submenu !== "po")) {
    throw json(
      { description: `The page you're looking for doesn't exist.` },
      { status: 404, statusText: "Page Not Found" }
    );
  }
  try {
    const response = await fetch(
      `${process.env.API_URL}/receipts?transaction_type=IN&rfq_id=${rfq_id}`
    );

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching data.";

      if (response.status === 404) {
        errorMessage = "Receipt Not Found";
        errorDescription =
          "The Receipt you're looking for does not exist or may have been removed.";
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
    const { data: receipts } = await response.json();
    return { error: false, receipts };
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

export default function Transfers() {
  const params = useParams();
  const { menu, submenu, rfq_id } = params;
  const { error, receipts, message, description, status } = useLoaderData();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(receipts);
  }, []);
  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = receipts.filter((item) =>
        item.reference.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, receipts]);

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };
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
                    {receipts[0].source_document}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center text-gray-400">
                  <CaretRight size={18} weight="bold" />
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                    Transfers
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Transfers
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-fit justify-end">
              <div className="relative w-full">
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
            {receipts.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5 w-48">
                          Reference
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Scheduled Date
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Source Document
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5 w-32">
                          Status
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length > 0 ? (
                        filteredData.map((receipt, index) => (
                          <tr
                            className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600"
                            key={index}
                            onClick={() =>
                              navigate(
                                `/${menu}/${submenu}/${rfq_id}/transfers/${receipt.id}`
                              )
                            }
                          >
                            <td
                              scope="row"
                              className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white truncate ..."
                            >
                              {receipt.reference}
                            </td>
                            <td className="px-3 py-4">
                              {formatDisplayDatetime(receipt.scheduled_date)}
                            </td>
                            <td className="px-3 py-4">
                              {receipt.source_document}
                            </td>
                            <td className="pe-6 ps-3 py-4">
                              {receipt.state === 1 ? (
                                <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                  <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                                  Draft
                                </span>
                              ) : receipt.state === 2 ? (
                                <span className="inline-flex items-center bg-yellow-100 border border-yellow-500 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                  <span className="w-2 h-2 me-1 bg-yellow-500 rounded-full"></span>
                                  Warning
                                </span>
                              ) : receipt.state === 3 ? (
                                <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                  <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                                  Ready
                                </span>
                              ) : receipt.state === 5 ? (
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
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b dark:border-gray-700 text-sm bg-white dark:bg-gray-800">
                          <td
                            colSpan="4"
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
                link="/purchase/receipt/add"
                icon={<Receipt />}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
