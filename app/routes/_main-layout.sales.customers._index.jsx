import { Link, useLoaderData } from "@remix-run/react";
import { ChevronRight, House, Plus, Search, UsersRound } from "lucide-react";
import { CustomersView, EmptyView, ErrorView } from "@views/index.js";
import { ViewSwitch } from "@components/index.js";
import { useEffect, useState } from "react";

export const meta = () => {
  return [
    { title: "F&F - Customers" },
    { name: "description", content: "Management Customers" },
  ];
};

export const loader = async () => {
  let node_env = process.env.MODE;
  try {
    const response = await fetch(`${process.env.API_URL}/customers`);
    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching customers.";

      if (response.status === 404) {
        errorMessage = "customers Not Found";
        errorDescription =
          "The customer you're looking for does not exist or may have been removed.";
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
    const customers = await response.json();
    return { error: false, customers: customers.data, node_env };
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

export default function Customers() {
  const { error, customers, message, description, status, node_env } =
    useLoaderData();
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(customers);
  }, [customers]);

  const debounceDelay = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const newData = customers.filter((customer) =>
        customer.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(newData);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [keyword, customers]);

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };
  console.log(node_env);
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
                    Customers
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Customers
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-fit justify-end">
              <div className="relative w-full md:w-1/2">
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
              <div className="flex flex-row gap-4 w-full sm:w-fit">
                {customers.length > 0 && node_env === "production" && (
                  <Link
                    to="/sales/customers/add"
                    className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Plus size={16} />
                    New
                  </Link>
                )}
                <ViewSwitch />
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
            {customers.length > 0 ? (
              <CustomersView customers={filteredData} />
            ) : (
              <EmptyView
                section="customer"
                link="/sales/customers/add"
                icon={<UsersRound size={40} />}
                node_env={node_env}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
