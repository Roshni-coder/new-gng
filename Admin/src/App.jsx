import React, { useState, createContext } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Slide } from '@mui/material';


// Pages & Components
import Header from './Components/Header/Header.jsx';
import SideBar from './Components/Sidebar/SideBar.jsx';
import DashBoard from './Pages/DashBoard/DashBoard.jsx';
import ProductList from './Pages/Product Pages/ProductList.jsx';
import OrdersList from './Pages/Orders Pages/OrdersList.jsx';
import CategoryList from './Pages/Category/CategoryList.jsx';
import SubCategoryList from './Pages/Category/SubCategoryList.jsx';
import UsersList from './Pages/Users Page/UsersList.jsx';
import Login from './Pages/Login/Login.jsx';
import ProtectedRoute from './Pages/ProtectedRoute.jsx';
import SellersList from './Pages/sellers/sellers.jsx';
// import MonthlyOrdersReport from './Pages/Reports/MonthlyOrdersReport.jsx';
import AdminReport from './Pages/Reports/AdminReport.jsx';
import CustomerReviews from './Pages/Users Page/CustomerReviews.jsx';
import UserActivity from './Pages/Users Page/UserActivity.jsx';
import Finance from './Pages/Finance/Finance.jsx';
import Inventory from './Pages/Inventory/Inventory.jsx';
import Marketing from './Pages/Marketing/Marketing.jsx';
import Analytics from './Pages/Analytics/Analytics.jsx';
import GiftOptions from './Pages/GiftOptions/GiftOptions.jsx';
import ShippingManagement from './Pages/Shipping/ShippingManagement.jsx';
import Support from './Pages/Support/Support.jsx';
import Notifications from './Pages/Notifications/Notifications.jsx';
import Settings from './Pages/Settings/Settings.jsx';
import SiteConfiguration from './Pages/Settings/SiteConfiguration.jsx';
import PaymentGateway from './Pages/Settings/PaymentGateway.jsx';
import EmailSettings from './Pages/Settings/EmailSettings.jsx';
import SmsSettings from './Pages/Settings/SmsSettings.jsx';
import TaxConfiguration from './Pages/Settings/TaxConfiguration.jsx';
import ApiManagement from './Pages/Settings/ApiManagement.jsx';
import UserPermissions from './Pages/Settings/UserPermissions.jsx';
import SecuritySettings from './Pages/Settings/SecuritySettings.jsx';
import GdprCompliance from './Pages/Settings/GdprCompliance.jsx';
import DataBackup from './Pages/Settings/DataBackup.jsx';
import PersonalizationTools from './Pages/Settings/PersonalizationTools.jsx';
import MessageTemplates from './Pages/Settings/MessageTemplates.jsx';
import CustomizationSettings from './Pages/Settings/CustomizationSettings.jsx';
import GreetingCards from './Pages/Settings/GreetingCards.jsx';
import RevenueAnalytics from './Pages/Reports/RevenueAnalytics.jsx';
import VendorPerformance from './Pages/Reports/VendorPerformance.jsx';
import ProductAnalytics from './Pages/Reports/ProductAnalytics.jsx';
import CustomerInsights from './Pages/Reports/CustomerInsights.jsx';
import TrafficReports from './Pages/Reports/TrafficReports.jsx';
import ExportData from './Pages/Reports/ExportData.jsx';
import CustomReports from './Pages/Reports/CustomReports.jsx';


// import BulkImport from './Pages/Product Pages/BulkImport.jsx';
// import ProductAttributes from './Pages/Product Pages/ProductAttributes.jsx';

