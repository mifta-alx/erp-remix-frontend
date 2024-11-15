import { XCircle } from "@phosphor-icons/react";
import { TableSearchInput } from "@components/index.js";
import { useRef, useState } from "react";

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
          material_qty: 1,
          searchTerm: "",
        },
      ];

      // Focus the last added row
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
  // const handleQuantitMaterialChange = (index, name, value) => {
  //   const updatedMaterials = materialsArr.map((material, i) =>
  //     i === index ? { ...material, [name]: value } : material
  //   );
  //   setMaterialsArr(updatedMaterials);
  // };

  const getDisplayStringMaterials = (item) => {
    return item.internal_reference
      ? `[${item.internal_reference}] ${item.material_name}`
      : item.material_name;
  };

  return (
    <div className="bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 rounded-lg mt-6 py-6">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
        <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 sm:w-4/5 w-auto">
              Component
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {materialsArr?.map((material, index) => (
            <tr
              className="bg-white dark:bg-gray-800 border-b p-0 m-0 border-gray-200 dark:border-gray-600"
              key={index}
            >
              <td scope="row" className="px-6">
                <TableSearchInput
                  ref={(el) => (rowInputRefs.current[index] = el)}
                  data={materials}
                  placeholder="Select material"
                  valueKey="material_id"
                  displayKey="material_name"
                  getDisplayString={getDisplayStringMaterials}
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
                  autoComplete="off"
                />
              </td>
              <td className="px-6 text-lg text-red-600 dark:text-red-500">
                <button
                  type="button"
                  className="items-center flex"
                  onClick={() => removeMaterialRow(index)}
                >
                  <XCircle weight="bold" />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 dark:bg-gray-700 border-b p-0 border-gray-300 dark:border-gray-700">
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
