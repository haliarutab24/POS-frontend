import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";

const ExpiryTags = () => {
  const [expiryTagList, setExpiryTagList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
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

  // UI + edit
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Category/suggestions
  const [categoryList, setCategoryList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else if (sliderRef.current) {
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

  const handleCloseSlider = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setReceiptNo("");
    setItemCode("");
    setItemName("");
    setPrice(0);
    setManufacturer("");
    setSupplier("");
    setCategory("");
    setItemCategory("");
    setSalePrice(0);
    setManufactureDate("");
    setExpiryDate("");
  };

  // Fetch expiry tags
  const fetchExpiryTags = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/expirayTags`);
      setExpiryTagList(res.data);
    } catch (error) {
      console.error("Error fetching expiry tags:", error);
      toast.error("Failed to fetch expiry tags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiryTags();
  }, [fetchExpiryTags]);

  // Fetch categories
  const fetchCategoryList = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/list`);
      setCategoryList(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Fetch items by category
  const fetchItemsByCategory = async (categoryName) => {
    try {
      setItemCategory(categoryName);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/category/${categoryName}`
      );
      setSuggestions(res.data);
    } catch (error) {
      console.error("Error fetching items by category", error);
    }
  };

  const handleSelectItem = async (e) => {
    const selectedName = e.target.value;
    setItemName(selectedName);

    const selectedItem = suggestions.find((item) => item.itemName === selectedName);

    if (selectedItem) {
      setPrice(selectedItem.purchase || "");
      setSalePrice(selectedItem.sales || "");
      setManufactureDate(selectedItem.createdAt?.slice(0, 16) || "");
      if (selectedItem.manufacturer) {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/manufacturers/${selectedItem.manufacturer}`
        );
        setManufacturer(res.data.manufacturerName);
      }
      if (selectedItem.supplier) {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/suppliers/${selectedItem.supplier}`
        );
        setSupplier(res.data.supplierName);
      }
    }
  };

  // Save expiry tag
  const handleSave = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo?.token;

    if (!token) {
      toast.error("❌ Authorization token missing!");
      return;
    }

    const payload = {
      receiptNo,
      itemCode,
      itemName,
      price,
      manufacturer,
      supplier,
      category: itemCategory,
      salePrice,
      manufactureDate,
      expiryDate,
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };
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
      console.error("Save error:", error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} expiry tag failed`);
    }
  };

  // Delete expiry tag
  const handleDelete = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo?.token;
    if (!token) {
      toast.error("❌ Authorization token missing!");
      return;
    }

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
        text: "This will delete the expiry tag.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/expirayTags/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Expiry Tag removed.",
              "success"
            );
            fetchExpiryTags();
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Expiry Tag.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Expiry Tag is safe 🙂",
            "error"
          );
        }
      });
  };

  // Edit expiry tag
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
    setItemCategory(tag.category || "");
    setSalePrice(tag.salePrice || 0);
    setManufactureDate(tag.manufactureDate || "");
    setExpiryDate(tag.expiryDate || "");
    setIsSliderOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <HashLoader size={150} color="#84CF16" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Expiry Tags List</h1>
          <p className="text-gray-500 text-sm">Expiry Tag Management Dashboard</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
        >
          + Add Expiry Tag
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-7 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Item Name</div>
              <div>Item Code</div>
              <div>Category</div>
              <div>Price</div>
              <div>Sale Price</div>
              <div>Expiry Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Expiry Tags Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {expiryTagList.map((tag, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Item Name */}
                  <div className="text-sm font-medium text-gray-900">{tag.itemName}</div>

                  {/* Item Code */}
                  <div className="text-sm font-semibold text-green-600">{tag.itemCode}</div>

                  {/* Category */}
                  <div className="text-sm text-gray-500">{tag.category}</div>

                  {/* Price */}
                  <div className="text-sm text-gray-500">{tag.price}</div>

                  {/* Sale Price */}
                  <div className="text-sm text-gray-500">{tag.salePrice}</div>

                  {/* Expiry Date */}
                  <div className="text-sm text-gray-500">{tag.expiryDate}</div>

                  {/* Actions */}
                  <div className="text-right relative group">
                    <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                    <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                      opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                      transition-opacity duration-300 z-50 flex flex-col justify-between">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tag._id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Expiry Tag" : "Add Expiry Tag"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={handleCloseSlider}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Expiry Tag Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Receipt No</label>
                    <input
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter receipt number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setItemCategory(cat);
                        if (cat) fetchItemsByCategory(cat);
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {categoryList.map((c) => (
                        <option key={c._id} value={c.categoryName}>{c.categoryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Item Name</label>
                    <select
                      value={itemName}
                      onChange={handleSelectItem}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Item</option>
                      {suggestions.map((s) => (
                        <option key={s._id} value={s.itemName}>{s.itemName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter item code"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Sale Price</label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter sale price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter manufacturer"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter supplier"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Manufacture Date</label>
                    <input
                      type="datetime-local"
                      value={manufactureDate}
                      onChange={(e) => setManufactureDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={handleCloseSlider}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Expiry Tag" : "Save Expiry Tag"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExpiryTags;
