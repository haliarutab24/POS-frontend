import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";

// Static invoice data with expiry tags structure
const staticExpiryTags = [
  {
    _id: "1",
    receiptNo: "EXP-001",
    itemCode: "0130",
    itemName: "CHIK FRESH TIKKA TOPPING",
    price: 1020,
    manufacturer: "AM SONS",
    supplier: "AM SONS",
    category: "CHICKEN ITEMS",
    salePrice: 900,
    manufactureDate: "2025-08-11T00:00",
    expiryDate: "2025-08-11T00:00",
  },
  {
    _id: "2", // Fixed _idassa to _id
    receiptNo: "EXP-002",
    itemCode: "0131",
    itemName: "CHIK FRESH FAJITA TOPPING",
    price: 1150,
    manufacturer: "AM SONS",
    supplier: "AM SONS",
    category: "CHICKEN ITEMS",
    salePrice: 1000,
    manufactureDate: "2025-08-11T00:00",
    expiryDate: "2025-08-11T00:00",
  },
];

const ExpiryTags = () => {
  const [expiryTagList, setExpiryTagList] = useState(staticExpiryTags);
  const [loading, setLoading] = useState(true);
  const [receiptNo, setReceiptNo] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState(0);
  const [manufacturer, setManufacturer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const categoryOptions = ["CHICKEN ITEMS", "BURGER ITEMS", "OTHER"];

  // Reset form fields
  const resetForm = () => {
    setReceiptNo("");
    setItemCode("");
    setItemName("");
    setPrice(0);
    setManufacturer("");
    setSupplier("");
    setCategory("");
    setSalePrice(0);
    setManufactureDate("");
    setExpiryDate("");
  };

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

  // Close slider animation
  const handleCloseSlider = () => {
    if (sliderRef.current) {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.8,
        ease: "expo.in",
        onComplete: () => {
          setIsSliderOpen(false);
          setIsEdit(false);
          setEditId(null);
          resetForm();
        },
      });
    } else {
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      resetForm();
    }
  };

  // Safe token parsing
  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return {};
    }
  };

  // Fetch Expiry Tags
  const fetchExpiryTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/expirayTags`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();

      console.log("Expiry Tags API result:", result);

      // Unwrap array safely
      const list = Array.isArray(result) ? result : result.data || [];
      setExpiryTagList(list.length > 0 ? list : staticExpiryTags);
    } catch (error) {
      console.error("Error fetching expiry tag data:", error);
      setExpiryTagList(staticExpiryTags);
      toast.error("Failed to fetch expiry tags");
    } finally {
      setLoading(false); // Reset loading state
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchExpiryTags();
  }, [fetchExpiryTags]);

  // Format date for API
  const formatDateForApi = (date) => (date ? date.split("T")[0] : "");

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Validate form
  const validateForm = () => {
    if (!receiptNo) return "Receipt No. is required";
    if (!itemCode) return "Item Code is required";
    if (!itemName) return "Item Name is required";
    if (!price) return "Price is required";
    if (!manufacturer) return "Manufacturer is required";
    if (!supplier) return "Supplier is required";
    if (!category) return "Category is required";
    if (!salePrice) return "Sale Price is required";
    if (!manufactureDate) return "Manufacture Date is required";
    if (!expiryDate) return "Expiry Date is required";
    return null;
  };

  // Save Expiry Tag
  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(`❌ ${validationError}`);
      return;
    }

    try {
      const userInfo = getUserInfo();
      const token = userInfo?.token;

      if (!token) {
        toast.error("❌ Authorization token missing!");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const payload = {
        receiptNo,
        itemCode,
        itemName,
        price,
        manufacturer,
        supplier,
        category,
        salePrice,
        manufactureDate: formatDateForApi(manufactureDate),
        expiryDate: formatDateForApi(expiryDate),
      };

      if (isEdit && editId) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/expirayTags/${editId}`, payload, { headers });
        toast.success("✅ Expiry Tag updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/expirayTags`, payload, { headers });
        toast.success("✅ Expiry Tag added successfully");
      }

      resetForm();
      setIsEdit(false);
      setEditId(null);
      setIsSliderOpen(false);
      fetchExpiryTags();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} expiry tag failed`);
    }
  };

  // Delete Expiry Tag
  const handleDelete = async (id) => {
    try {
      const userInfo = getUserInfo();
      const token = userInfo?.token;
      if (!token) {
        toast.error("❌ Authorization token missing!");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      Swal.fire({
        title: "Are you sure?",
        text: "This will delete the expiry tag.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/expirayTags/${id}`, { headers });
          Swal.fire("Deleted!", "Expiry Tag removed.", "success");
          fetchExpiryTags();
        }
      });
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
      toast.error("❌ Failed to delete expiry tag");
    }
  };

  // Edit Expiry Tag
  const formatDateForInput = (date) =>
    date ? new Date(date).toISOString().slice(0, 16) : "";

  const handleEdit = (tag) => {
    setIsEdit(true);
    setEditId(tag._id);
    setReceiptNo(tag.receiptNo || "");
    setItemCode(tag.itemCode || "");
    setItemName(tag.itemName || "");
    setPrice(tag.price || 0);
    setManufacturer(tag.manufacturer || "");
    setSupplier(tag.supplier || "");
    setCategory(tag.category || "");
    setSalePrice(tag.salePrice || 0);
    setManufactureDate(formatDateForInput(tag.manufactureDate));
    setExpiryDate(formatDateForInput(tag.expiryDate));
    setIsSliderOpen(true);
  };

  // Print Expiry Tag
  const handlePrint = (tag) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Expiry Tag - ${tag.receiptNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h4 { text-align: center; margin: 0; }
            p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h2>Shop Name</h2>
          <h4>Expiry Tag</h4>
          <hr/>
          <p><strong>Receipt No:</strong> ${tag.receiptNo}</p>
          <p><strong>Item Code:</strong> ${tag.itemCode}</p>
          <p><strong>Item Name:</strong> ${tag.itemName}</p>
          <p><strong>Manufacturer:</strong> ${tag.manufacturer}</p>
          <p><strong>Supplier:</strong> ${tag.supplier}</p>
          <p><strong>Category:</strong> ${tag.category}</p>
          <p><strong>Sale Price:</strong> ${tag.salePrice}</p>
          <p><strong>Manufacture Date:</strong> ${formatDateForDisplay(tag.manufactureDate)}</p>
          <p><strong>Expiry Date:</strong> ${formatDateForDisplay(tag.expiryDate)}</p>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <PuffLoader height="150" width="150" radius={1} color="#00809D" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">Expiry Tags List</h1>
          <p className="text-gray-500 text-sm">Manage your expiry tags</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full sm:w-auto"
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
        >
          + Add Expiry Tag
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow p-4 sm:p-6 border border-gray-100">
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {expiryTagList.map((tag) => (
            <div key={tag._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Receipt No.</div>
                <div className="text-sm text-gray-900">{tag.receiptNo}</div>
                <div className="text-sm font-medium text-gray-500">Item Code</div>
                <div className="text-sm text-gray-900">{tag.itemCode}</div>
                <div className="text-sm font-medium text-gray-500">Item Name</div>
                <div className="text-sm text-gray-900 truncate">{tag.itemName}</div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-sm text-gray-900">{tag.price}</div>
                <div className="text-sm font-medium text-gray-500">Manufacturer</div>
                <div className="text-sm text-gray-900">{tag.manufacturer}</div>
                <div className="text-sm font-medium text-gray-500">Supplier</div>
                <div className="text-sm text-gray-900">{tag.supplier}</div>
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="text-sm text-gray-900">{tag.category}</div>
                <div className="text-sm font-medium text-gray-500">Sale Price</div>
                <div className="text-sm text-gray-900">{tag.salePrice}</div>
                <div className="text-sm font-medium text-gray-500">Manufacture Date</div>
                <div className="text-sm text-gray-900">{formatDateForDisplay(tag.manufactureDate)}</div>
                <div className="text-sm font-medium text-gray-500">Expiry Date</div>
                <div className="text-sm text-gray-900">{formatDateForDisplay(tag.expiryDate)}</div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                  <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag._id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handlePrint(tag)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-blue-700"
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center bg-gray-50 py-3 px-4 text-xs font-medium text-gray-500 uppercase rounded-lg gap-x-4">
              <div className="min-w-[100px]">Receipt No.</div>
              <div className="min-w-[100px]">Item Code</div>
              <div className="min-w-[200px]">Item Name</div>
              <div className="min-w-[80px]">Price</div>
              <div className="min-w-[120px]">Manufacturer</div>
              <div className="min-w-[120px]">Supplier</div>
              <div className="min-w-[120px]">Category</div>
              <div className="min-w-[80px]">Sale Price</div>
              <div className="min-w-[120px]">Manufacture Date</div>
              <div className="min-w-[120px]">Expiry Date</div>
              <div className="text-right min-w-[60px]">Actions</div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {expiryTagList.map((tag) => (
                <div
                  key={tag._id}
                  className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-x-4 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm text-gray-900 min-w-[100px]">{tag.receiptNo}</div>
                  <div className="text-sm text-gray-900 min-w-[100px]">{tag.itemCode}</div>
                  <div className="text-sm text-gray-900 truncate min-w-[200px]">{tag.itemName}</div>
                  <div className="text-sm text-gray-900 min-w-[80px]">{tag.price}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{tag.manufacturer}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{tag.supplier}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{tag.category}</div>
                  <div className="text-sm text-gray-900 min-w-[80px]">{tag.salePrice}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{formatDateForDisplay(tag.manufactureDate)}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{formatDateForDisplay(tag.expiryDate)}</div>
                  <div className="relative group min-w-[60px]">
                    <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                    <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tag._id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePrint(tag)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-blue-700"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div ref={sliderRef} className="bg-white p-4 sm:p-6 h-full overflow-y-auto shadow-lg w-full max-w-md lg:max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Expiry Tag" : "Add New Expiry Tag"}
              </h2>
              <button
                className="text-2xl text-gray-500 hover:text-gray-700"
                onClick={handleCloseSlider}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Receipt No. <span className="text-newPrimary">*</span>
                </label>
                <input
                  placeholder="Receipt No."
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Item Code <span className="text-newPrimary">*</span>
                </label>
                <input
                  placeholder="Item Code"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Item Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  placeholder="Item Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Price <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Manufacturer <span className="text-newPrimary">*</span>
                </label>
                <input
                  placeholder="Manufacturer"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Supplier <span className="text-newPrimary">*</span>
                </label>
                <input
                  placeholder="Supplier"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Category <span className="text-newPrimary">*</span>
                </label>
                <select
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Item Category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Sale Price <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Sale Price"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Manufacture Date <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Expiry Date <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg w-full hover:bg-newPrimary/80"
                onClick={handleSave}
              >
                Save Expiry Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryTags;