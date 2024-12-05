import { Link, useLoaderData } from "@remix-run/react";
import { CirclesFour, Package, Receipt, Stack } from "@phosphor-icons/react";
import { ErrorView } from "@views/index.js";

export const meta = () => {
  return [
    { title: "F&F - Dashboard" },
    { name: "description", content: "Dashboard" },
  ];
};
export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/all-data`);

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";

      if (response.status === 404) {
        errorMessage = "Data Not Found";
        errorDescription =
          "The data you're looking for does not exist or may have been removed.";
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
    const data = await response.json();
    return { error: false, alldata: data.data };
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
export default function Index() {
  const { error, alldata, message, description, status } = useLoaderData();
  const { products, materials, bom, mo } = alldata;
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
          <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
              <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                    Total products
                  </p>
                  <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                    {products.total}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <Link
                  to="/manufacturing/products"
                  className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
              <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                  <CirclesFour size={24} />
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                    Total materials
                  </p>
                  <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                    {materials.total}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <Link
                  to="/manufacturing/materials"
                  className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
              <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                  <Stack size={24} />
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                    Total Bills of Materials
                  </p>
                  <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                    {bom.total}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <Link
                  to="/manufacturing/boms"
                  className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
              <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                  <Receipt size={24} />
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                    Total Manufacturing Orders
                  </p>
                  <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                    {mo.total}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                <Link
                  to="/manufacturing/mo"
                  className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
