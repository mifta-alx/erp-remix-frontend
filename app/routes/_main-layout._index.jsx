import { Link, useLoaderData } from "@remix-run/react";
import { ErrorView } from "@views/index.js";
import { formatDisplayDatetime } from "@utils/formatDate.js";
import { formatPrice } from "@utils/formatPrice.js";
import {
  Blocks,
  DollarSign,
  Factory,
  Package,
  Package2,
  ReceiptText,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { ProgressBar } from "@components/index.js";

export const meta = () => {
  return [
    { title: "F&F - Dashboard" },
    { name: "description", content: "Dashboard" },
  ];
};
export const loader = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/all-data`);

    if (!response.ok) {
      let errorMessage = "An error occurred.";
      let errorDescription = "Something went wrong while fetching products.";

      if (response.status === 404) {
        errorMessage = "Data Not Found";
        errorDescription =
          "The data you're looking for does not exist or may have been removed.";
      } else if (response.status === 500) {
        errorMessage = "Internal Server Error";
        errorDescription =
          "There is an issue on our server. Our team is working to resolve it.";
      }
      return {
        error: true,
        status: response.status,
        message: errorMessage,
        description: errorDescription,
      };
    }
    const data = await response.json();
    return { error: false, alldata: data.data };
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
export default function Index() {
  const { error, alldata, message, description, status } = useLoaderData();
  const { products, materials, bom, vendor, payments, customers, sales } =
    alldata;
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {error ? (
          <ErrorView
            status={status}
            message={message}
            description={description}
          />
        ) : (
          <div className="flex gap-5 flex-col">
            <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
              <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
                <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                  <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                    <Package size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                      Total products
                    </p>
                    <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                      {products.total}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <Link
                    to="/manufacturing/products"
                    className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
                <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                  <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                    <Package2 size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                      Total materials
                    </p>
                    <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                      {materials.total}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <Link
                    to="/manufacturing/materials"
                    className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
                <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                  <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                    <Blocks size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                      Total bills of materials
                    </p>
                    <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                      {bom.total}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <Link
                    to="/manufacturing/boms"
                    className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md">
                <div className="px-4 pt-5 pb-6 flex flex-row gap-4">
                  <div className="text-white bg-primary-500 dark:bg-primary-600 p-3 flex items-center justify-center rounded-md w-12 h-12">
                    <Factory size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-300 text-sm font-normal">
                      Total vendors
                    </p>
                    <p className="text-gray-900 dark:text-gray-50 text-2xl font-semibold">
                      {vendor.total}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <Link
                    to="/purchase/vendors"
                    className="text-sm text-primary-500 dark:text-primary-400 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid xl:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-5">
              <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md col-span-1">
                <div className="p-6">
                  <p className="text-gray-900 dark:text-gray-50 text-lg font-medium">
                    Last Transaction
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm font-normal truncate">
                    Total {payments.length} Transaction done in this month.
                  </p>
                </div>
                <div className="px-6 pb-10 flex flex-col gap-6 min-h-80">
                  {payments.slice(0, 7).map((payment, index) => (
                    <div
                      className="flex flex-row items-center justify-between"
                      key={index}
                    >
                      <div className="flex flex-row gap-4 items-center">
                        <div
                          className={`${
                            payment.payment_type === "inbound"
                              ? "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300"
                          } w-9 h-9 rounded-lg items-center justify-center flex`}
                        >
                          {payment.journal === 1 ? (
                            <DollarSign size={18} strokeWidth={1.8} />
                          ) : (
                            <Wallet size={18} strokeWidth={1.8} />
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] text-gray-700">
                            {payment.payment_type === "inbound"
                              ? "Income"
                              : "Outcome"}
                          </p>
                          <p className="text-[13px] text-gray-500">
                            {formatDisplayDatetime(payment.payment_date)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-[15px] ${
                          payment.payment_type === "inbound"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {payment.payment_type === "inbound" ? "+" : "-"}
                        {formatPrice(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 grid grid-rows-2 gap-5">
                <div className="grid grid-cols-5 gap-5">
                  <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md col-span-2">
                    <div className="p-6">
                      <p className="text-gray-400 dark:text-gray-50 text-[15px] font-normal">
                        Sales Overview
                      </p>
                      <h4 className="text-2xl text-gray-700">
                        {formatPrice(sales.total_income)}
                      </h4>
                    </div>
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-12 mb-6">
                        <div className="col-span-5">
                          <div className="py-2">
                            <div className="flex flex-row gap-2 items-center mb-3">
                              <div
                                  className="bg-primary-100 text-primary-500 w-6 h-6 rounded-md items-center flex justify-center">
                                <ShoppingCart size={16}/>
                              </div>
                              <span className="text-gray-500 font-light text-[15px]">
                                Order
                              </span>
                            </div>
                            <h5 className="text-lg font-medium text-gray-800">
                              {sales.precentage_order}%
                            </h5>
                            <p className="text-[13px] font-normal text-gray-400">
                              {sales.total_order ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex flex-col justify-center items-center h-full">
                            <div className="w-[1px] bg-gray-200 flex-grow"/>
                            <div className="my-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <p className="text-gray-400 text-[13px] font-light">
                                VS
                              </p>
                            </div>
                            <div className="w-[1px] bg-gray-200 flex-grow"/>
                          </div>
                        </div>
                        <div className="col-span-5">
                          <div className="py-2">
                            <div className="flex flex-row gap-2 items-center justify-end mb-3">
                              <span className="text-gray-500 font-light text-[15px]">
                                Quotation
                              </span>
                              <div
                                  className="bg-purple-100 text-purple-500 w-6 h-6 rounded-md items-center flex justify-center">
                                <ReceiptText size={16}/>
                              </div>
                            </div>
                            <h5 className="text-lg font-medium text-gray-800 text-end">
                              {sales.precentage_quotation}%
                            </h5>
                            <p className="text-[13px] font-normal text-gray-400 text-end">
                              {sales.total_quotation ?? 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <ProgressBar
                          data1={sales.total_order ?? 0}
                          data2={sales.total_quotation ?? 0}
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg drop-shadow-md col-span-3">
                    <div className="p-6">
                      <p className="text-gray-900 dark:text-gray-50 text-lg font-medium">
                        Top Customers
                      </p>
                    </div>
                    <div
                        className="flex flex-row items-center justify-between uppercase text-gray-500 py-4 px-6 border-y border-gray-300">
                      <p>Customer</p>
                      <p>Frequency</p>
                    </div>
                    <div className="p-6 pb-10 flex flex-col gap-4">
                      {customers.slice(0, 7).map((customer, index) => (
                          <div
                              className="flex flex-row items-center justify-between"
                              key={index}
                          >
                            <div className="flex flex-row gap-4 items-center">
                              <img
                                  src={customer.image_url}
                                  alt={customer.name}
                                  className="w-9 h-9 rounded-full"
                              />
                              <div>
                                <p className="text-[15px] text-gray-700">
                                  {customer.name}
                                </p>
                                {customer.company_name && (
                                    <p className="text-[13px] text-gray-500">
                                      {customer.company_name}
                                    </p>
                                )}
                              </div>
                            </div>
                            <h6 className={`text-[15px]`}>
                              {customer.purchase_frequency}
                            </h6>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
