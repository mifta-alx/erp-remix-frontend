import { CaretRight, House, CaretDown, Plus, XCircle } from "@phosphor-icons/react";
import { useRef, useState, useEffect } from "react";
import { Link, Form } from "@remix-run/react";

export const meta = () => {
  return [
    { title: "ERP-Manufacturing Orders" },
    { name: "description", content: "Add Manufacturing Orders" },
  ];
};

export default function AddMo() {
  const dropdownRef = useRef(null);
  const materialRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [actionData, setActionData] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [materialsArr, setMaterialsArr] = useState([]);

  const [formData, setFormData] = useState({
    product_id: "",
    reference: "",
    qty: 0,
    state: 2,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const stepperProcess = [
    {
      state: 1,
      label: "Draft",
    },
    {
      state: 2,
      label: "Confirmed",
    },
    {
      state: 3,
      label: "Check Availablity",
    },
    {
      state: 4,
      label: "In Progress",
    },
    {
      state: 5,
      label: "Done",
    },
  ];

  const data = [
    {
      bom_id: 1,
      product: {
        id: 1,
        name: "Pentol",
        cost: 10000,
        sales_price: 15000,
        barcode: "PR-001",
        internal_reference: "PR-001",
      },
      bom_reference: "PPP",
      bom_qty: 1,
      bom_components: [
        {
          material: {
            id: 1,
            name: "Daging Ayam",
            cost: 14000,
            sales_price: 0,
            barcode: "P-001",
            internal_reference: "P-001",
          },
          material_qty: 10,
          material_total_cost: 140000,
        },
        {
          material: {
            id: 1,
            name: "Daging Ayam",
            cost: 14000,
            sales_price: 0,
            barcode: "P-001",
            internal_reference: "P-001",
          },
          material_qty: 10,
          material_total_cost: 140000,
        },
      ],
      bom_cost: 140000,
    }
  ];
  const handleSubmit = () => {};
  useEffect(() => {
    setMaterialsArr(data[0].bom_components)
  }, [])
  console.log(materialsArr)
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
                <li>
                  <div className="flex items-center text-gray-400">
                    <CaretRight size={18} weight="bold" />
                    <Link
                      to="/manufacturing/mo"
                      className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                    >
                      Manufacturing Orders
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center text-gray-400">
                    <CaretRight size={18} weight="bold" />
                    <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                      Add Manufacturing Order
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            {/* <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Add a new manufacturing order
            </h2> */}
          </div>
        </div>
        <div className="py-8">
          <ol className="flex items-center md:w-3/4 mx-auto text-sm text-gray-500 sm:text-base">
            {stepperProcess.map((step, index) => (
              <li
                key={index}
                className={`flex relative ${
                  index < stepperProcess.length - 1
                    ? ` w-full after:w-full lg:after:w-7/12 xl:after:w-3/4 after:h-0.5 ${
                        index <= formData.state - 1
                          ? "after:bg-primary-500"
                          : "after:bg-slate-200"
                      } after:inline-block after:absolute lg:after:top-4 after:top-3 after:left-5 md:after:left-5 lg:after:left-[30%] xl:after:left-[20%]`
                    : ""
                }`}
              >
                <div class="block relative whitespace-nowrap z-10">
                  {index <= formData.state ? (
                    <span
                      class={`custom-shadow-step w-6 h-6 bg-primary-500 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8`}
                    >
                      <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </span>
                  ) : (
                    <span class="w-6 h-6 bg-slate-100 border-2 border-gray-200 dark:border-gray-700 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8">
                      <div class="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
                    </span>
                  )}
                  <p
                    className={`text-xs ${
                      index <= formData.state
                        ? "text-primary-500 font-medium"
                        : "text-gray-400 dark:border-gray-700 font-normal "
                    } text-center whitespace-normal lg:whitespace-nowrap absolute left-1/2 transform -translate-x-1/2`}
                  >
                    {step.label}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Form onSubmit={handleSubmit} className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 w-full">
            <div>
              <label
                htmlFor="product"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Product
              </label>

              <div ref={dropdownRef} className="relative w-full">
                <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500 dark:text-gray-400">
                  <CaretDown weight="bold" size={16} />
                </div>
                <input
                  type="text"
                  name="product"
                  id="product"
                  className={`bg-gray-50 border ${
                    actionData?.errors?.product_id
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                  placeholder="Select product"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsDropdownVisible(true)}
                  autoComplete="off"
                />
                {isDropdownVisible && (
                  <div
                    id="dropdown"
                    className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-md w-full max-h-32 overflow-y-auto mt-1 dark:bg-gray-700"
                  >
                    <ul
                      className="py-2 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="dropdown-button"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <li key={product.product_id}>
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectProduct(
                                  product.product_id,
                                  `[${product.internal_reference}] ${product.product_name}`
                                )
                              }
                              className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              {product.internal_reference
                                ? `[${product.internal_reference}] `
                                : ""}
                              {product.product_name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span className="inline-flex w-full px-4 py-2 text-gray-500 dark:text-gray-400">
                            No results found
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {actionData?.errors?.product_id && (
                <p className="mt-2 text-sm text-red-600">
                  {actionData?.errors.product_id}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="product"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Bill of Material
              </label>

              <div ref={dropdownRef} className="relative w-full">
                <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500 dark:text-gray-400">
                  <CaretDown weight="bold" size={16} />
                </div>
                <input
                  type="text"
                  name="product"
                  id="product"
                  className={`bg-gray-50 border ${
                    actionData?.errors?.product_id
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                  placeholder="Select BoM"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsDropdownVisible(true)}
                  autoComplete="off"
                />
                {isDropdownVisible && (
                  <div
                    id="dropdown"
                    className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-md w-full max-h-32 overflow-y-auto mt-1 dark:bg-gray-700"
                  >
                    <ul
                      className="py-2 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="dropdown-button"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <li key={product.product_id}>
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectProduct(
                                  product.product_id,
                                  `[${product.internal_reference}] ${product.product_name}`
                                )
                              }
                              className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              {product.internal_reference
                                ? `[${product.internal_reference}] `
                                : ""}
                              {product.product_name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span className="inline-flex w-full px-4 py-2 text-gray-500 dark:text-gray-400">
                            No results found
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {actionData?.errors?.product_id && (
                <p className="mt-2 text-sm text-red-600">
                  {actionData?.errors.product_id}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="qty"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Quantity
              </label>
              <input
                type="text"
                id="qty"
                name="qty"
                className={`bg-gray-50 border ${
                  actionData?.errors?.bom_qty
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                placeholder="0"
                value={formData.qty}
                onChange={handleChange}
              />
              {actionData?.errors?.bom_qty && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  {actionData.errors.bom_qty}
                </p>
              )}
            </div>
          </div>

          <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 sm:rounded-lg mt-4 p-8">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th scope="col" className="px-6 py-3 w-4/5">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    To Consume
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Consumed
                  </th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {materialsArr?.map((material, index) => (
                  <tr
                    className="bg-white dark:bg-gray-800 border-b p-0 border-gray-300 dark:border-gray-700"
                    key={index}
                  >
                    <td scope="row" className="px-6 py-4">
                      xxxxx
                      {/* <div
                        ref={(el) => (materialRefs.current[index] = el)}
                        className="relative w-1/2"
                      >
                        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-500 dark:text-gray-400">
                          {focusedIndex === index && (
                            <CaretDown weight="bold" size={16} />
                          )}
                        </div>
                        <input
                          type="text"
                          name="product"
                          id="product"
                          className={`${
                            actionData?.errors?.[
                              `bom_components.${index}.material_id`
                            ]
                              ? "border-b-2 border-red-500 dark:border-red-500"
                              : "border-0"
                          } text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-primary-600 block w-full p-2.5 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                          placeholder="Select material"
                          value={material.searchTerm}
                          onChange={(e) =>
                            handleMaterialChange(
                              index,
                              "searchTerm",
                              e.target.value
                            )
                          }
                          onFocus={() => {
                            setFocusedIndex(index);
                            toggleDropdownVisibility(index, true);
                          }}
                          autoComplete="off"
                        />
                        {material.isDropdownVisible && (
                          <div
                            id="dropdown"
                            className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg border border-fade dark:border-gray-600 w-full max-h-32 overflow-y-auto dark:bg-gray-700"
                          >
                            <ul
                              className="py-2 text-sm text-gray-700 dark:text-gray-200"
                              aria-labelledby="dropdown-button"
                            >
                              {materials.length > 0 ? (
                                materials.filter((mat) => {
                                  const materialString = mat.internal_reference
                                    ? `[${mat.internal_reference}] ${mat.material_name}`
                                    : mat.material_name;
                                  return materialString
                                    .toLowerCase()
                                    .includes(
                                      material.searchTerm.toLowerCase()
                                    );
                                }).length > 0 ? (
                                  materials
                                    .filter((mat) => {
                                      const materialString =
                                        mat.internal_reference
                                          ? `[${mat.internal_reference}] ${mat.material_name}`
                                          : mat.material_name;
                                      return materialString
                                        .toLowerCase()
                                        .includes(
                                          material.searchTerm.toLowerCase()
                                        );
                                    })
                                    .map((mat) => (
                                      <li key={mat.material_id}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSelectMaterial(
                                              index,
                                              mat.material_id,
                                              mat.material_name
                                            )
                                          }
                                          className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                          {mat.internal_reference
                                            ? `[${mat.internal_reference}] ${mat.material_name}`
                                            : mat.material_name}
                                        </button>
                                      </li>
                                    ))
                                ) : (
                                  <li>
                                    <span className="inline-flex w-full px-4 py-2 text-gray-500 dark:text-gray-400">
                                      No results "{material.searchTerm}" found
                                    </span>
                                  </li>
                                )
                              ) : (
                                <li>
                                  <span className="inline-flex w-full px-4 py-2 text-gray-500 dark:text-gray-400">
                                    No materials available
                                  </span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div> */}
                    </td>
                    <td className="px-6 py-4 text-end">
                      {/* <input
                        type="text"
                        name="quantity"
                        id="quantity"
                        className={`${
                          actionData?.errors?.[
                            `bom_components.${index}.material_qty`
                          ]
                            ? "border-b-2 border-red-500 dark:border-red-500"
                            : "border-0"
                        } text-gray-900 text-sm text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full p-2.5 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.material_qty}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "material_qty",
                            e.target.value
                          )
                        }
                      /> */}
                      xx
                    </td>
                    <td className="px-6 py-4 text-end">
                      {/* <input
                        type="text"
                        name="quantity"
                        id="quantity"
                        className={`${
                          actionData?.errors?.[
                            `bom_components.${index}.material_qty`
                          ]
                            ? "border-b-2 border-red-500 dark:border-red-500"
                            : "border-0"
                        } text-gray-900 text-sm text-end focus:outline-none focus:ring-0 focus:border-primary-600 block w-full p-2.5 dark:bg-transparent dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500`}
                        placeholder="0"
                        value={material.material_qty}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "material_qty",
                            e.target.value
                          )
                        }
                      /> */}
                      xx
                    </td>
                    <td className="px-6 py-4">
                      <div class="flex items-center">
                        <input
                          id="default-checkbox"
                          type="checkbox"
                          value=""
                          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
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
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="text-gray-900 bg-white mt-4 sm:mt-6 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Produce All
          </button>

          <button
            type="button"
            onClick={() => {}}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Cancel Order
          </button>
        </Form>
      </div>
    </section>
  );
}
