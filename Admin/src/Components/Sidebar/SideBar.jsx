import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaAngleDown, FaAngleRight } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { LuUsers, LuUserCheck } from "react-icons/lu";
import { RiProductHuntLine } from "react-icons/ri";
import { SiHackthebox } from "react-icons/si";
import { CiLogout } from "react-icons/ci";
// ✅ IMPORT THE MISSING ICONS HERE
import { MdInventory, MdCampaign, MdAnalytics } from "react-icons/md";
// import { MyContext } from "../../App.jsx"; // Assuming MyContext is not strictly needed for this file's logic
import { MdOutlinePayments } from "react-icons/md";
function SideBar() {
  // const { setIsOpenAddProductPanel } = useContext(MyContext); // Removed for simplicity
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("stoken");
    navigate("/login");
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleSubmenuToggle = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  // --- Configuration for Menu Items with Submenus ---
  const navLinks = [
    {
      title: "Dashboard",
      path: "/",
      icon: <RxDashboard />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      // ... other styles
    },
    {
      title: "Products",
      icon: <RiProductHuntLine />,
      color: "text-violet-600",
      bg: "bg-violet-50",
      isDropdown: true,
      submenu: [
        { title: "All Products", path: "/products" },
        { title: "Product Categories", path: "/categorylist" },
        { title: "Sub Categories", path: "/subcategorylist" },
        { title: "Pending Approvals", path: "/products/pending" },
        { title: "Out of Stock", path: "/products/out-of-stock" },
      ],
    },
    {
      title: "Orders",
      icon: <SiHackthebox />,
      color: "text-rose-600",
      bg: "bg-rose-50",
      isDropdown: true,
      submenu: [
        { title: "All Orders", path: "/orders" },
        { title: "Pending", path: "/orders?status=Pending" },
        { title: "Processing", path: "/orders?status=Processing" },
        { title: "Shipped", path: "/orders?status=Shipped" },
        { title: "Delivered", path: "/orders?status=Delivered" },
        { title: "Cancelled", path: "/orders?status=Cancelled" },
      ],
    },
    {
      title: "Sellers",
      path: "/sellers",
      icon: <LuUserCheck />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      // ... other styles
    },
    // --- UPDATED 'Users' SECTION FOR CUSTOMER MANAGEMENT ---
    {
      title: "Customers/Users",
      icon: <LuUsers />,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      isDropdown: true, // Make Users a dropdown
      submenu: [
        { title: "All Registered Users", path: "/users" }, // Main users list (for block/unblock actions)
        { title: "Blocked Users List", path: "/users/blocked" }, // Specific list for blocked users
        { title: "Customer Reviews", path: "/reviews" }
      ],
    },

    {
  title: "Payments & Finance",
  path: "/finance",
  icon: <MdOutlinePayments />,
  color: "text-green-600",
  bg: "bg-green-50",
  border: "border-green-500",
},
{
  title: "Inventory",
  path: "/inventory",
  icon: <MdInventory />,
  color: "text-yellow-600",
  bg: "bg-yellow-50",
  border: "border-yellow-500",
},
// {
//   title: "Marketing",
//   path: "/marketing",
//   icon: <MdCampaign />,
//   color: "text-pink-600",
//   bg: "bg-pink-50",
//   border: "border-pink-500",
// },
{
  title: "Analytics",
  path: "/analytics",
  icon: <MdAnalytics />,
  color: "text-indigo-600",
  bg: "bg-indigo-50",
  border: "border-indigo-500",
},
  ];
  // --------------------------------------------------------

  // Auto-expand menu based on current URL
  useEffect(() => {
    const activeIndex = navLinks.findIndex((item) => {
      if (item.path === location.pathname) return true;
      if (item.submenu) {
        return item.submenu.some(
          (sub) =>
            location.pathname + location.search === sub.path ||
            location.pathname === sub.path
        );
      }
      return false;
    });

    if (activeIndex !== -1) {
      setExpandedMenu(activeIndex);
    }
  }, [location.pathname, location.search]);

  // --- Rendering Logic (Omitted for brevity, but use the provided logic) ---
  return (
    <>
      {/* ... Toggle Button ... */}
      <button
        onClick={toggleSidebar}
        className="fixed z-[1050] top-5 left-5 w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 hover:scale-105 transition-all"
        aria-label="Open menu"
      >
        <FaBars size={20} />
      </button>

      {/* ... Overlay Backdrop ... */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1040] transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
      ></div>

      {/* --- Modern Sidebar --- */}
      <div
        className={`
          fixed top-0 left-0 w-[80vw] sm:w-[280px] h-full bg-white z-[1051]
          shadow-2xl shadow-gray-400/50 transform transition-transform duration-300 ease-out
          flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Area */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-400">Management Dashboard</p>
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((item, index) => {
            const isActive =
              location.pathname === item.path ||
              (item.submenu &&
                item.submenu.some(
                  (sub) =>
                    location.pathname + location.search === sub.path ||
                    location.pathname === sub.path
                ));
            const isMenuOpen = expandedMenu === index;

            return (
              <div key={index} className="flex flex-col">
                {/* Main Menu Item */}
                <div
                  onClick={() =>
                    item.isDropdown
                      ? handleSubmenuToggle(index)
                      : (navigate(item.path), closeSidebar())
                  }
                  className={`
                    relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer group select-none
                    ${
                      isActive
                        ? `${item.bg} ${item.color}`
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Active Indicator Strip (Only for non-dropdowns) */}
                    {isActive && !item.isDropdown && (
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md ${item.color.replace(
                          "text",
                          "bg"
                        )}`}
                      ></div>
                    )}

                    {/* Icon */}
                    <span
                      className={`text-xl ${
                        isActive
                          ? item.color
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {/* Title */}
                    <span
                      className={`text-[15px] tracking-wide ${
                        isActive ? "font-bold" : "font-medium"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Dropdown Arrow */}
                  {item.isDropdown && (
                    <span
                      className={`text-xs transition-transform duration-300 ${
                        isMenuOpen ? "rotate-90" : ""
                      }`}
                    >
                      <FaAngleRight />
                    </span>
                  )}
                </div>

                {/* Submenu Items */}
                {item.isDropdown && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1 pl-12 pr-2 border-l-2 border-gray-100 ml-6 my-1">
                      {item.submenu.map((subItem, subIndex) => {
                        const isSubActive =
                          location.pathname + location.search === subItem.path || 
                          location.pathname === subItem.path;
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            onClick={closeSidebar}
                            className={`
                                flex items-center gap-2 py-2 px-2 rounded-lg text-[13px] font-medium transition-colors
                                ${
                                  isSubActive
                                    ? "bg-gray-100 text-gray-900 font-semibold"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                }
                              `}
                          >
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer / Logout Area */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
          >
            <CiLogout className="text-xl group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideBar;