import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ItemList from "./pages/admin/ItemList.jsx";
import CustomerData from "./pages/admin/CustomerData";
import { ToastContainer } from "react-toastify";
import ShelveLocation from "./pages/admin/ShelveLocation";
import "react-toastify/dist/ReactToastify.css";
import CategoryItem from "./pages/admin/CategoryItem";
// import ProtectedRoute from "./components/ProtectedRoute";
import SupplierList from "./pages/admin/Supplier";
import Manufacture from "./pages/admin/Manufacture";
import ItemBarcode from "./pages/admin/ItemBarcode";
import ItemPurchase from "./pages/admin/ItemPurchase";
import  SalesInvoice from './pages/admin/SalesInvoice';
import ExpiryTags from "./pages/admin/ExpiryTags";
import BookingOrder from "./pages/admin/BookingOrder";
import ItemUnit from './pages/admin/ItemUnit';
import Company from "./pages/admin/Company";
import Users from "./pages/admin/Users";
import GroupManagement from "./pages/admin/GroupManagement";
import AccessRights from "./pages/admin/AccessControl";
import Modules from "./pages/admin/Modules";
import ModulesFunctionalities from "./pages/admin/ModulesFunctionalities.jsx";
import ExpenseHead from "./pages/admin/ExpenseHead.jsx";
import ExpenseVoucher from "./pages/admin/ExpenseVoucher.jsx";
import DayBook from "./pages/admin/DayBook.jsx";
function AppContent() {
  return (
    <div className="max-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              // <ProtectedRoute>
              <AdminLayout />
              // </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="item-details" element={<ItemList />} />
            <Route path="customers" element={<CustomerData />} />
            <Route path="shelve-location" element={<ShelveLocation />} />
            <Route path="category-item" element={<CategoryItem />} />
            <Route path="supplier" element={<SupplierList />} />
            <Route path="manufacture" element={<Manufacture />} />
            <Route path="item-barcode" element={<ItemBarcode />} />
            <Route path="sales-invoice" element={<SalesInvoice />} />
            <Route path="item-purchase" element={<ItemPurchase />} />
            <Route path="expiry-tags" element={<ExpiryTags />} />
             <Route path="item-unit" element={<ItemUnit />} />
            <Route path="customers-booking" element={<BookingOrder />} />
            <Route path="company" element={<Company />} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<GroupManagement />} />
            <Route path="access-rights" element={<AccessRights />} />
            <Route path="modules" element={<Modules />} />
            <Route path="modules-functionalities" element={<ModulesFunctionalities />} />
            <Route path="expense-head" element={<ExpenseHead />} />
            <Route path="expense-voucher" element={<ExpenseVoucher />} />
            <Route path="day-book" element={<DayBook />} />
          </Route>
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
