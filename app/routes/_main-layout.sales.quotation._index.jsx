import {
  CaretRight,
  FilePdf,
  House,
  MagnifyingGlass,
  Plus,
  Receipt,
} from "@phosphor-icons/react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { EmptyView, ErrorView } from "@views/index.js";
import { useEffect, useState } from "react";
import { formatPrice } from "@utils/formatPrice.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";

export const meta = () => {
  return [
    { title: "F&F - Quotations" },
    { name: "description", content: "Management Quotations" },
  ];
};

export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/sales`);

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching quotations.";

      if (response.status === 404) {
        errorMessage = "Quotations Not Found";
        errorDescription =
          "The Quotations you're looking for does not exist or may have been removed.";
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
    const { data: quotations } = await response.json();
    return { error: false, quotations };
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

export default function Quotation() {
  const { error, quotations, message, description, status } = useLoaderData();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(quotations);
  }, []);
  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = quotations.filter((item) =>
        item.reference.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, quotations]);

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
              <li aria-current="page">
                <div className="flex items-center text-gray-400">
                  <CaretRight size={18} weight="bold" />
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                    Quotations
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Quotations
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
                {quotations.length > 0 && (
                  <Link
                    to="/sales/quotation/add"
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
            {quotations.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5 w-48">
                          Number
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Creation Date
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Customer
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-20 text-end">
                          Total
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5 w-32">
                          Status
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length > 0 ? (
                        filteredData.map((quotation, index) => (
                          <tr
                            className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600"
                            key={index}
                            onClick={() =>
                              navigate(`/sales/quotation/${quotation.id}`)
                            }
                          >
                            <td
                              scope="row"
                              className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white truncate ..."
                            >
                              {quotation.reference}
                            </td>
                            <td className="px-3 py-4">
                              {formatDisplayDatetime(quotation.creation_date)}
                            </td>
                            <td className="px-3 py-4">
                              {quotation.customer_company_name
                                ? `${quotation.customer_company_name}, ${quotation.customer_name}`
                                : quotation.customer_name}
                            </td>
                            <td
                              className={`px-3 py-4 text-end ${
                                quotation.invoice_status === 2 &&
                                "text-primary-500"
                              }`}
                            >
                              {formatPrice(quotation.total + quotation.taxes)}
                            </td>
                            <td className="pe-6 ps-3 py-4">
                              {quotation.state === 1 ? (
                                <span className="inline-flex items-center bg-gray-100 border border-gray-500 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                  <span className="w-2 h-2 me-1 bg-gray-500 rounded-full"></span>
                                  Quotation
                                </span>
                              ) : quotation.state === 2 ? (
                                <span className="inline-flex items-center bg-primary-100 border border-primary-500 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                  <span className="w-2 h-2 me-1 bg-primary-500 rounded-full"></span>
                                  Quotation Sent
                                </span>
                              ) : quotation.state === 4 ? (
                                <span className="inline-flex items-center bg-red-100 border border-red-500 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                  <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                                  Cancelled
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                  <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                  Sales Order
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
                section="quotation"
                link="/sales/quotation/add"
                icon={<Receipt />}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}