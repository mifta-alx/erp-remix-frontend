import { CircleX } from "lucide-react";
import { TableSearchInput } from "@components/index.js";
import React, { useRef, useState } from "react";
import { formatToDecimal } from "@utils/formatDecimal.js";
import { formatProductName } from "@utils/formatName.js";

const TableBom = ({
  actionData,
  materials = [],
  materialsArr,
  setMaterialsArr,
}) => {
  const rowInputRefs = useRef([]);
  const [errors, setErrors] = useState(actionData?.errors);

  const addMaterialsRow = () => {
    if (materialsArr.length > 0) {
      const lastRow = materialsArr[materialsArr.length - 1];

      if (!lastRow?.material_id) {
        rowInputRefs.current[materialsArr.length - 1]?.focus();
        setErrors((prevErrors) => ({
          ...prevErrors,
          [`bom_components.${materialsArr.length - 1}.material_id`]: [
            "Material is required",
          ],
        }));
        return;
      }
    }

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`bom_components.${materialsArr.length - 1}.material_id`]; // Hapus error dari baris sebelumnya
      return newErrors;
    });

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [
        ...prevMaterialsArr,
        {
          material_id: "",
          material_qty: formatToDecimal(1),
          searchTerm: "",
        },
      ];

      setTimeout(() => {
        rowInputRefs.current[updatedMaterialsArr.length - 1]?.focus();
      }, 0);

      return updatedMaterialsArr;
    });
  };

  const removeMaterialRow = (index) => {
    setMaterialsArr(materialsArr.filter((_, i) => i !== index));
  };

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
    const updatedValue =
      value === "" ? formatToDecimal(1) : formatToDecimal(parseFloat(value));

    setMaterialsArr((prevMaterialsArr) => {
      const updatedMaterialsArr = [...prevMaterialsArr];
      updatedMaterialsArr[index] = {
        ...updatedMaterialsArr[index],
        material_qty: updatedValue,
      };
      return updatedMaterialsArr;
    });
  };

  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 pt-6  overflow-x-auto">
      <table className="w-max sm:w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
        <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 w-64 sm:w-full">
              Component
            </th>
            <th
              scope="col"
              className="ps-6 pe-[34px] py-3 text-end w-36 sm:w-2/5"
            >
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {materialsArr?.map((material, index) => (
            <tr className="bg-white dark:bg-gray-800 p-0 m-0" key={index}>
              <td scope="row" className="px-6">
                <TableSearchInput
                  ref={(el) => (rowInputRefs.current[index] = el)}
                  data={materials}
                  placeholder="Select material"
                  valueKey="id"
                  displayKey="material_name"
                  getDisplayString={formatProductName}
                  onChange={(value) =>
                    handleMaterialChange(index, "material_id", value)
                  }
                  error={errors?.[`bom_components.${index}.material_id`]}
                  value={material.material_id}
                />
              </td>
              <td className="px-6">
                <input
                  type="text"
                  name="quantity"
                  id="quantity"
                  className={`${
                    errors?.[`bom_components.${index}.material_qty`]
                      ? "border-red-500 dark:border-red-500"
                      : "border-transparent"
                  } text-gray-900 text-sm border-b text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full p-2.5 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                  placeholder="0"
                  value={material.material_qty}
                  onChange={(e) =>
                    handleMaterialChange(index, "material_qty", e.target.value)
                  }
                  onBlur={(e) => handleFormatDecimal(index, e.target.value)}
                  autoComplete="off"
                />
              </td>
              <td className="px-6 text-lg text-red-600 dark:text-red-500">
                <button
                  type="button"
                  className="items-center flex"
                  onClick={() => removeMaterialRow(index)}
                >
                  <CircleX size={16} />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 dark:bg-gray-700 p-0">
            <td colSpan="3" className="px-6 py-2.5">
              <button
                type="button"
                onClick={() => addMaterialsRow()}
                className="text-primary-500 font-medium hover:font-semibold"
              >
                Add a line
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default TableBom;
