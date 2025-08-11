import React, { useState } from "react";
import { FaChevronDown,FaChevronUp  } from "react-icons/fa";


import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  {
    label: "Item Setup",
    children: [
      { to: "/admin/category-item", label: "Item Categories" },
      { to: "/admin/manufacture", label: "Manufacture" },
      { to: "/admin/supplier", label: "Supplier" },
      { to: "/admin/calendar", label: "Shelve Location" },
    ],
  },
  { to: "/admin/item-details", label: "Item Details" },
  { to: "/admin/customers", label: "Customer Data" },
  { to: "/admin/report", label: "Report" },
  { to: "/admin/settings", label: "Settings" },
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
    <aside className="bg-white shadow h-screen w-68 flex flex-col py-8 px-4 justify-between">
      <div>
        {/* Logo + Title */}
        <div className="flex items-center justify-center mb-12 space-x-4">
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
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-newPrimary to-primaryDark bg-clip-text text-transparent">
              Point of Sales
            </h1>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            if (link.children) {
              return (
                <div key={link.label}>
                  <button
                    onClick={() => toggleMenu(link.label)}
                    className={`w-full flex justify-between items-center px-4 py-2 rounded-lg font-medium transition ${openMenu === link.label
                        ? "hover:bg-newPrimary/80 hover:text-white"
                        : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                      }`}
                  >
                    {link.label}
                    {openMenu === link.label ? (
                      <FaChevronUp  className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {openMenu === link.label && (
                    <div className="ml-4 mt-1 flex flex-col gap-1">
                      {link.children.map((sub) => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg font-medium transition ${isActive
                              ? "bg-newPrimary/80 text-white"
                              : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-medium transition ${isActive
                      ? "bg-newPrimary/80 text-white"
                      : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                    }`
                  }
                  end={link.to === "/admin"}
                >
                  {link.label}
                </NavLink>
              );
            }
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="hover:bg-red-600 flex items-start pl-4 text-gray-700 hover:text-white font-semibold py-2 rounded transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
