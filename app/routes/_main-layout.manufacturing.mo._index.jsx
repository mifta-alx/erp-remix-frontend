import { ChevronRight, FileStack, House, Plus, Search } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EmptyView, ErrorView } from "@views/index.js";
import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatProductName } from "@utils/formatName.js";
import { BadgeState } from "@components/index.js";

export const meta = () => {
  return [
    { title: "F&F - Manufacturing Orders" },
    { name: "description", content: "Management Manufacturing Orders" },
  ];
};

export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/manufacturing-orders`);

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription =
        "Something went wrong while fetching manufacturing orders.";

      if (response.status === 404) {
        errorMessage = "Manufacturing Orders Not Found";
        errorDescription =
          "The Manufacturing Orders you're looking for does not exist or may have been removed.";
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
    const { data: mo } = await response.json();
    return { error: false, mo };
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

export default function ManufacturingOrders() {
  const { error, mo, message, description, status } = useLoaderData();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(mo);
  }, []);
  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = mo.filter((item) =>
        item.reference.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, mo]);

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
                  <House size={14} strokeWidth={1.8} />
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center text-gray-400">
                  <ChevronRight size={18} strokeWidth={2} />
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                    Manufacturing Orders
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Manufacturing Orders
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
              {mo.length > 0 && (
                <Link
                  to="/manufacturing/mo/add"
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
            {mo.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5 w-48">
                          Reference
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Product
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-14 text-end">
                          Quantity
                        </td>
                        <td scope="col" className="px-3 py-3.5 w-48">
                          Material Availability
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5 w-32">
                          State
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length > 0 ? (
                        filteredData.map((mo, index) => (
                          <tr
                            className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600"
                            key={index}
                            onClick={() =>
                              navigate(`/manufacturing/mo/${mo.id}`)
                            }
                          >
                            <td
                              scope="row"
                              className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white truncate ..."
                            >
                              {mo.reference}
                            </td>
                            <td className="px-3 py-4">
                              {formatProductName(mo.product)}
                            </td>
                            <td className="px-3 py-4 text-end">
                              {formatToDecimal(mo.qty)}
                            </td>
                            <td
                              className={`px-3 py-4 ${
                                mo.state > 3 && mo.status !== "failed"
                                  ? "text-green-700 dark:text-green-500"
                                  : "text-red-700 dark:text-red-500"
                              }`}
                            >
                              {mo.state < 3
                                ? ""
                                : mo.state > 3 && mo.status !== "failed"
                                ? "Available"
                                : "Not Available"}
                            </td>
                            <td className="pe-6 ps-3 py-4">
                              <BadgeState
                                status={mo.status}
                                currentState={mo.state}
                              />
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
                section="manufacturing order"
                link="/manufacturing/mo/add"
                icon={<FileStack size={40} />}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
