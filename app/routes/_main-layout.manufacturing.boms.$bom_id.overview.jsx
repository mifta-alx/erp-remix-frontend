import { ChevronRight, FileText, House, Minus, Plus } from "lucide-react";
import { Link, useLoaderData, useLocation, useParams } from "@remix-run/react";
import { ErrorView } from "@views/index.js";
import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatPrice } from "@utils/formatPrice.js";
import { useEffect, useState } from "react";
import { formatBomName, formatProductName } from "@utils/formatName.js";

export const meta = () => {
  return [
    { title: `F&F - BoM Overview` },
    { name: "description", content: `Bills of Materials Overview` },
  ];
};

export const loader = async ({ params }) => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/boms/${params.bom_id}`
    );

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

export default function BomOverview() {
  const location = useLocation();
  const { state } = location;
  const params = useParams();
  const { boms, error, message, description, status } = useLoaderData();

  const [quantity, setQuantity] = useState(0);
  useEffect(() => {
    setQuantity(boms.bom_qty);
  }, [boms]);

  const formattedBoM = {
    bom_id: boms.bom_id,
    product: {
      id: boms.product.id,
      name: boms.product.name,
      cost: quantity * boms.product.cost,
      sales_price: boms.product.sales_price,
      internal_reference: boms.product.internal_reference,
    },
    bom_reference: boms.bom_reference,
    bom_qty: quantity,
    bom_components: boms.bom_components.map((component) => ({
      material: {
        id: component.material.id,
        name: component.material.name,
        cost: quantity * component.material_qty * component.material.cost,
        qty: quantity * component.material_qty,
        sales_price: component.material.sales_price,
        internal_reference: component.material.internal_reference,
      },
    })),
    product_cost: quantity * boms.product.cost,
    product_unit_cost: boms.product.cost,
    boms_cost: boms.bom_components.reduce((total, component) => {
      return (
        total + quantity * component.material_qty * component.material.cost
      );
    }, 0),
    boms_unit_cost: boms.bom_components.reduce((total, component) => {
      return total + component.material_qty * component.material.cost;
    }, 0),
  };
  console.log(formattedBoM);
  const handleAddQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleSubtractQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const sourcePage = [
    {
      title: "Bills of Materials",
      url: "/manufacturing/boms",
    },
    {
      title: formatBomName(boms),
      url: `/manufacturing/boms/${params.bom_id}`,
    },
    {
      title: "Overview",
      url: `/manufacturing/boms/${params.bom_id}/overview`,
    },
  ];

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
          <>
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
                  {state ? (
                    state.map((nav) => (
                      <li>
                        <div className="flex items-center text-gray-400">
                          <ChevronRight size={18} strokeWidth={2} />
                          <Link
                            to={nav.url}
                            className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                          >
                            {nav.title}
                          </Link>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="flex items-center text-gray-400">
                        <ChevronRight size={18} strokeWidth={2} />
                        <Link
                          to="/manufacturing/boms"
                          className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                          Bills of Materials
                        </Link>
                      </div>
                    </li>
                  )}
                  <li>
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <Link
                        to={`/manufacturing/boms/${params.bom_id}`}
                        className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                      >
                        {formatBomName(boms)}
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center text-gray-400">
                      <ChevronRight size={18} strokeWidth={2} />
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                        Overview
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Bills of Materials
                </h2>
                <div className="flex flex-row gap-3 sm:gap-4 w-full sm:w-fit">
                  <button
                    type="button"
                    className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  >
                    <FileText size={16} />
                    Export
                  </button>
                  <div className="inline-flex " role="group">
                    <button
                      type="button"
                      onClick={handleSubtractQuantity}
                      className="inline-flex items-center px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-red-600 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-500 dark:hover:bg-gray-700"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      {quantity}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuantity}
                      className="inline-flex items-center px-4 py-2 gap-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-primary-500 dark:hover:bg-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 sm:rounded-lg p-8 space-y-12">
              <div className="flex flex-row justify-between items-center">
                <div className="space-y-1">
                  <Link
                    to={`/manufacturing/products/${formattedBoM.product.id}`}
                    state={sourcePage}
                    className="text-2xl font-semibold leading-none text-primary-600 dark:text-primary-500"
                  >
                    {formatProductName(formattedBoM.product)}
                  </Link>
                  {formattedBoM.bom_reference && (
                    <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Reference: {formattedBoM.bom_reference}
                    </h6>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {formatToDecimal(quantity)}
                  </p>
                  <p className="text-sm font-normal text-gray-400 dark:text-gray-500">
                    Quantity
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto lg:overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th scope="col" className="px-6 py-3 w-2/5">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-end">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-end">
                        BoM Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-end">
                        Product Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                      <th
                        scope="row"
                        className="px-6 py-4 font-semibold text-lg whitespace-nowrap text-primary-600 dark:text-primary-500 capitalize"
                      >
                        <Link
                          to={`/manufacturing/products/${boms.product.id}`}
                          state={sourcePage}
                        >
                          {formatProductName(formattedBoM.product)}
                        </Link>
                      </th>
                      <td className="px-6 py-4 text-end">
                        {formatToDecimal(formattedBoM.bom_qty)}
                      </td>
                      <td className="px-6 py-4 text-end">
                        {formatPrice(formattedBoM.boms_cost)}
                      </td>
                      <td className="px-6 py-4 text-end">
                        {formatPrice(formattedBoM.product_cost)}
                      </td>
                    </tr>
                    {formattedBoM.bom_components.map((component, index) => (
                      <tr
                        className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
                        key={index}
                      >
                        <th
                          scope="row"
                          className="px-12 py-4 font-normal whitespace-nowrap text-primary-600 dark:text-primary-500 capitalize"
                        >
                          <Link
                            to={`/manufacturing/materials/${component.material.id}`}
                            state={sourcePage}
                          >
                            {formatProductName(component.material)}
                          </Link>
                        </th>
                        <td className="px-6 py-4 text-end">
                          {formatToDecimal(component.material.qty)}
                        </td>
                        <td className="px-6 py-4 text-end dark:text-gray-600 text-gray-400">
                          {formatPrice(component.material.cost)}
                        </td>
                        <td className="px-6 py-4 text-end">
                          {formatPrice(component.material.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className=" text-gray-900 dark:text-white text-end">
                      <th
                        scope="row"
                        colSpan={2}
                        className="px-6 py-3 text-base font-semibold"
                      >
                        Unit Cost
                      </th>
                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap dark:text-gray-300">
                        {formatPrice(formattedBoM.boms_unit_cost)}
                      </td>
                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap dark:text-gray-300">
                        {formatPrice(formattedBoM.product_unit_cost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
