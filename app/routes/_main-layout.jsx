import { CaretDown, CaretUp, List, Moon, Sun } from "@phosphor-icons/react";
import { Outlet, NavLink, useLocation } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { useColorScheme } from "../context/ColorScheme";
import useClickOutside from "../hooks/useClickOutside";

export default function _mainLayout() {
  const [showNav, setShowNav] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const { theme, toggleTheme } = useColorScheme();
  const location = useLocation();

  function toggleNav() {
    setShowNav(!showNav);
    setShowDropdown(false);
  }

  function toggleDropdown() {
    setShowDropdown(!showDropdown);
  }

  useEffect(() => {
    setShowNav(false);
    setShowDropdown(false);
  }, [location]);

  useClickOutside(dropdownRef, () => setShowDropdown(false));

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
                    className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                    onClick={toggleDropdown}
                  >
                    Manufacturing
                    {!showDropdown ? (
                      <CaretDown size={12} weight="bold" />
                    ) : (
                      <CaretUp size={12} weight="bold" />
                    )}
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

              {/* <button
                id="userDropdownButton1"
                data-dropdown-toggle="userDropdown1"
                type="button"
                className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium leading-none text-gray-900 dark:text-white"
              >
                <svg
                  className="w-5 h-5 me-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-width="2"
                    d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                Account
                <svg
                  className="w-4 h-4 text-gray-900 dark:text-white ms-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                id="userDropdown1"
                className="hidden z-10 w-56 divide-y divide-gray-100 overflow-hidden overflow-y-auto rounded-lg bg-white antialiased shadow dark:divide-gray-600 dark:bg-gray-700"
              >
                <ul className="p-2 text-start text-sm font-medium text-gray-900 dark:text-white">
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      My Account{" "}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      My Orders{" "}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      Settings{" "}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      Favourites{" "}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      Delivery Addresses{" "}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      title=""
                      className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {" "}
                      Billing Data{" "}
                    </a>
                  </li>
                </ul>

                <div className="p-2 text-sm font-medium text-gray-900 dark:text-white">
                  <a
                    href="#"
                    title=""
                    className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {" "}
                    Sign Out{" "}
                  </a>
                </div>
              </div> */}

              <button
                type="button"
                data-collapse-toggle="ecommerce-navbar-menu-1"
                aria-controls="ecommerce-navbar-menu-1"
                aria-expanded="false"
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
            className={`bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border border-gray-200 md:hidden rounded-lg py-3 px-4 mt-4 ${
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
                  className={`
                    flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500`}
                  onClick={toggleDropdown}
                >
                  Manufacturing
                  {!showDropdown ? (
                    <CaretDown size={12} weight="bold" />
                  ) : (
                    <CaretUp size={12} weight="bold" />
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {showDropdown && (
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
      </nav>
      <div className="pt-28 pb-14 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Outlet />
      </div>
    </>
  );
}