export const MyContext = createContext();

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Layout wrapper
function Layout({ children }) {
  return (
    <section className="main h-screen w-full flex">
      {/* Sidebar - Full Height on Desktop, Hidden wrapper on Mobile (content fixed) */}
      <aside className="h-full shrink-0 md:w-[280px] w-0">
        <SideBar />
      </aside>

      {/* Main Content Area - Header + Children */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header />
        <main className="flex-1 w-full bg-gray-50 overflow-y-auto px-5 relative">
          <ToastContainer position="top-start" />
          {children}
        </main>
      </div>
    </section>
  );
}

function App() {
  const [isOpenAddProductPanel, setIsOpenAddProductPanel] = useState({
    open: false,
    model: ''
  });

  const values = {
    isOpenAddProductPanel,
    setIsOpenAddProductPanel
  };

  const router = createBrowserRouter([
    { path: '/', element: <ProtectedRoute><Layout><DashBoard /></Layout></ProtectedRoute> },
    { path: '/login', element: <Login /> },
    // { path: '/products', element: <ProtectedRoute><Layout><ProductList /></Layout></ProtectedRoute> },
    { path: '/orders', element: <ProtectedRoute><Layout><OrdersList /></Layout></ProtectedRoute> },
    { path: '/categorylist', element: <ProtectedRoute><Layout><CategoryList /></Layout></ProtectedRoute> },
    { path: '/subcategorylist', element: <ProtectedRoute><Layout><SubCategoryList /></Layout></ProtectedRoute> },
    { path: '/users', element: <ProtectedRoute><Layout><UsersList /></Layout></ProtectedRoute> },
    { path: '/sellers', element: <ProtectedRoute><Layout><SellersList /></Layout></ProtectedRoute> },
    { path: '/report', element: <ProtectedRoute><Layout><AdminReport /></Layout></ProtectedRoute> },
    { path: '/products', element: <ProtectedRoute><Layout><ProductList type="all" /></Layout></ProtectedRoute> },
    { path: '/products/pending', element: <ProtectedRoute><Layout><ProductList type="pending" /></Layout></ProtectedRoute> },
    { path: '/products/featured', element: <ProtectedRoute><Layout><ProductList type="featured" /></Layout></ProtectedRoute> },

    { path: '/products/out-of-stock', element: <ProtectedRoute><Layout><ProductList type="out-of-stock" /></Layout></ProtectedRoute> },
    // --- UPDATED USER ROUTES ---
    { path: '/users', element: <ProtectedRoute><Layout><UsersList type="all" /></Layout></ProtectedRoute> },
    { path: '/users/blocked', element: <ProtectedRoute><Layout><UsersList type="blocked" /></Layout></ProtectedRoute> },
    { path: '/users/activity', element: <ProtectedRoute><Layout><UserActivity /></Layout></ProtectedRoute> },
    { path: '/reviews', element: <ProtectedRoute><Layout><CustomerReviews /></Layout></ProtectedRoute> },
    { path: '/finance', element: <ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute> },
    { path: '/inventory', element: <ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute> },
    { path: '/marketing', element: <ProtectedRoute><Layout><Marketing /></Layout></ProtectedRoute> },
    { path: '/analytics', element: <ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute> },
    { path: '/gift-options', element: <ProtectedRoute><Layout><GiftOptions /></Layout></ProtectedRoute> },
    { path: '/shipping-management', element: <ProtectedRoute><Layout><ShippingManagement /></Layout></ProtectedRoute> },
    { path: '/support', element: <ProtectedRoute><Layout><Support /></Layout></ProtectedRoute> },
    { path: '/notifications', element: <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute> },
    { path: '/settings', element: <ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute> },
    { path: '/settings/site-configuration', element: <ProtectedRoute><Layout><SiteConfiguration /></Layout></ProtectedRoute> },
    { path: '/settings/payment-gateway', element: <ProtectedRoute><Layout><PaymentGateway /></Layout></ProtectedRoute> },
    { path: '/settings/email-settings', element: <ProtectedRoute><Layout><EmailSettings /></Layout></ProtectedRoute> },
    { path: '/settings/sms-settings', element: <ProtectedRoute><Layout><SmsSettings /></Layout></ProtectedRoute> },
    { path: '/settings/tax-configuration', element: <ProtectedRoute><Layout><TaxConfiguration /></Layout></ProtectedRoute> },
    { path: '/settings/api-management', element: <ProtectedRoute><Layout><ApiManagement /></Layout></ProtectedRoute> },
    { path: '/settings/user-permissions', element: <ProtectedRoute><Layout><UserPermissions /></Layout></ProtectedRoute> },
    { path: '/settings/security', element: <ProtectedRoute><Layout><SecuritySettings /></Layout></ProtectedRoute> },
    { path: '/settings/gdpr', element: <ProtectedRoute><Layout><GdprCompliance /></Layout></ProtectedRoute> },
    { path: '/settings/backup', element: <ProtectedRoute><Layout><DataBackup /></Layout></ProtectedRoute> },
    { path: '/settings/personalization', element: <ProtectedRoute><Layout><PersonalizationTools /></Layout></ProtectedRoute> },
    { path: '/settings/message-templates', element: <ProtectedRoute><Layout><MessageTemplates /></Layout></ProtectedRoute> },
    { path: '/settings/customization', element: <ProtectedRoute><Layout><CustomizationSettings /></Layout></ProtectedRoute> },
    { path: '/settings/greeting-cards', element: <ProtectedRoute><Layout><GreetingCards /></Layout></ProtectedRoute> },
    { path: '/reports/revenue', element: <ProtectedRoute><Layout><RevenueAnalytics /></Layout></ProtectedRoute> },
    { path: '/reports/vendor-performance', element: <ProtectedRoute><Layout><VendorPerformance /></Layout></ProtectedRoute> },
    { path: '/reports/product-analytics', element: <ProtectedRoute><Layout><ProductAnalytics /></Layout></ProtectedRoute> },
    { path: '/reports/customer-insights', element: <ProtectedRoute><Layout><CustomerInsights /></Layout></ProtectedRoute> },
    { path: '/reports/traffic', element: <ProtectedRoute><Layout><TrafficReports /></Layout></ProtectedRoute> },
    { path: '/reports/export', element: <ProtectedRoute><Layout><ExportData /></Layout></ProtectedRoute> },
    { path: '/reports/custom', element: <ProtectedRoute><Layout><CustomReports /></Layout></ProtectedRoute> },


  ]);

  return (
    <MyContext.Provider value={values}>
      <RouterProvider router={router} />
    </MyContext.Provider>
  );
}

export default App;