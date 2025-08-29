import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios';
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaCog } from 'react-icons/fa';

// Static data for expense heads (for the Head dropdown)
const staticExpenseHeadData = [
  { _id: "eh1", head: "Office Rent" },
  { _id: "eh2", head: "Utilities" },
  { _id: "eh3", head: "Staff Salaries" },
];

// Static data for expense vouchers
const staticExpenseVoucherData = [
  { _id: "ev1", date: "2025-08-01", head: "Office Rent", details: "Rent for August", amount: 5000 },
  { _id: "ev2", date: "2025-08-15", head: "Utilities", details: "Electricity bill", amount: 1200 },
  { _id: "ev3", date: "2025-08-25", head: "Staff Salaries", details: "Monthly payroll", amount: 15000 },
];

const ExpenseVoucher = () => {
  const [expenseVoucherList, setExpenseVoucherList] = useState(staticExpenseVoucherData);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [date, setDate] = useState("");
  const [head, setHead] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  const handleAddExpenseVoucher = () => {
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log("Admin", userInfo?.isAdmin);

  // Fetch Expense Voucher Data
  const fetchExpenseVoucherData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expense-vouchers`);
      const result = await response.json();
      console.log("Expense Vouchers ", result);
      setExpenseVoucherList(result.length > 0 ? result : staticExpenseVoucherData);
    } catch (error) {
      console.error("Error fetching expense voucher data:", error);
      setExpenseVoucherList(staticExpenseVoucherData);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchExpenseVoucherData();
  }, [fetchExpenseVoucherData]);

  console.log("Expense Voucher Data", expenseVoucherList);

  // Save Expense Voucher Data
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("head", head);
    formData.append("details", details);
    formData.append("amount", amount);

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/expense-vouchers/${editId}`,
          formData,
          { headers }
        );
        toast.success("✅ Expense voucher updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/expense-vouchers`,
          formData,
          { headers }
        );
        toast.success("✅ Expense voucher added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setDate("");
      setHead("");
      setDetails("");
      setAmount("");

      // Refresh list
      fetchExpenseVoucherData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} expense voucher failed`);
    }
  };

  // Edit Expense Voucher
  const handleEdit = (voucher) => {
    setIsEdit(true);
    setEditId(voucher._id);
    setDate(voucher.date || "");
    setHead(voucher.head || "");
    setDetails(voucher.details || "");
    setAmount(voucher.amount || "");
    setIsSliderOpen(true);
    console.log("Editing Expense Voucher Data", voucher);
  };

  // Delete Expense Voucher
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = userInfo?.token;
            if (!token) {
              toast.error("Authorization token missing!");
              return;
            }

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/expense-vouchers/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setExpenseVoucherList(expenseVoucherList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Expense voucher deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete expense voucher.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Expense voucher is safe 🙂",
            "error"
          );
        }
      });
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PuffLoader
            height="150"
            width="150"
            radius={1}
            color="#00809D"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Expense Voucher List</h1>
          <p className="text-gray-500 text-sm">Expense Voucher Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddExpenseVoucher}
        >
          + Add Expense Voucher
        </button>
      </div>

      {/* Expense Voucher Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-5 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Date</div>
              <div>Head</div>
              <div>Details</div>
              <div>Amount</div>
              {userInfo?.isAdmin && (
                <div className="text-right flex items-center justify-end gap-1">
                  <FaCog className="text-gray-500" />
                  <span>Actions</span>
                </div>
              )}
            </div>

            {/* Expense Voucher Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {expenseVoucherList.map((voucher, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Date */}
                  <div className="text-sm font-medium text-gray-900">
                    {voucher.date}
                  </div>

                  {/* Head */}
                  <div className="text-sm font-semibold text-green-600">
                    {voucher.head}
                  </div>

                  {/* Details */}
                  <div className="text-sm text-gray-500">
                    {voucher.details}
                  </div>

                  {/* Amount */}
                  <div className="text-sm text-gray-500">
                    ${voucher.amount.toLocaleString()}
                  </div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                        transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(voucher)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(voucher._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Expense Voucher" : "Add Expense Voucher"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Expense Voucher Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Head</label>
                    <select
                      value={head}
                      onChange={(e) => setHead(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Head</option>
                      {staticExpenseHeadData.map((headItem) => (
                        <option key={headItem._id} value={headItem.head}>
                          {headItem.head}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Details</label>
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter details"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Expense Voucher" : "Save Expense Voucher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseVoucher;