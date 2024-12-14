import { Link, useNavigate } from "@remix-run/react";
import { useViewContext } from "@context/ViewScheme.jsx";

const CustomersView = ({ customers }) => {
  const { view } = useViewContext();
  const navigate = useNavigate();
  return view === "gallery" ? (
    customers?.length > 0 ? (
      <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
        {customers?.map((customer, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-700"
          >
            <Link to={`/sales/customers/${customer.id}`}>
              <div className="flex flex-row gap-4">
                <div className="h-24 w-24">
                  <img
                    className="mx-auto w-full h-full object-cover rounded-md"
                    src={customer.image_url}
                    alt={customer.name}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                    {customer.name}
                  </p>
                  <div className="gap-4 flex mt-2 text-sm ">
                    <p className="rounded-xl  flex items-center gap-2 bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                      {customer.type === 1 ? "Individual" : "Company"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400 ">
                    {`${customer.city}, ${customer.state}`}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400">
                    {customer.email}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div className="min-h-96 flex items-center justify-center">
        <p className="text-xl tracking-tight font-semibold text-gray-500 md:text-2xl dark:text-gray-400">
          No result found.
        </p>
      </div>
    )
  ) : (
    <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <td scope="col" className="ps-6 pe-3 py-3.5">
                Name
              </td>
              <td scope="col" className="px-3 py-3.5">
                Phone
              </td>
              <td scope="col" className="px-3 py-3.5">
                Email
              </td>
              <td scope="col" className="px-3 py-3.5">
                City
              </td>
              <td scope="col" className="px-3 py-3.5">
                State
              </td>
            </tr>
          </thead>
          <tbody>
            {customers?.length > 0 ? (
              customers?.map((customer, index) => (
                <tr
                  className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600 "
                  key={index}
                  onClick={() => navigate(`/sales/customers/${customer.id}`)}
                >
                  <td
                    scope="row"
                    className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {customer.name}
                  </td>
                  <td className="px-3 py-4">{customer.phone ? customer.phone : "-"}</td>
                  <td className="px-3 py-4">{customer.email}</td>
                  <td className="px-3 py-4">{customer.city}</td>
                  <td className="px-3 py-4">{customer.state}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b dark:border-gray-700 text-sm bg-white dark:bg-gray-800">
                <td
                  colSpan="6"
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
  );
};

export default CustomersView;
