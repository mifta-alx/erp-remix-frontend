import { Link, useNavigate } from "@remix-run/react";
import { formatPrice } from "@utils/formatPrice.js";
import { useViewContext } from "@context/ViewScheme.jsx";
import { formatToDecimal } from "@utils/formatDecimal.js";

const ProductView = ({ products }) => {
  const { view } = useViewContext();
  const navigate = useNavigate();
  return view === "gallery" ? (
    products?.length > 0 ? (
      <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-700"
          >
            <Link to={`/manufacturing/products/${product.id}`}>
              <div className="flex flex-row gap-4">
                <div className="h-24 w-24">
                  <img
                    className="mx-auto w-full h-full object-cover rounded-md"
                    src={product.image_url}
                    alt={product.name}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    {product.internal_reference &&
                      `[${product.internal_reference}]`}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400">
                    Price: {formatPrice(product.sales_price)}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400">
                    On hand: {formatToDecimal(product.stock)}
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
                Product name
              </td>
              <td scope="col" className="px-3 py-3.5">
                Internal Reference
              </td>
              <td scope="col" className="px-3 py-3.5">
                Tags
              </td>
              <td scope="col" className="px-3 py-3.5">
                Sales Price
              </td>
              <td scope="col" className="px-3 py-3.5">
                Cost
              </td>
              <td scope="col" className="px-3 py-3.5">
                On Hand
              </td>
            </tr>
          </thead>
          <tbody>
            {products?.length > 0 ? (
              products?.map((product, index) => (
                <tr
                  className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600 "
                  key={index}
                  onClick={() =>
                    navigate(`/manufacturing/products/${product.id}`)
                  }
                >
                  <td
                    scope="row"
                    className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {product.name}
                  </td>
                  <td className="px-3 py-4">{product.internal_reference}</td>
                  <td className="px-3 py-4 flex items-center gap-2">
                    {product.tags.map((tag) => (
                      <span
                        className="rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        key={tag.id}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-4">
                    {formatPrice(product.sales_price)}
                  </td>
                  <td className="px-3 py-4">{formatPrice(product.cost)}</td>
                  <td className="px-3 py-4">
                    {formatToDecimal(product.stock)}
                  </td>
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

export default ProductView;
