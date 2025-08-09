import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products List" },
  { to: "/admin/staff", label: "Staff List" },
  { to: "/admin/customers", label: "Customer Data" },
  { to: "/admin/promotion", label: "Meeting Details" },
  { to: "/admin/followup", label: "Follow Up" },
   { to: "/admin/calendar", label: "Calendar" },  
  { to: "/admin/report", label: "Report" },
  { to: "/admin/settings", label: "Settings" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage or token
    localStorage.removeItem("user");
    // Redirect to login
    navigate("/");
  };

  return (
    <aside className="bg-white shadow h-screen w-56 flex flex-col py-8 px-4 justify-between">
      <div>
        <div className="flex items-center justify-center mb-12 space-x-4">
  {/* Icon with status indicator */}
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

  {/* Text Content */}
  <div>
    <h1 className="text-2xl font-bold bg-gradient-to-r from-newPrimary to-primaryDark bg-clip-text text-transparent">
      Call Logs Dashboard
    </h1>
    {/* <p className="text-gray-500 font-medium mt-1">
      Track and manage all customer interactions
    </p> */}
  </div>
</div>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-secondary text-white"
                    : "text-gray-700 hover:bg-secondary/30"
                }`
              }
              end={link.to === "/admin"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="hover:bg-red-600 flex   items-start pl-4 text-gray-700 hover:text-white font-semibold py-2 rounded transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;