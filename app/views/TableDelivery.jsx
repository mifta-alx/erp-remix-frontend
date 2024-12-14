import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatProductName } from "@utils/formatName.js";
import React, { useEffect, useState } from "react";

const TableDelivery = ({
  productArr,
  setProductArr,
  currentState,
  actionData,
}) => {
  const [errors, setErrors] = useState(actionData?.errors);

  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
  }, [actionData]);

  const handleMaterialChange = (index, name, value) => {
    setProductArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [...prevMaterialsArr];
      updatedMaterialsArr[index] = {
        ...updatedMaterialsArr[index],
        [name]: value,
      };
      return updatedMaterialsArr;
    });
  };

  const handleFormatDecimal = (index, value) => {
    const updatedValue = formatToDecimal(parseFloat(value));

    const currentQty = productArr[index].qty;

    if (updatedValue > currentQty) {
      setErrors((prevError) => ({
        ...prevError,
        [`items.${index}.qty_received`]: [
          `Received quantity cannot exceed ${formatToDecimal(currentQty)}`,
        ],
      }));
      return;
    }

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`items.${index}.qty_received`];
      return newErrors;
    });

    setProductArr((prevMaterialsArr) => {
      const updatedProductArr = [...prevMaterialsArr];
      updatedProductArr[index] = {
        ...updatedProductArr[index],
        qty_received: updatedValue,
      };
      return updatedProductArr;
    });
  };
  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 pt-6 overflow-x-auto">
      <table
        className={`w-full text-sm text-left ${
          currentState >= 4
            ? "text-gray-400 dark:text-gray-300"
            : "text-gray-500 dark:text-gray-400"
        } table-auto`}
      >
        <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th scope="col" className="ps-6 pe-3 py-3">
              Product
            </th>
            <th scope="col" className="p-3 w-36 text-end">
              Demand
            </th>
            {currentState < 4 && (
              <th scope="col" className="p-3 w-36 text-end">
                Reserved
              </th>
            )}
            <th scope="col" className="ps-3 pe-6 w-36 text-end">
              Done
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {productArr?.map((product, index) => (
            <tr className="bg-white dark:bg-gray-800 p-0 m-0" key={index}>
              <td scope="row" className="ps-6 pe-3 py-4">
                <p>{formatProductName(product)}</p>
              </td>
              <td className="px-3 py-4 text-end">
                <p>{formatToDecimal(product.qty)}</p>
              </td>
              {currentState < 4 && (
                <td className="px-3 py-4 text-end">
                  <p>{formatToDecimal(product.reserved)}</p>
                </td>
              )}
              {currentState >= 4 ? (
                <td className="ps-3 pe-6 py-4 text-end">
                  <p>{formatToDecimal(product.qty_received)}</p>
                </td>
              ) : (
                <td className="ps-3 pe-5">
                  <input
                    type="text"
                    name="qty_received"
                    id="qty_received"
                    className={`${
                      errors?.[`items.${index}.qty_received`]
                        ? "border-red-500 dark:border-red-500"
                        : "border-transparent"
                    } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                    placeholder="0"
                    value={product.qty_received}
                    onChange={(e) =>
                      handleMaterialChange(
                        index,
                        "qty_received",
                        e.target.value
                      )
                    }
                    onBlur={(e) => handleFormatDecimal(index, e.target.value)}
                    autoComplete="off"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TableDelivery;
