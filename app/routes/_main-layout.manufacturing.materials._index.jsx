import { Plus, CaretRight, Package, House } from "@phosphor-icons/react";
import { Link, useLoaderData } from "@remix-run/react";
import { formatPrice } from "../utils/formatPrice";
import { EmptyView, ErrorView } from "@views/index.js";

export const meta = () => {
  return [
    { title: "ERP-Materials" },
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
                      Materials
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Materials
            </h2>
          </div>
          {materials.length > 0 && (
            <div className="flex items-center space-x-4">
              <Link
                to={"/manufacturing/materials/add"}
                className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
              >
                <Plus size={16} weight="bold" />
                New
              </Link>

            </div>
          )}
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
                <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                  {materials?.map((material, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-700"
                    >
                      <Link to={`/manufacturing/materials/edit/${material.material_id}`}>
                        <div className="h-56 w-full">
                          <img
                            className="mx-auto w-full h-full object-cover rounded-md"
                            src={material.image_url}
                            alt={material.material_name}
                          />
                        </div>
                        <div className="pt-6">
                          <div className="mb-4 flex items-center gap-2">
                            {material.tags.map((tag) => (
                              <span
                                className="rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                                key={tag.id}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                            {material.material_name}
                          </p>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {material.internal_reference &&
                              `[${material.internal_reference}]`}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-4">
                            <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
                              {formatPrice(material.sales_price)}
                            </p>
                          </div>
                        </div>
                      </Link>

                    </div>
                  ))}
                </div>
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
