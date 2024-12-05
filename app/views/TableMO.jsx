import { formatToDecimal } from "@utils/formatDecimal.js";

const TableMO = ({ materials, currentState, status }) => {
  const formattedMaterial = materials.map((item) => ({
    name: `${
      item.material.internal_reference
        ? `[${item.material.internal_reference}]`
        : ""
    } ${item.material.name || ""}`,
    qty: currentState > 1 ? item.to_consume : item.material_qty,
    reserved: item.reserved || 0,
    consumed: item.consumed || 0,
  }));

  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 pt-6 overflow-x-auto">
      <table className="w-max sm:w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
        <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 w-64 sm:w-full">
              Product
            </th>
            <th scope="col" className="px-6 py-3 text-end w-36 sm:w-2/5">
              To Consume
            </th>
            {currentState > 1 && (
              <>
                <th scope="col" className="px-6 py-3 text-end w-36 sm:w-2/5">
                  Reserved
                </th>
                <th scope="col" className="px-6 py-3 text-end w-36 sm:w-2/5">
                  Consumed
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {formattedMaterial.map((material, index) => (
            <tr className="bg-white dark:bg-gray-800 p-0" key={index}>
              <td scope="row" className="px-6 py-4">
                {material.name}
              </td>
              <td
                className={`px-6 py-4 text-end ${
                  currentState === 5 && status === "success"
                    ? "text-gray-500 dark:text-gray-400"
                    : currentState > 2 && status !== "failed"
                    ? "text-green-600 dark:text-green-400"
                    : material.reserved < material.qty
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {formatToDecimal(material.qty)}
              </td>
              {currentState > 1 && (
                <>
                  <td
                    className={`px-6 py-4 text-end ${
                      currentState === 5 && status === "success"
                        ? "text-gray-500 dark:text-gray-400"
                        : currentState > 2 && status !== "failed"
                        ? "text-green-600 dark:text-green-400"
                        : material.reserved < material.qty
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {formatToDecimal(material.reserved)}
                  </td>
                  <td
                    className={`px-6 py-4 text-end ${
                      currentState === 5 && status === "success"
                        ? "text-gray-500 dark:text-gray-400"
                        : currentState > 3 && status !== "failed"
                        ? "text-green-600 dark:text-green-400"
                        : material.reserved < material.qty
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {formatToDecimal(material.consumed)}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableMO;
