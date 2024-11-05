import {
  CaretDown,
  CaretRight,
  House,
  Plus,
  XCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  Form,
  Link,
  useNavigation,
  useLoaderData,
  useActionData,
} from "@remix-run/react";

export const meta = () => {
  return [
    { title: "ERP-Overview Bills of Materials" },
    { name: "description", content: "Overview Bills of Materials" },
  ];
};

export default function BomOverview() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const actionData = useActionData();
  const components = [
    {
      name: "daging ayam",
      qty: 0.5,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
    {
      name: "tepung terigu",
      qty: 0.1,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
    {
      name: "tepung sagu",
      qty: 0.05,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
    {
      name: "tepung maizena",
      qty: 0.03,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
    {
      name: "putih telur",
      qty: 2,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
    {
      name: "baking powder",
      qty: 0.001,
      bom_cost: "Rp. 000",
      product_cost: "Rp. 000",
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mb-0 items-end justify-between space-y-4 sm:flex sm:space-y-0">
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
                      to="/manufacturing/bom"
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
                      Overview
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              BoM Overview
            </h2>
          </div>
        </div>
        {navigation.state === "submitting" ? (
          <p className="text-center text-gray-500">
            Adding bom, please wait...
          </p>
        ) : (
          <div>
            <div className="flex flex-row justify-between items-center mb-8">
              <h2 className="text-4xl font-semibold leading-none text-gray-900 dark:text-white">
                [FRO-001] Pentol
              </h2>
              <div className="flex flex-col items-center gap-1">
                <p className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
                  1.00
                </p>
                <p className="text-sm font-normal text-gray-400 dark:text-gray-500">
                  Quantity
                </p>
              </div>
            </div>
            <div className="relative bg-white border-gray-200 dark:border-gray-700 border dark:bg-gray-800 sm:rounded-lg mt-4 p-8">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-900 capitalize dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 w-3/5">
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
                      className="px-6 py-4 font-semibold text-lg text-gray-600 whitespace-nowrap dark:text-gray-300 capitalize"
                    >
                      Pentol
                    </th>
                    <td className="px-6 py-4 text-end">1.00</td>
                    <td className="px-6 py-4 text-end">Rp. 000</td>
                    <td className="px-6 py-4 text-end">Rp. 000</td>
                  </tr>
                  {components.map((component, index) => (
                    <tr
                      className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
                      key={index}
                    >
                      <th
                        scope="row"
                        className="px-12 py-4 font-light text-gray-600 whitespace-nowrap dark:text-gray-300 capitalize"
                      >
                        {component.name}
                      </th>
                      <td className="px-6 py-4 text-end">{component.qty}</td>
                      <td className="px-6 py-4 text-end dark:text-gray-600 text-gray-400">
                        {component.bom_cost}
                      </td>
                      <td className="px-6 py-4 text-end">
                        {component.product_cost}
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
                      Rp. 000
                    </td>
                    <td className="px-6 py-3 text-gray-600 whitespace-nowrap dark:text-gray-300">
                      Rp. 000
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
