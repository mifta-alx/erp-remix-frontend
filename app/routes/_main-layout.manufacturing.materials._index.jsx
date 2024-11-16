import { Plus, CaretRight, Package, House } from "@phosphor-icons/react";
import { Link, useLoaderData } from "@remix-run/react";
import { EmptyView, ErrorView, MaterialView } from "@views/index.js";
import { ViewSwitch } from "@components/index.js";

export const meta = () => {
  return [
    { title: "F&F - Materials" },
    { name: "description", content: "Management Materials" },
  ];
};

export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/materials`)

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching Materials.";

      if (response.status === 404) {
        errorMessage = "Material NBot Found";
        errorDescription = "The Material you're looking for does not exist or may have been removed.";
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
    return { error: false, data };
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

export default function Materials() {

  const { error, data, message, description, status } = useLoaderData();
  const materials = data?.data || [];
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
                    Materials
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Materials
            </h2>
            <div className="flex flex-row gap-4 w-full sm:w-fit">
              {materials.length > 0 && (
                <Link
                  to="/manufacturing/materials/add"
                  className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  <Plus size={16} weight="bold" />
                  New
                </Link>
              )}
              <ViewSwitch />
            </div>
          </div>
        </div>
        {
          error ? (
            <ErrorView
              status={status}
              message={message}
              description={description}
            />
          ) : (
            <>
              {materials.length > 0 ? (
                <MaterialView materials={materials} />

              ) : (
                <EmptyView
                  section="material"
                  link="/manufacturing/materials/add"
                  icon={<Package />}
                />
              )}
            </>
          )
        }
      </div>
    </section>
  );
}
