import { Plus, CaretRight, House } from "@phosphor-icons/react";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { BoxArrowDown } from "@phosphor-icons/react";

export const meta = () => {
  return [
    { title: "ERP-Bills of Materials" },
    { name: "description", content: "Management Bills of Materials" },
  ];
};

export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/boms`);

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription =
        "Something went wrong while fetching bills of materials.";

      if (response.status === 404) {
        errorMessage = "Bills of Materials Not Found";
        errorDescription =
          "The Bills of Materials you're looking for does not exist or may have been removed.";
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
    const boms = await response.json();
    return { error: false, boms: boms.data };
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

export default function Bom() {
  const { error, boms, message, description, status } = useLoaderData();
  const navigate = useNavigate();
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
          <div>
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
                      Bills of Materials
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Bills of Materials
            </h2>
          </div>
          {boms?.length > 0 && (
            <div className="flex items-center space-x-4">
              <Link
                to={"/manufacturing/boms/add"}
                className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
              >
                <Plus size={16} weight="bold" />
                New
              </Link>
            </div>
          )}
        </div>
        {error ? (
          <div className="py-48  px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
                {status}
              </h1>
              <p className="mb-4 text-3xl tracking-tight first-letter:capitalize font-bold text-gray-900 md:text-4xl dark:text-white">
                {message}
              </p>
              <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        ) : (
          <>
            {boms.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
                {/* <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <form className="flex items-center">
                <label for="simple-search" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewbox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Search"
                    required=""
                  />
                </div>
              </form>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  id="actionsDropdownButton"
                  data-dropdown-toggle="actionsDropdown"
                  className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  type="button"
                >
                  <svg
                    className="-ml-1 mr-1.5 w-5 h-5"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                  Actions
                </button>
                <div
                  id="actionsDropdown"
                  className="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    className="py-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="actionsDropdownButton"
                  >
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Mass Edit
                      </a>
                    </li>
                  </ul>
                  <div className="py-1">
                    <a
                      href="#"
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Delete all
                    </a>
                  </div>
                </div>
                <button
                  id="filterDropdownButton"
                  data-dropdown-toggle="filterDropdown"
                  className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="h-4 w-4 mr-2 text-gray-400"
                    viewbox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Filter
                  <svg
                    className="-mr-1 ml-1.5 w-5 h-5"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
                <div
                  id="filterDropdown"
                  className="z-10 hidden w-56 p-3 bg-white rounded-lg shadow dark:bg-gray-700"
                >
                  <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Category
                  </h6>
                  <ul
                    className="space-y-2 text-sm"
                    aria-labelledby="filterDropdownButton"
                  >
                    <li className="flex items-center">
                      <input
                        id="apple"
                        type="checkbox"
                        value=""
                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <label
                        for="apple"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                      >
                        Apple (56)
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div> */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <td scope="col" className="ps-6 pe-3 py-3.5">
                          Product name
                        </td>
                        <td scope="col" className="px-3 py-3.5">
                          Reference
                        </td>
                        <td scope="col" className="px-3 py-3.5">
                          Quantity
                        </td>
                        <td scope="col" className="ps-3 pe-6 py-3.5">
                          <span className="sr-only">Actions</span>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {boms?.map((bom, index) => (
                        <tr
                          className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600 "
                          key={index}
                          onClick={() =>
                            navigate(`/manufacturing/boms/${bom.bom_id}`)
                          }
                        >
                          <td
                            scope="row"
                            className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {bom.product.internal_reference
                              ? `[${bom.product.internal_reference}] `
                              : ""}
                            {bom.product.name}
                          </td>
                          <td className="px-3 py-4">{bom.bom_reference}</td>
                          <td className="px-3 py-4">{bom.bom_qty}</td>
                          <td className="ps-3 pe-6 py-4 flex items-center justify-end"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* <nav
                  className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                  aria-label="Table navigation"
                >
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing
                    <span className="font-semibold text-gray-900 dark:text-white">
                      1-10
                    </span>
                    of
                    <span className="font-semibold text-gray-900 dark:text-white">
                      1000
                    </span>
                  </span>
                  <ul className="inline-flex items-stretch -space-x-px">
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewbox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        1
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        2
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        aria-current="page"
                        className="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      >
                        3
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        ...
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        100
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewbox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </nav> */}
              </div>
            ) : (
              <div className="border-dashed border-2 text-5xl border-gray-300 dark:border-gray-500 text-gray-300 dark:text-gray-500 flex rounded-lg h-full w-full items-center flex-col py-40 md:py-32">
                <BoxArrowDown />
                <p className="font-semibold text-sm text-gray-600 dark:text-white mt-4">
                  No Bills of Materials
                </p>
                <p className="font-normal text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Get started by creating a new BoM
                </p>
                <Link
                  to={"/manufacturing/bom/add"}
                  className="text-gray-900 bg-white gap-2 mt-6 w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
                >
                  <Plus size={16} weight="bold" />
                  Add BoM
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
