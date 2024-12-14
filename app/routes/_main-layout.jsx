import { CaretDown, List, Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { NavLink, Outlet, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useColorScheme } from "../context/ColorScheme";
import useClickOutside from "../hooks/useClickOutside";

export default function _mainLayout() {
  const [showNav, setShowNav] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const { theme, toggleTheme } = useColorScheme();
  const location = useLocation();

  function toggleNav() {
    setShowNav(!showNav);
    setShowDropdown(null);
  }

  function toggleDropdown(type) {
    setShowDropdown((prev) => (prev === type ? null : type)); // Toggle hanya untuk dropdown tertentu
  }

  useEffect(() => {
    setShowNav(false);
    setShowDropdown(null);
  }, [location]);

  useClickOutside(dropdownRef, () => setShowDropdown(null));

  return (
    <>
      <nav className="bg-white fixed w-full dark:bg-gray-800 antialiased border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="shrink-0">
                <NavLink to="/" title="" className="">
                  <span className="self-center text-lg md:text-xl font-bold whitespace-nowrap dark:text-white text-gray-900">
                    FrozenFood<sup>ERP</sup>
                  </span>
                </NavLink>
              </div>

              <ul className="hidden lg:flex items-center justify-start gap-6 md:gap-8 py-3 sm:justify-center">
                <li>
                  <NavLink
                    to="/"
                    title=""
                    className="flex text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <button
                    data-toggle="dropdown"
                    className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                    onClick={() => toggleDropdown("manufacturing")}
                  >
                    Manufacturing
                    <CaretDown size={12} weight="bold" />
                  </button>
                </li>
                <li>
                  <button
                    data-toggle="dropdown"
                    className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                    onClick={() => toggleDropdown("purchase")}
                  >
                    Purchase
                    <CaretDown size={12} weight="bold" />
                  </button>
                </li>
                <li>
                  <button
                    data-toggle="dropdown"
                    className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                    onClick={() => toggleDropdown("sales")}
                  >
                    Sales
                    <CaretDown size={12} weight="bold" />
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium leading-none text-gray-900 dark:text-white"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                type="button"
                onClick={toggleNav}
                className="inline-flex lg:hidden items-center justify-center hover:bg-gray-100 rounded-md dark:hover:bg-gray-700 p-2 text-gray-900 dark:text-white"
              >
                <span className="sr-only">Open Menu</span>
                <List size={18} weight="bold" />
              </button>
            </div>
          </div>

          <div
            ref={navRef}
            id="ecommerce-navbar-menu-1"
            className={`bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border border-gray-200 lg:hidden rounded-lg py-3 px-4 mt-4 ${
              !showNav && "hidden"
            }`}
          >
            <ul className="text-gray-900 dark:text-white text-sm font-medium space-y-3">
              <li>
                <NavLink
                  to="/"
                  className="hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Home
                </NavLink>
              </li>
              <li>
                <button
                  data-toggle="dropdown"
                  className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                  onClick={() => toggleDropdown("manufacturing")}
                >
                  Manufacturing
                  <CaretDown size={12} weight="bold" />
                </button>
              </li>
              <li>
                <button
                  data-toggle="dropdown"
                  className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                  onClick={() => toggleDropdown("purchase")}
                >
                  Purchase
                  <CaretDown size={12} weight="bold" />
                </button>
              </li>
            </ul>
          </div>
        </div>
        {showDropdown === "manufacturing" && (
          <div
            ref={dropdownRef}
            id="mega-menu-full-dropdown"
            className="mt-1 border-gray-200 shadow-sm bg-gray-50 md:bg-white border-y dark:bg-gray-900 dark:border-gray-600"
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
                    Manage products for manufacturing.
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
                    Manage materials for manufacturing.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manufacturing/boms"
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
                    Manage bills of materials for manufacturing.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manufacturing/mo"
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
                  <div className="font-semibold">Manufacturing Orders</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage manufacturing orders.
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
        {showDropdown === "purchase" && (
          <div
            ref={dropdownRef}
            id="mega-menu-full-dropdown"
            className="mt-1 border-gray-200 shadow-sm bg-gray-50 md:bg-white border-y dark:bg-gray-900 dark:border-gray-600"
          >
            <ul className="grid max-w-screen-lg px-4 py-5 mx-auto text-gray-900 dark:text-white sm:grid-cols-2 md:px-6 gap-2">
              <li>
                <NavLink
                  to="/purchase/vendors"
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
                  <div className="font-semibold">Vendors</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all vendors.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/purchase/rfq"
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
                  <div className="font-semibold">Requests for Quotation</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all request for quotation.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/purchase/po"
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
                  <div className="font-semibold">Purchase Orders</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all purchase orders.
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
        {showDropdown === "sales" && (
          <div
            ref={dropdownRef}
            id="mega-menu-full-dropdown"
            className="mt-1 border-gray-200 shadow-sm bg-gray-50 md:bg-white border-y dark:bg-gray-900 dark:border-gray-600"
          >
            <ul className="grid max-w-screen-lg px-4 py-5 mx-auto text-gray-900 dark:text-white sm:grid-cols-2 md:px-6 gap-2">
              <li>
                <NavLink
                  to="/sales/customers"
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
                  <div className="font-semibold">Customers</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all customers.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sales/quotation"
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
                  <div className="font-semibold">Quotations</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all quotations.
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sales/sales-order"
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
                  <div className="font-semibold">Sales Order</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all your sales order.
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
      <div className="pt-28 pb-14 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Outlet />
      </div>
    </>
  );
}
