import { CaretDown, CaretUp, List } from "@phosphor-icons/react";
import { Outlet, Link, NavLink, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";

export const meta = () => {
  return [
    { title: "ERP-Products" },
    { name: "description", content: "Management Product" },
  ];
};

export default function Layout() {
  const [showNav, setShowNav] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  function toggleNav() {
    setShowNav(!showNav);
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  useEffect(() => {
    setShowNav(false);
    setShowDropdown(false);
  }, [location]);

  return (
    <>
      <nav className="bg-white fixed w-full border-gray-200 dark:border-gray-600 dark:bg-gray-900 z-30">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
          <a href="/" className="flex items-center space-x-3">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-gray-900">
              FrozenFood-ERP
            </span>
          </a>
          <button
            data-collapse-toggle="mega-menu-full"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mega-menu-full"
            aria-expanded="false"
            onClick={toggleNav}
          >
            <span className="sr-only">Open main menu</span>
            <List size={20} weight="bold"/>
          </button>
          <div
            id="mega-menu-full"
            className={`items-center justify-between font-medium w-full md:flex md:w-auto md:order-1 ${
              !showNav && "hidden"
            }`}
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link
                  to="#"
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700"
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  id="mega-menu-full-dropdown-button"
                  data-collapse-toggle="mega-menu-full-dropdown"
                  className={`flex items-center justify-between w-full py-2 px-3 rounded md:w-auto hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-600 md:p-0 md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700 ${
                    location.pathname.includes("/manufacturing")
                      ? "text-blue-600 dark:text-blue-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                  onClick={toggleDropdown}
                >
                  Manufacturing
                  {!showDropdown ? (
                    <CaretDown size={16} className="ms-2.5" weight="bold" />
                  ) : (
                    <CaretUp size={16} className="ms-2.5" weight="bold" />
                  )}
                </button>
              </li>
              {/* <li>
                  <Link
                    to="/products/home"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Resources
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-blue-500 md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Contact
                  </a>
                </li> */}
            </ul>
          </div>
        </div>
        {showDropdown && (
          <div
            id="mega-menu-full-dropdown"
            className="mt-1 border-gray-200 shadow-sm bg-gray-50 md:bg-white border-y dark:bg-gray-800 dark:border-gray-600"
          >
            <ul className="grid max-w-screen-lg px-4 py-5 mx-auto text-gray-900 dark:text-white sm:grid-cols-2 md:px-6 gap-2">
              <li>
                <NavLink
                  to="/manufacturing/products"
                  className={({ isActive, isPending }) =>
                    `block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isPending
                        ? "pending"
                        : isActive
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`
                  }
                >
                  <div className="font-semibold">Products</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage product for manufacturing
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manufacturing/materials"
                  className={({ isActive, isPending }) =>
                    `block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isPending
                        ? "pending"
                        : isActive
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`
                  }
                >
                  <div className="font-semibold">Materials</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage material for manufacturing.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manufacturing/bom"
                  className={({ isActive, isPending }) =>
                    `block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isPending
                        ? "pending"
                        : isActive
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`
                  }
                >
                  <div className="font-semibold">Bills of Materials</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage bill of material for manufacturing.
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
      <div className="pt-24 pb-14 px-4 bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </div>
    </>
  );
}
