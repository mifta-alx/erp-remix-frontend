import { Link, useNavigate } from "@remix-run/react";
import { useViewContext } from "@context/ViewScheme.jsx";

const VendorView = ({ vendors }) => {
    const { view } = useViewContext();
    const navigate = useNavigate();
    return view === "gallery" ? (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-3">
            {vendors?.map((vendor, index) => (
                <div
                    key={index}
                    className=" rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-700"
                >
                    <Link to={`/purchase/vendors/${vendor.vendor_id}`}>
                        <div className="flex flex-row gap-4">
                            <div className="h-24 w-24">
                                <img
                                    className="mx-auto w-full h-full object-cover rounded-md"
                                    src={vendor.image_url}
                                    alt={vendor.name}
                                />
                            </div>
                            <div>
                                <p className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                                    {vendor.name}
                                </p>
                                <div className="gap-4 flex mt-2 text-sm ">
                                    <p className="rounded-xl  flex items-center gap-2 bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                                        {vendor.vendor_type}
                                    </p>
                                </div>
                                <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400 ">
                                    {`${vendor.city}, ${vendor.state}`}
                                </p>
                                <p className="mt-2 text-sm font-normal leading-tight text-gray-500 dark:text-gray-400">
                                    {vendor.email}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    ) : (
        <div className="bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 shadow-sm sm:rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-sm font-semibold text-gray-800 border-b border-gray-200 dark:border-gray-700 capitalize bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <td scope="col" className="ps-6 pe-3 py-3.5">
                                Name
                            </td>
                            <td scope="col" className="px-3 py-3.5">
                                Phone
                            </td>
                            <td scope="col" className="px-3 py-3.5">
                                Email
                            </td>
                            <td scope="col" className="px-3 py-3.5">
                                City
                            </td>
                            <td scope="col" className="px-3 py-3.5">
                                Country
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors?.map((vendor, index) => (
                            <tr
                                className="border-b dark:border-gray-700 text-sm cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-600 "
                                key={index}
                                onClick={() =>
                                    navigate(`/purchase/vendors/${vendor.id}`)
                                }
                            >
                                <td
                                    scope="row"
                                    className="ps-6 pe-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {vendor.name}
                                </td>
                                <td className="px-3 py-4">{vendor.phone}</td>

                                <td className="px-3 py-4">
                                    {vendor.email}
                                </td>
                                <td className="px-3 py-4">{vendor.city}</td>
                                <td className="px-3 py-4">{vendor.state}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorView;
