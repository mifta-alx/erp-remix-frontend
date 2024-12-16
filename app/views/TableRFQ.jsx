import React, { useRef, useState } from "react";
import { TableSearchInput } from "@components/index.js";
import { CircleX } from "lucide-react";
import {
  formatPrice,
  formatPriceBase,
  unformatPriceBase,
} from "@utils/formatPrice.js";
import { formatToDecimal, unformatToDecimal } from "@utils/formatDecimal.js";
import { formatProductName } from "@utils/formatName.js";

const TableRFQ = ({
  endpoint,
  actionData,
  materials = [],
  materialsArr,
  setMaterialsArr,
  currentState,
}) => {
  const rowInputRefs = useRef([]);
  const [errors, setErrors] = useState(actionData?.errors);

  const addMaterialsRow = () => {
    if (materialsArr.length > 0) {
      const lastRow = materialsArr[materialsArr.length - 1];
      if (lastRow.type === "material") {
        if (!lastRow?.id) {
          rowInputRefs.current[materialsArr.length - 1]?.focus();
          setErrors((prevErrors) => ({
            ...prevErrors,
            [`items.${materialsArr.length - 1}.id`]: ["Material is required"],
          }));
          return;
        }
      } else {
        if (!lastRow?.description) {
          rowInputRefs.current[materialsArr.length - 1]?.focus();
          setErrors((prevErrors) => ({
            ...prevErrors,
            [`items.${materialsArr.length - 1}.description`]: [
              "Description is required",
            ],
          }));
          return;
        }
      }
    }

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`items.${materialsArr.length - 1}.id`]; // Hapus error dari baris sebelumnya
      return newErrors;
    });

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [
        ...prevMaterialsArr,
        {
          type: "material",
          id: "",
          description: "",
          qty: formatToDecimal(0),
          unit_price: formatPriceBase(0),
          tax: 0,
          subtotal: 0,
          qty_received: 0,
          qty_to_invoice: 0,
          qty_invoiced: 0,
          searchTerm: "",
        },
      ];

      setTimeout(() => {
        rowInputRefs.current[updatedMaterialsArr.length - 1]?.focus();
      }, 0);

      return updatedMaterialsArr;
    });
  };

  const addSectionRow = () => {
    if (materialsArr.length > 0) {
      const lastRow = materialsArr[materialsArr.length - 1];
      if (lastRow.type === "material") {
        if (!lastRow?.id) {
          rowInputRefs.current[materialsArr.length - 1]?.focus();
          setErrors((prevErrors) => ({
            ...prevErrors,
            [`items.${materialsArr.length - 1}.id`]: ["Material is required"],
          }));
          return;
        }
      } else {
        if (!lastRow?.description) {
          rowInputRefs.current[materialsArr.length - 1]?.focus();
          setErrors((prevErrors) => ({
            ...prevErrors,
            [`items.${materialsArr.length - 1}.description`]: [
              "Description is required",
            ],
          }));
          return;
        }
      }
    }

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`items.${materialsArr.length - 1}.id`]; // Hapus error dari baris sebelumnya
      return newErrors;
    });

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [
        ...prevMaterialsArr,
        {
          type: "line_section",
          id: "",
          description: "",
          qty: formatToDecimal(0),
          unit_price: formatPriceBase(0),
          tax: 0,
          subtotal: 0,
          qty_received: 0,
          qty_to_invoice: 0,
          qty_invoiced: 0,
          searchTerm: "",
        },
      ];

      setTimeout(() => {
        rowInputRefs.current[updatedMaterialsArr.length - 1]?.focus();
      }, 0);

      return updatedMaterialsArr;
    });
  };

  const removeRow = (index) => {
    setMaterialsArr(materialsArr.filter((_, i) => i !== index));
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchMaterialData = debounce(async (materialId, index) => {
    try {
      const response = await fetch(`${endpoint}/materials/${materialId}`);
      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setMaterialsArr((prevMaterialsArr) => {
            const updatedMaterialsArr = [...prevMaterialsArr];
            updatedMaterialsArr[index] = {
              ...updatedMaterialsArr[index],
              description: formatProductName(data),
              qty: formatToDecimal(1),
              unit_price: formatPriceBase(data.cost || 0),
              subtotal: 1 * data.cost,
            };
            return updatedMaterialsArr;
          });
        }
      } else {
        console.error("Failed to fetch material data", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching material data", error);
    }
  }, 300); // Delay 300ms

  const handleMaterialChange = (index, name, value) => {
    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [...prevMaterialsArr];
      updatedMaterialsArr[index] = {
        ...updatedMaterialsArr[index],
        [name]: value,
      };

      if (name === "id" && value) {
        debouncedFetchMaterialData(value, index);
      }

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
        qty: updatedValue,
        subtotal:
          unformatToDecimal(updatedValue) *
          unformatPriceBase(material.unit_price),
      };
      return updatedMaterialsArr;
    });
  };

  const handleSubtotalOnBlur = (index, value) => {
    const rawValue = value.replace(/\./g, "");
    const updatedValue =
      rawValue === ""
        ? formatPriceBase(0)
        : formatPriceBase(parseFloat(rawValue));

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [...prevMaterialsArr];
      const material = updatedMaterialsArr[index];
      updatedMaterialsArr[index] = {
        ...material,
        unit_price: updatedValue,
        subtotal:
          unformatToDecimal(material.qty) * unformatPriceBase(updatedValue),
      };
      return updatedMaterialsArr;
    });
  };

  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 pt-6">
      {currentState >= 3 ? (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
          <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th scope="col" className="ps-6 pe-3 py-3 w-60 sm:w-60">
                Product
              </th>
              <th scope="col" className="p-3 w-36 sm:w-60">
                Description
              </th>
              <th scope="col" className="p-3 text-end w-20 sm:w-24">
                Quantity
              </th>
              <th scope="col" className="p-3 text-end w-20 sm:w-24">
                Received
              </th>
              <th scope="col" className="p-3 text-end w-20 sm:w-24">
                Billed
              </th>
              <th scope="col" className="p-3 text-end w-36 sm:w-24">
                Unit Price
              </th>
              <th scope="col" className="p-3 text-end w-36 sm:w-24">
                Tax (%)
              </th>
              <th scope="col" className="ps-3 pe-6 text-end w-36 sm:w-24">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {materialsArr?.map((material, index) => {
              if (material.type === "material") {
                return (
                  <tr className="bg-white dark:bg-gray-800 p-0 m-0" key={index}>
                    <td scope="row" className="ps-6 pe-3 py-4">
                      <p>{formatProductName(material)}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p>{material.description}</p>
                    </td>
                    <td className="px-3 py-4 text-end">
                      <p>{material.qty}</p>
                    </td>
                    <td className="px-3 py-4 text-end">
                      <p>{formatToDecimal(material.qty_received)}</p>
                    </td>
                    <td className="px-3 py-4 text-end">
                      <p>{formatToDecimal(material.qty_invoiced)}</p>
                    </td>
                    <td className="px-3 py-4 text-end">
                      <p>{material.unit_price}</p>
                    </td>
                    <td className="px-3 py-4 text-end">
                      <p>{material.tax} %</p>
                    </td>
                    <td className="ps-3 py-4 pe-6 text-end">
                      <p>{formatPrice(material.subtotal)}</p>
                    </td>
                  </tr>
                );
              } else if (material.type === "line_section") {
                return (
                  <tr
                    className="bg-white dark:bg-gray-800 p-0 m-0 font-medium"
                    key={index}
                  >
                    <td className="px-6 py-4" colSpan={6}>
                      <p>{material.description}</p>
                    </td>
                  </tr>
                );
              } else {
                return null;
              }
            })}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
          <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th scope="col" className="ps-6 pe-3 py-3 w-60 sm:w-60">
                Product
              </th>
              <th scope="col" className="p-3 w-36 sm:w-60">
                Description
              </th>
              <th scope="col" className="p-3 text-end w-20 sm:w-24">
                Quantity
              </th>
              <th scope="col" className="p-3 text-end w-36 sm:w-24">
                Unit Price
              </th>
              <th scope="col" className="p-3 text-end w-36 sm:w-24">
                Tax (%)
              </th>
              <th scope="col" className="p-3 text-end w-36 sm:w-24">
                Subtotal
              </th>
              <th scope="col" className="ps-3 pe-6 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {materialsArr?.map((material, index) => {
              if (material.type === "material") {
                return (
                  <tr
                    className="bg-white dark:bg-gray-800 border-b p-0 m-0"
                    key={index}
                  >
                    <td scope="row" className="ps-6 pe-3">
                      <TableSearchInput
                        ref={(el) => (rowInputRefs.current[index] = el)}
                        data={materials}
                        parentClassName="sm:w-full"
                        placeholder="Select material"
                        valueKey="id"
                        displayKey="material_name"
                        getDisplayString={formatProductName}
                        onChange={(value) =>
                          handleMaterialChange(index, "id", value)
                        }
                        error={errors?.[`items.${index}.id`]}
                        value={material.id}
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        name="description"
                        id="description"
                        className={`${
                          errors?.[`items.${index}.description`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder=""
                        value={material.description}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        autoComplete="off"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        name="qty"
                        id="qty"
                        className={`${
                          errors?.[`items.${index}.qty`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.qty}
                        onChange={(e) =>
                          handleMaterialChange(index, "qty", e.target.value)
                        }
                        onBlur={(e) =>
                          handleFormatDecimal(index, e.target.value)
                        }
                        autoComplete="off"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        name="unit_price"
                        id="unit_price"
                        className={`${
                          errors?.[`items.${index}.unit_price`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.unit_price}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "unit_price",
                            e.target.value
                          )
                        }
                        onBlur={(e) =>
                          handleSubtotalOnBlur(index, e.target.value)
                        }
                        autoComplete="off"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        name="tax"
                        id="tax"
                        className={`${
                          errors?.[`items.${index}.tax`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.tax}
                        onChange={(e) =>
                          handleMaterialChange(index, "tax", e.target.value)
                        }
                        autoComplete="off"
                      />
                    </td>
                    <td className="px-3 text-end">
                      <p>{formatPrice(material.subtotal)}</p>
                    </td>
                    <td className="ps-3 pe-6 text-lg text-red-600 dark:text-red-500">
                      <button
                        type="button"
                        className="items-center flex justify-end"
                        onClick={() => removeRow(index)}
                      >
                        <CircleX size={16} />
                      </button>
                    </td>
                  </tr>
                );
              } else if (material.type === "line_section") {
                return (
                  <tr
                    className="bg-white dark:bg-gray-800 p-0 m-0 font-medium"
                    key={index}
                  >
                    <td className="px-6" colSpan={6}>
                      <input
                        type="text"
                        name="description"
                        id="description"
                        className={`${
                          errors?.[`items.${index}.description`] &&
                          material.description === ""
                            ? "border-red-500 dark:border-red-500"
                            : "border-transparent"
                        } text-gray-900 text-sm border-b focus:outline-none focus:ring-0 focus:border-primary-600 block w-full py-2.5 px-1 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder=""
                        value={material.description}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        autoComplete="off"
                      />
                    </td>
                    <td className="ps-3 pe-6 text-lg text-red-600 dark:text-red-500">
                      <button
                        type="button"
                        className="items-center flex justify-end"
                        onClick={() => removeRow(index)}
                      >
                        <CircleX size={16} />
                      </button>
                    </td>
                  </tr>
                );
              } else {
                return null;
              }
            })}
            <tr className="bg-gray-50 dark:bg-gray-700 p-0">
              <td colSpan="7" className="px-6 py-2.5">
                <div className="flex flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => addMaterialsRow()}
                    className="text-primary-500 font-medium hover:font-semibold"
                  >
                    Add a line
                  </button>
                  <button
                    type="button"
                    onClick={() => addSectionRow()}
                    className="text-primary-500 font-medium hover:font-semibold"
                  >
                    Add a section
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};
export default TableRFQ;
