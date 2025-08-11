import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SupplierList = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [productsSupplied, setProductsSupplied] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Slider animation
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

  // Static Data for Suppliers
  const suppliers = [
    {
      _id: "1",
      supplierName: "ABC Traders",
      contactPerson: "John Doe",
      email: "john@abctraders.com",
      address: "123 Commerce St, New York, USA",
      productsSupplied: "Smartphones, TVs",
      paymentTerms: "Net 30",
      status: true,
    },
    {
      _id: "2",
      supplierName: "HomeDeco",
      contactPerson: "Emma Smith",
      email: "emma@homedeco.com",
      address: "456 Decor Ave, London, UK",
      productsSupplied: "Furniture, Home Decor",
      paymentTerms: "Net 60",
      status: true,
    },
    {
      _id: "3",
      supplierName: "KitchenPro",
      contactPerson: "Li Wei",
      email: "wei@kitchenpro.com",
      address: "789 Kitchen Rd, Shanghai, China",
      productsSupplied: "Microwaves, Ovens",
      paymentTerms: "COD",
      status: false,
    },
    {
      _id: "4",
      supplierName: "Fashion Hub",
      contactPerson: "Sarah Johnson",
      email: "sarah@fashionhub.com",
      address: "101 Style Blvd, Paris, France",
      productsSupplied: "Clothing, Accessories",
      paymentTerms: "Net 30",
      status: true,
    },
    {
      _id: "5",
      supplierName: "PaperHouse",
      contactPerson: "Michael Brown",
      email: "michael@paperhouse.com",
      address: "202 Stationery Ln, Sydney, Australia",
      productsSupplied: "Notebooks, Pens",
      paymentTerms: "Net 45",
      status: false,
    },
  ];

  // Initialize supplier list with static data
  useEffect(() => {
    setSupplierList(suppliers);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Handlers
  const handleAddSupplier = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setSupplierName("");
    setContactPerson("");
    setEmail("");
    setAddress("");
    setProductsSupplied("");
    setPaymentTerms("");
    setStatus(true);
  };

  // Save or Update Supplier
  const handleSave = async () => {
    const formData = {
      supplierName,
      contactPerson,
      email,
      address,
      productsSupplied,
      paymentTerms,
      status,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Simulate API update
        setSupplierList(
          supplierList.map((s) =>
            s._id === editId ? { ...s, ...formData } : s
          )
        );
        toast.success("✅ Supplier updated successfully");
      } else {
        // Simulate API create
        const newSupplier = {
          ...formData,
          _id: String(supplierList.length + 1),
        };
        setSupplierList([...supplierList, newSupplier]);
        toast.success("✅ Supplier added successfully");
      }

      // Reset form
      setSupplierName("");
      setContactPerson("");
      setEmail("");
      setAddress("");
      setProductsSupplied("");
      setPaymentTerms("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} supplier failed`);
    }
  };

  // Edit Supplier
  const handleEdit = (supplier) => {
    setIsEdit(true);
    setEditId(supplier._id);
    setSupplierName(supplier.supplierName);
    setContactPerson(supplier.contactPerson);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setProductsSupplied(supplier.productsSupplied);
    setPaymentTerms(supplier.paymentTerms);
    setStatus(supplier.status);
    setIsSliderOpen(true);
  };

  // Delete Supplier
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
            setSupplierList(supplierList.filter((s) => s._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Supplier deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete supplier.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Supplier is safe 🙂",
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
          <PuffLoader height="150" width="150" radius={1} color="#00809D" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Suppliers List</h1>
          <p className="text-gray-500 text-sm">Manage your supplier details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddSupplier}
        >
          + Add Supplier
        </button>
      </div>

      {/* Supplier Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-9 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Supplier ID</div>
              <div>Supplier Name</div>
              <div>Contact Person</div>
              <div>Email</div>
              <div>Address</div>
              <div>Products Supplied</div>
              <div>Payment Terms</div>
              <div>Status</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Suppliers in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {supplierList.map((supplier) => (
                <div
                  key={supplier._id}
                  className="grid grid-cols-9 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Supplier ID */}
                  <div className="text-sm font-medium text-gray-900">
                    {supplier._id}
                  </div>

                  {/* Supplier Name */}
                  <div className="text-sm text-gray-500">
                    {supplier.supplierName}
                  </div>

                  {/* Contact Person */}
                  <div className="text-sm text-gray-500">
                    {supplier.contactPerson}
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-500">{supplier.email}</div>

                  {/* Address */}
                  <div className="text-sm text-gray-500">{supplier.address}</div>

                  {/* Products Supplied */}
                  <div className="text-sm text-gray-500">
                    {supplier.productsSupplied}
                  </div>

                  {/* Payment Terms */}
                  <div className="text-sm text-gray-500">
                    {supplier.paymentTerms}
                  </div>

                  {/* Status */}
                  <div className="text-sm font-semibold">
                    {supplier.status ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="flex justify-end">
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 text-xl">
                          ⋯
                        </button>
                        <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supplier._id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div
            ref={sliderRef}
            className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Supplier" : "Add a New Supplier"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setSupplierName("");
                  setContactPerson("");
                  setEmail("");
                  setAddress("");
                  setProductsSupplied("");
                  setPaymentTerms("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Supplier Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Supplier Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={supplierName}
                  required
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Contact Person <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  required
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Email Address <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Address <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Products Supplied */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Products Supplied <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={productsSupplied}
                  required
                  onChange={(e) => setProductsSupplied(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Payment Terms <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={paymentTerms}
                  required
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Payment Terms</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                  <option value="Net 45">Net 45</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    status ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      status ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{status ? "Active" : "Inactive"}</span>
              </div>

              {/* Save Button */}
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;