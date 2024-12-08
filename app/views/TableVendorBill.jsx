import React, { useEffect, useState } from "react";
import { formatPrice, unformatPriceBase } from "@utils/formatPrice.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import { formatProductName } from "@utils/formatName.js";

const TableVendorBill = ({
  actionData,
  materialsArr,
  setMaterialsArr,
  currentState,
  bill,
}) => {
  const [errors, setErrors] = useState(actionData?.errors);

  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    }
  }, [actionData]);

  const handleMaterialChange = (index, name, value) => {
    setMaterialsArr((prevMaterialsArr) => {
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

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [...prevMaterialsArr];
      const material = updatedMaterialsArr[index];
      updatedMaterialsArr[index] = {
        ...updatedMaterialsArr[index],
        qty_to_invoice: updatedValue,
        subtotal:
          unformatToDecimal(updatedValue) *
          unformatPriceBase(material.unit_price),
      };
      return updatedMaterialsArr;
    });
  };

  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 pt-6 overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed sm:overflow-hidden">
        <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th scope="col" className="ps-6 pe-3 py-3 w-60 sm:w-60">
              Product
            </th>
            <th scope="col" className="p-3 w-36 sm:w-auto">
              Description
            </th>
            <th scope="col" className="p-3 text-end w-20 sm:w-24">
              Quantity
            </th>
            <th scope="col" className="p-3 text-end w-36 sm:w-24">
              Unit Price
            </th>
            <th scope="col" className="p-3 text-end w-20 sm:w-24">
              Tax (%)
            </th>
            <th
              scope="col"
              className="ps-3 pe-6 text-end w-36 sm:w-auto sm:min-w-24"
            >
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {materialsArr?.map((material, index) => {
            if (material.type === "material") {
              return (
                <tr className="bg-white dark:bg-gray-800 p-0 m-0" key={index}>
                  <td scope="row" className="ps-6 pe-3 py-2">
                    <p>{formatProductName(material)}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p>{material.description}</p>
                  </td>
                  <td className="px-3 py-2 text-end">
                    {currentState === 2 ? (
                      <p>{material.qty_invoiced}</p>
                    ) : currentState > 2 ? (
                      <p>{material.qty_to_invoice}</p>
                    ) : (
                      <input
                        type="text"
                        name="qty"
                        id="qty"
                        className={`${
                          errors?.[`items.${index}.qty_to_invoice`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.qty_to_invoice}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "qty_to_invoice",
                            e.target.value
                          )
                        }
                        onBlur={(e) =>
                          handleFormatDecimal(index, e.target.value)
                        }
                        autoComplete="off"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <p>{material.unit_price}</p>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <p>{material.tax} %</p>
                  </td>
                  <td className="ps-3 pe-6 py-2 text-end">
                    <p>{formatPrice(material.subtotal)}</p>
                  </td>
                </tr>
              );
            } else if (material.type === "line_section") {
              return (
                <tr
                  className="bg-white dark:bg-gray-800 border-b p-0 m-0 border-gray-200 dark:border-gray-600 font-semibold text-gray-800 dark:text-gray-200"
                  key={index}
                >
                  <td className="px-6 py-4" colSpan={6}>
                    <p>
                      {bill.source_document}: {material.description}
                    </p>
                  </td>
                </tr>
              );
            } else {
              return null;
            }
          })}
        </tbody>
      </table>
    </div>
  );
};
export default TableVendorBill;
