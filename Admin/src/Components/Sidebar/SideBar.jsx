import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaAngleDown, FaAngleRight, FaGift, FaShippingFast, FaBullhorn, FaCog, FaRegFileAlt } from "react-icons/fa";

import { RxDashboard } from "react-icons/rx";
import { LuUsers, LuUserCheck } from "react-icons/lu";
import { RiProductHuntLine, RiCustomerService2Line } from "react-icons/ri";
import { SiHackthebox } from "react-icons/si";
import { CiLogout } from "react-icons/ci";
import { MdInventory, MdCampaign, MdAnalytics, MdOutlinePayments, MdCategory, MdNotifications, MdSettings, MdSecurity } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";

function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("atoken"); // Clear Admin Token
    localStorage.removeItem("stoken"); // Clear Seller Token just in case
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
      isDropdown: false
    },
    {
      title: "Products & Inventory",
      icon: <RiProductHuntLine />,
      color: "text-violet-600",
      bg: "bg-violet-50",
      isDropdown: true,
      submenu: [
        { title: "All Products", path: "/products" },
        { title: "Product Categories", path: "/categorylist" },
        { title: "Pending Approvals", path: "/products/pending" },
        { title: "Featured Products", path: "/products/featured" },
        { title: "Out of Stock", path: "/products/out-of-stock" },

        { type: "header", title: "INVENTORY HUB" },
        { title: "Stock Overview", path: "/inventory" },
        { title: "Low Stock Alerts", path: "/inventory?tab=0" },
        { title: "Warehouse Management", path: "/inventory?tab=1" },
        { title: "Bulk Stock Update", path: "/inventory?tab=0" },

        { type: "header", title: "GIFT OPTIONS" },
        { title: "Gift Wrapping Options", path: "/gift-options?tab=0" },
        { title: "Greeting Cards Library", path: "/gift-options?tab=1" },
        { title: "Gift Messages", path: "/gift-options?tab=2" },
        { title: "Special Packaging", path: "/gift-options?tab=3" },
        { title: "Corporate Gifting", path: "/gift-options?tab=4" },
        { title: "Bulk Gift Orders", path: "/gift-options?tab=5" },
      ],
    },
    {
      title: "Orders & Fulfillment",
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

        { type: "header", title: "FULFILLMENT & LOGISTICS" },
        { title: "Shipping Methods", path: "/shipping-management?tab=0" },
        { title: "Delivery Partners", path: "/shipping-management?tab=0" },
        { title: "Shipping Zones", path: "/shipping-management?tab=1" },
        { title: "Rate Management", path: "/shipping-management?tab=1" },
        { title: "Tracking Settings", path: "/shipping-management?tab=2" },
        { title: "COD Settings", path: "/shipping-management?tab=3" },
        { title: "Bulk Shipping", path: "/shipping-management?tab=4" },
      ],
    },
    {
      title: "Payments & Finance",
      icon: <MdOutlinePayments />,
      color: "text-green-600",
      bg: "bg-green-50",
      isDropdown: true,
      submenu: [
        { title: "All Transactions", path: "/finance" },
      ]
    },
    {
      title: "Customers & Reviews",
      icon: <LuUsers />,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      isDropdown: true,
      submenu: [
        { title: "All Registered Users", path: "/users" },
        { title: "Blocked Users", path: "/users/blocked" },
        { title: "User Activity", path: "/users/activity" },

        { type: "header", title: "REVIEWS & RATINGS" },
        { title: "All Reviews", path: "/reviews?tab=0" },
        { title: "Pending Reviews", path: "/reviews?tab=1" },
        { title: "Reported Reviews", path: "/reviews?tab=2" },
        { title: "Product Ratings", path: "/reviews?tab=3" },
        { title: "Vendor Ratings", path: "/reviews?tab=4" },
        { title: "Review Moderation", path: "/reviews?tab=1" },
        { title: "Review Analytics", path: "/reviews?tab=5" },
      ],
    },
    {
      title: "Sellers & Commission",
      icon: <LuUserCheck />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      isDropdown: true,
      submenu: [
        { type: "header", title: "SELLERS & COMMISSION" },
        { title: "All Vendors", path: "/sellers?tab=0" },
        { title: "Pending Approvals", path: "/sellers?tab=1" },
        { title: "Active Vendors", path: "/sellers?tab=2" },
        { title: "Suspended Vendors", path: "/sellers?tab=3" },
        { title: "Vendor Performance", path: "/sellers?tab=4" },
        { title: "Commission Settings", path: "/sellers?tab=5" },
        { title: "Vendor Verification", path: "/sellers?tab=6" },
      ]
    },
    {
      title: "Catalog Management",
      icon: <MdCategory />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      isDropdown: true,
      submenu: [
        { type: "header", title: "ALL CATEGORIES" },
        { title: "All Categories", path: "/categorylist?tab=0" },
        { title: "Sub-categories", path: "/subcategorylist" },
        { title: "Category Attributes", path: "/categorylist?tab=1" },
        { title: "Category Commissions", path: "/categorylist?tab=2" },
        { title: "Category Images", path: "/categorylist?tab=3" },
        { title: "Bulk Management", path: "/categorylist?tab=4" },

        { type: "header", title: "MARKETING & PROMOTION" },
        { title: "All Campaigns", path: "/marketing?tab=0" },
        { title: "Coupons & Discounts", path: "/marketing?tab=1" },
        { title: "Flash Sales", path: "/marketing?tab=2" },
        { title: "Email Marketing", path: "/marketing?tab=3" },
        { title: "SMS Campaigns", path: "/marketing?tab=3" },
        { title: "Push Notifications", path: "/marketing?tab=3" },
        { title: "Affiliate Program", path: "/marketing?tab=4" },
      ]

    },
    {
      title: "Communication & Support",
      icon: <RiCustomerService2Line />,
      color: "text-teal-600",
      bg: "bg-teal-50",
      isDropdown: true,
      submenu: [
        { type: "header", title: "CUSTOMER MESSAGES" },
        { title: "Vendor Messages", path: "/support?tab=0" },
        { title: "Support Tickets", path: "/support?tab=1" },
        { title: "Chat System", path: "/support?tab=2" },
        { title: "Announcements", path: "/support?tab=3" },

        { type: "header", title: "HELP & SUPPORT" },
        { title: "Email Templates", path: "/support?tab=4" },
        { title: "SMS Templates", path: "/support?tab=5" },
        { title: "Help Documentation", path: "/support?tab=6" },
        { title: "System Status", path: "/support?tab=7" },
        { title: "Training Resources", path: "/support?tab=8" },
        { title: "Contact Vendors", path: "/support?tab=9" },
      ]
    },
    {
      title: "Notifications & Activity",
      icon: <MdNotifications />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      isDropdown: true,
      submenu: [
        { title: "All Notifications", path: "/notifications?tab=0" },
        { title: "Order Alerts", path: "/notifications?tab=1" },
        { title: "System Updates", path: "/notifications?tab=2" },
        { title: "Vendor Requests", path: "/notifications?tab=3" },
        { title: "Customer Complaints", path: "/notifications?tab=4" },
        { title: "Settings", path: "/notifications?tab=5" },
        { title: "Activity Logs", path: "/notifications?tab=6" },
      ]
    },
    {
      title: "Configuration & Settings",
      icon: <MdSettings />,
      color: "text-gray-600",
      bg: "bg-gray-50",
      isDropdown: true,
      submenu: [
        { type: "header", title: "GENERAL SETTINGS" },
        { title: "Site Configuration", path: "/settings/site-configuration" },
        { title: "Payment Gateway", path: "/settings/payment-gateway" },
        { title: "Email Settings", path: "/settings/email-settings" },
        { title: "SMS Settings", path: "/settings/sms-settings" },
        { title: "Tax Configuration", path: "/settings/tax-configuration" },
        { title: "API Management", path: "/settings/api-management" },

        { type: "header", title: "SECURITY & COMPLIANCE" },
        { title: "User Permissions", path: "/settings/user-permissions" },
        { title: "Role Management", path: "/settings/user-permissions" },
        { title: "Security Settings", path: "/settings/security" },
        { title: "Activity Logs", path: "/notifications?tab=6" },
        { title: "GDPR Compliance", path: "/settings/gdpr" },
        { title: "Data Backup", path: "/settings/backup" },

        { type: "header", title: "PERSONALIZATION" },
        { title: "Personalization Tools", path: "/settings/personalization" },
        { title: "Message Templates", path: "/settings/message-templates" },
        { title: "Customization Settings", path: "/settings/customization" },
        { title: "Greeting Cards", path: "/settings/greeting-cards" },
        { title: "Gift Wrapping Config", path: "/gift-options" },
      ]
    },
    {
      title: "Content & Pages",
      icon: <FaRegFileAlt />,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      isDropdown: true,
      submenu: [
      ]
    },
    {
      title: "Analytics & Reports",
      path: "/analytics",
      icon: <TbReportAnalytics />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      isDropdown: true,
      submenu: [
        { type: "header", title: "SALES REPORTS" },
        { title: "Revenue Analytics", path: "/reports/revenue" },
        { title: "Vendor Performance", path: "/reports/vendor-performance" },
        { title: "Product Analytics", path: "/reports/product-analytics" },
        { title: "Customer Insights", path: "/reports/customer-insights" },
        { title: "Traffic Reports", path: "/reports/traffic" },
        { title: "Export Data", path: "/reports/export" },
        { title: "Custom Reports", path: "/reports/custom" },
        { type: "header", title: "OVERVIEW" },
        { title: "Dashboard Analytics", path: "/analytics" },
        { title: "Monthly Report", path: "/report" },
      ]
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
            sub.path && (location.pathname + location.search === sub.path ||
              location.pathname === sub.path)
        );
      }
      return false;
    });

    if (activeIndex !== -1) {
      setExpandedMenu(activeIndex);
    }
  }, [location.pathname, location.search]);

  return (
    <>
      {/* ... Toggle Button (Mobile Only) ... */}
      <button
        onClick={toggleSidebar}
        className="fixed z-[1050] top-5 left-5 w-10 h-10 flex md:hidden items-center justify-center bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 hover:scale-105 transition-all"
        aria-label="Open menu"
      >
        <FaBars size={20} />
      </button>

      {/* ... Overlay Backdrop (Mobile Only) ... */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1040] transition-opacity duration-300 md:hidden ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={closeSidebar}
      ></div>

      {/* --- Sidebar Container --- */}
      <div
        className={`
          fixed md:relative top-0 left-0 w-[80vw] sm:w-[280px] h-full bg-white z-[1051] md:z-auto
          md:translate-x-0
          shadow-2xl md:shadow-none md:border-r border-gray-100
          transform transition-transform duration-300 ease-out
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
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {navLinks.map((item, index) => {
            const isActive =
              location.pathname === item.path ||
              (item.submenu &&
                item.submenu.some(
                  (sub) =>
                    sub.path && (location.pathname + location.search === sub.path ||
                      location.pathname === sub.path)
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
                    ${isActive
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
                      className={`text-xl ${isActive
                        ? item.color
                        : "text-gray-400 group-hover:text-gray-600"
                        }`}
                    >
                      {item.icon}
                    </span>

                    {/* Title */}
                    <span
                      className={`text-[15px] tracking-wide ${isActive ? "font-bold" : "font-medium"
                        }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Dropdown Arrow */}
                  {item.isDropdown && (
                    <span
                      className={`text-xs transition-transform duration-300 ${isMenuOpen ? "rotate-90" : ""
                        }`}
                    >
                      <FaAngleRight />
                    </span>
                  )}
                </div>

                {/* Submenu Items */}
                {item.isDropdown && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[800px] opacity-100 mt-1" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="flex flex-col gap-1 pl-4 pr-2 border-l-2 border-gray-100 ml-6 my-1">
                      {item.submenu.map((subItem, subIndex) => {
                        // HEADER RENDER LOGIC
                        if (subItem.type === "header") {
                          return (
                            <div key={subIndex} className="px-2 pt-4 pb-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              {subItem.title}
                            </div>
                          );
                        }

                        // LINK RENDER LOGIC
                        const isSubActive =
                          subItem.path &&
                          (location.pathname + location.search === subItem.path ||
                            location.pathname === subItem.path);
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path || "#"}
                            onClick={() => {
                              // Only close sidebar if on mobile
                              if (window.innerWidth < 768) closeSidebar();
                            }}
                            className={`
                                flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors
                                ${isSubActive
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