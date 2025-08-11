import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ItemList from "./pages/admin/ItemList";
import CustomerData from "./pages/admin/CustomerData";
import FollowUp from "./pages/admin/FollowUp";
import ProductsPage from "./pages/admin/ProductsPage";
import AddProduct from "./pages/admin/AddProduct";
import { ToastContainer } from "react-toastify";
import Calendar from "./pages/admin/Calendar";
import "react-toastify/dist/ReactToastify.css";
import Promotion from "./pages/admin/Promotion";
import CategoryItem from "./pages/admin/CategoryItem";
import ProtectedRoute from "./components/ProtectedRoute";
import SupplierList from "./pages/admin/Supplier";
import Manufacture from "./pages/admin/Manufacture";

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
              // <ProtectedRoute >
                <AdminLayout />
              //  </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="item-details" element={<ItemList />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomerData />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="category-item" element={<CategoryItem />} />
            <Route path="supplier" element={<SupplierList />} />
            <Route path="manufacture" element={<Manufacture />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="promotion" element={<Promotion />} />
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