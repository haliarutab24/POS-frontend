import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp, FaWallet,
  FaFileInvoiceDollar,
  FaBookOpen,
  FaBox,
  FaShoppingCart,
  FaReceipt,
  FaUsers,
  FaBarcode,
  FaChartBar,
  FaUserShield,
  FaCogs,
  FaTags,
  FaIndustry,
  FaTruck,
  FaTasks,
  FaWarehouse,
  FaCubes,
  FaBalanceScale,
  FaInfoCircle,   // About
  FaUserCog,      // Software User
  FaKey,        // Password

} from "react-icons/fa";
import { RiLogoutBoxRLine, RiDashboardFill } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", icon: <RiDashboardFill /> },
  { to: "/admin/item-details", label: "Item Details", icon: <FaBox /> },
  { to: "/admin/item-purchase", label: "Purchase", icon: <FaShoppingCart /> },
  { to: "/admin/sales-invoice", label: "Sales", icon: <FaReceipt /> },
  { to: "/admin/customers", label: "Customers", icon: <FaUsers /> },
  { to: "/admin/customers-booking", label: "Booking Customer", icon: <FaUsers /> },
  { to: "/admin/item-barcode", label: "Item Barcode", icon: <FaBarcode /> },
  { to: "/admin/expiry-tags", label: "Expiry Tags", icon: <FaTags /> },
  { to: "/admin/report", label: "Report", icon: <FaChartBar /> },
  {
    label: "Setup",
    icon: <FaCogs />,
    children: [
      { to: "/admin/category-item", label: "Item Categories", icon: <FaTags /> },
      { to: "/admin/manufacture", label: "Manufacturer", icon: <FaIndustry /> },
      { to: "/admin/supplier", label: "Supplier", icon: <FaTruck /> },
      { to: "/admin/shelve-location", label: "Shelve Location", icon: <FaWarehouse /> },
      { to: "/admin/item-unit", label: "Item Unit", icon: <FaBalanceScale /> },
    ],
  },
  {
    label: "Security",
    icon: <FaUserShield />,
    children: [
      { to: "/admin/company", label: "Company", icon: <FaInfoCircle /> },
      { to: "/admin/users", label: "Users", icon: <FaUserCog /> },

      { to: "/admin/modules", label: "Modules", icon: <FaCubes /> },
      { to: "/admin/modules-functionalities", label: "Modules Functionalities", icon: <FaTasks /> },
      { to: "/admin/groups", label: "Group Management", icon: <FaUsers /> },
      { to: "/admin/access-rights", label: "Access Control", icon: <FaUserShield /> },
    ],
  },
  {
    label: "Accounts",
    icon: <FaUserShield />,
    children: [
      { to: "/admin/expense-head", label: "Expense Head", icon: <FaWallet /> },
      { to: "/admin/expense-voucher", label: "Expense Voucher", icon: <FaFileInvoiceDollar /> },
      { to: "/admin/day-book", label: "Day Book", icon: <FaBookOpen /> },
    ],
  },

];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <aside className="bg-white shadow min-h-screen w-16 sm:w-20 md:w-60 flex flex-col py-8 px-2 sm:px-4 justify-between transition-all">
      <div>
        {/* Logo + Title */}
        <div className="flex items-center justify-center sm:justify-start mb-12 space-x-2 sm:space-x-4">
          <div className="relative">
            <svg
              className="w-10 h-10 text-newPrimary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-newPrimary to-primaryDark bg-clip-text text-transparent">
            Infinity Byte.
          </h1>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = window.location.pathname === link.to;
            return link.children ? (
              <div key={link.label}>
                <button
                  onClick={() => toggleMenu(link.label)}
                  className={`w-full flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30 ${openMenu === link.label ? "bg-newPrimary/20" : ""}`}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                  {openMenu === link.label ? (
                    <FaChevronUp className="ml-auto w-4 h-4 hidden sm:block" />
                  ) : (
                    <FaChevronDown className="ml-auto w-4 h-4 hidden sm:block" />
                  )}
                </button>

                {openMenu === link.label && (
                  <div className="ml-2 sm:ml-4 mt-1 flex flex-col gap-1">
                    {link.children.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${isActive
                            ? "bg-newPrimary/80 text-white"
                            : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"}`
                        }
                      >
                        {sub.icon && <span className="text-lg">{sub.icon}</span>}
                        <span className="hidden sm:inline">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${isActive ? "bg-newPrimary/80 text-white" : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"}`
                }
                end={link.to === "/admin"}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded font-semibold text-gray-700 hover:bg-red-600 hover:text-white transition"
      >
        <RiLogoutBoxRLine />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </aside>

  );
};

export default AdminSidebar;
