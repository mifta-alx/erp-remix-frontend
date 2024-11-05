import {Link} from "@remix-run/react";
import {CaretRight, House, Package, Plus} from "@phosphor-icons/react";
import {formatPrice} from "../utils/formatPrice.js";

export const meta = () => {
    return [
        { title: "ERP-Vendors" },
        { name: "description", content: "Management Vendors" },
    ];
};

export default function Vendors(){
    let vendors = []
    let error = ''
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
                                        <House weight="fill"/>
                                    </Link>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center text-gray-400">
                                        <CaretRight size={18} weight="bold"/>
                                        <span
                                            className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                      Vendors
                    </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                            Vendors
                        </h2>
                    </div>
                    {vendors.length > 0 && (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/purchase/vendors/add"
                                className="text-gray-900 bg-white gap-2 w-full md:w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
                            >
                                <Plus size={16} weight="bold"/>
                                New
                            </Link>
                        </div>
                    )}
                </div>
                {error ? (
                    <div className="py-48  px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
                        {/*<div className="mx-auto max-w-screen-sm text-center">*/}
                        {/*    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">*/}
                        {/*        {status}*/}
                        {/*    </h1>*/}
                        {/*    <p className="mb-4 text-3xl tracking-tight first-letter:capitalize font-bold text-gray-900 md:text-4xl dark:text-white">*/}
                        {/*        {message}*/}
                        {/*    </p>*/}
                        {/*    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">*/}
                        {/*        {description}*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                    </div>
                ) : (
                    <>
                        {vendors.length > 0 ? (
                            <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
                            {/*    {vendors?.map((vendor, index) => (*/}
                            {/*        <div*/}
                            {/*            key={index}*/}
                            {/*            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-700"*/}
                            {/*        >*/}
                            {/*            <Link to={`/purchase/vendors/edit/${vendor.product_id}`}>*/}
                            {/*                <div className="h-56 w-full">*/}
                            {/*                    <img*/}
                            {/*                        className="mx-auto w-full h-full object-cover rounded-md"*/}
                            {/*                        src={product.image_url}*/}
                            {/*                        alt={product.name}*/}
                            {/*                    />*/}
                            {/*                </div>*/}
                            {/*                <div className="pt-6">*/}
                            {/*                    <div className="mb-4 flex items-center gap-2">*/}
                            {/*                        {product.tags.map((tag) => (*/}
                            {/*                            <span className="rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300" key={tag.id}>*/}
                            {/*  {tag.name}*/}
                            {/*</span>*/}
                            {/*                        ))}*/}
                            {/*                    </div>*/}
                            {/*                    <p className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">*/}
                            {/*                        {product.product_name}*/}
                            {/*                    </p>*/}

                            {/*                    <ul className="mt-2 flex items-center gap-4">*/}
                            {/*                        <li className="flex items-center gap-2">*/}
                            {/*                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">*/}
                            {/*                                {product.internal_reference && `[${product.internal_reference}]`}*/}
                            {/*                            </p>*/}
                            {/*                        </li>*/}
                            {/*                    </ul>*/}

                            {/*                    <div className="mt-4 flex items-center justify-between gap-4">*/}
                            {/*                        <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">*/}
                            {/*                            {formatPrice(product.sales_price)}*/}
                            {/*                        </p>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            </Link>*/}
                            {/*        </div>*/}
                            {/*    ))}*/}
                            </div>
                        ) : (
                            <div className="border-dashed border-2 text-5xl border-gray-300 dark:border-gray-500 text-gray-300 dark:text-gray-500 flex rounded-lg h-full w-full items-center flex-col py-40 md:py-32">
                                <Package />
                                <p className="font-semibold text-sm text-gray-600 dark:text-white mt-4">
                                    No Vendors
                                </p>
                                <p className="font-normal text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Get started by creating a new vendor
                                </p>
                                <Link
                                    to="/purchase/vendors/add"
                                    className="text-gray-900 bg-white gap-2 mt-6 w-fit hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
                                >
                                    <Plus size={16} weight="bold" />
                                    Add Vendor
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}