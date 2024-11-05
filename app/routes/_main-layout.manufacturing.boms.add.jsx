import {
  CaretDown,
  CaretRight,
  House,
  Plus,
  XCircle,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import {
  Form,
  Link,
  useNavigation,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import useClickOutside from "../hooks/useClickOutside";

export const meta = () => {
  return [
    { title: "ERP-Add Bills of Materials" },
    { name: "description", content: "Add Bills of Materials" },
  ];
};

export const loader = async () => {
  let apiEndpoint = process.env.API_URL;
  try {
    const [productsResponse, materialsResponse] = await Promise.all([
      fetch(`${process.env.API_URL}/products`),
      fetch(`${process.env.API_URL}/materials`),
    ]);
    if (!productsResponse.ok || !materialsResponse.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";
      let status;
      if (!productsResponse.ok) {
        status = productsResponse.status;
        if (status === 404) {
          errorMessage = "Products Not Found";
          errorDescription = "The products you're looking for do not exist.";
        }
      } else if (!materialsResponse.ok) {
        status = materialsResponse.status;
        if (status === 404) {
          errorMessage = "Material Not Found";
          errorDescription = "The material you're looking for do not exist.";
        }
      }

      if (status === 500) {
        errorMessage = "Internal Server Error";
        errorDescription =
          "There is an issue on our server. Our team is working to resolve it.";
      }
      return {
        error: true,
        status,
        message: errorMessage,
        description: errorDescription,
      };
    }

    const [products, materials] = await Promise.all([
      productsResponse.json(),
      materialsResponse.json(),
    ]);

    return {
      API_URL: apiEndpoint,
      products: products.data,
      materials: materials.data,
    };
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

export default function AddBom() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { API_URL, products, materials, error, message, description, status } =
    useLoaderData();
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [actionData, setActionData] = useState();
  useClickOutside(dropdownRef, () => setIsDropdownVisible(false));
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [formData, setFormData] = useState({
    product_id: "",
    reference: "",
    qty: 0,
  });

  // const filteredProducts = products?.filter((product) => {
  //   const productString = product.internal_reference
  //     ? `[${product.internal_reference}] ${product.product_name}`
  //     : product.product_name;

  //   // return productString.toLowerCase().includes(searchTerm.toLowerCase());
  //   return (
  //     !selectedProducts.includes(product.product_id) &&
  //     productString.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // });
  const filteredProducts = products?.filter((product) => {
    const productString = product.internal_reference
      ? `[${product.internal_reference}] ${product.product_name}`
      : product.product_name;

    // If a product is already selected, stop filtering based on searchTerm and only remove already selected products
    if (formData.product_id) {
      return !selectedProducts.includes(product.product_id);
    }

    // Otherwise, filter based on searchTerm and remove already selected products
    return (
      productString.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectProduct = (product_id, displayName) => {
    setSelectedProducts((prevSelected) => [...prevSelected, product_id]);
    setFormData((prevData) => ({
      ...prevData,
      product_id,
    }));
    setSearchTerm(displayName);
    setIsDropdownVisible(false);
  };

  const [materialsArr, setMaterialsArr] = useState([]);

  const materialRefs = useRef([]);

  const addMaterialsRow = () => {
    setMaterialsArr([
      ...materialsArr,
      {
        material_id: "",
        material_qty: 1,
        searchTerm: "",
        isDropdownVisible: false,
      },
    ]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      materialRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          toggleDropdownVisibility(index, false);
        }
      });
      setFocusedIndex(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [materialsArr]);

  const removeMaterialRow = (index) => {
    setMaterialsArr(materialsArr.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, name, value) => {
    const updatedMaterials = materialsArr.map((material, i) =>
      i === index ? { ...material, [name]: value } : material
    );
    setMaterialsArr(updatedMaterials);
  };

  const toggleDropdownVisibility = (index, isVisible) => {
    const updatedMaterials = materialsArr.map((material, i) =>
      i === index ? { ...material, isDropdownVisible: isVisible } : material
    );
    setMaterialsArr(updatedMaterials);
  };

  const handleSelectMaterial = (index, materialId, materialName) => {
    const updatedMaterials = materialsArr.map((material, i) =>
      i === index
        ? {
            ...material,
            material_id: materialId,
            searchTerm: materialName,
            isDropdownVisible: false,
          }
        : material
    );
    setMaterialsArr(updatedMaterials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      product_id: formData.product_id,
      bom_qty: formData.qty,
      bom_reference: formData.reference,
      bom_components: materialsArr.map((material) => ({
        material_id: material.material_id,
        material_qty: material.material_qty,
      })),
    };

    try {
      const response = await fetch(`${API_URL}/boms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const result = await response.json();
        setActionData({ errors: result.errors || {} });
        return;
      }
      navigate(`/manufacturing/boms`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {error ? (
          <div className="py-48  px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
                {status}
              </h1>
              <p className="mb-4 text-3xl tracking-tight first-letter:capitalize font-bold text-gray-900 md:text-4xl dark:text-white">
                {message}
              </p>
              <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        ) : (
          <>
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
                          to="/manufacturing/boms"
                          className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                          Bills of Materials
                        </Link>
                      </div>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center text-gray-400">
                        <CaretRight size={18} weight="bold" />
                        <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                          Add Bills of Materials
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Add a Bills of Materials
                </h2>
              </div>
            </div>
            {navigation.state === "submitting" ? (
              <p className="text-center text-gray-500">
                Adding bom, please wait...
              </p>
            ) : (
              <Form onSubmit={handleSubmit}>
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
                      htmlFor="price"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      id="price"
                      className={`bg-gray-50 border 
                      border-gray-300 dark:border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                      placeholder="BOM-001"
                      value={formData.reference}
                      onChange={handleChange}
                    />
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

                {/* Table */}
                <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 sm:rounded-lg mt-4 p-8">
                  <div className="flex-row items-center justify-between space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
                    <div>
                      <h5 className="mr-3 font-semibold text-gray-800 dark:text-white">
                        Components
                      </h5>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Attach material component on your product
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMaterialsRow()}
                      className="flex flex-row w-full md:w-fit items-center justify-center text-gray-900 bg-white gap-2 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                    >
                      <Plus size={14} weight="bold" />
                      Component
                    </button>
                  </div>
                  <table className="w-full text-sm text-left mt-6 text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th scope="col" className="px-6 py-3 w-4/5">
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
                          className="bg-white dark:bg-gray-800 border-b p-0 border-gray-300 dark:border-gray-700"
                          key={index}
                        >
                          <td scope="row" className="px-6">
                            <div
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
                                        const materialString =
                                          mat.internal_reference
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
                                            No results "{material.searchTerm}"
                                            found
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
                            </div>
                          </td>
                          <td className="px-6">
                            <input
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
                    </tbody>
                  </table>
                </div>
                <button
                  type="submit"
                  className="text-gray-900 bg-white mt-4 sm:mt-6 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                  Save BoM
                </button>
              </Form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
