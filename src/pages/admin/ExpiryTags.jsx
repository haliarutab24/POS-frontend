import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";

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
        { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

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

    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the expiry tag.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/expirayTags/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Expiry Tag removed.", "success");
        fetchExpiryTags();
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
        <PuffLoader size={150} color="#00809D" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">Expiry Tags List</h1>
        <button
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
        >
          + Add Expiry Tag
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow p-4 sm:p-6 border border-gray-100">
        {expiryTagList.map((tag) => (
          <div key={tag._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3">
            <div className="flex justify-between">
              <div>
                <p><strong>{tag.itemName}</strong> ({tag.itemCode})</p>
                <p>Category: {tag.category}</p>
                <p>Expiry: {tag.expiryDate}</p>
              </div>
              <div>
                <button onClick={() => handleEdit(tag)} className="text-blue-500 mr-2">Edit</button>
                <button onClick={() => handleDelete(tag._id)} className="text-red-500">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div ref={sliderRef} className="bg-white p-6 h-full overflow-y-auto w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Expiry Tag" : "Add Expiry Tag"}</h2>

            {/* Form fields */}
            <input placeholder="Receipt No" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="w-full border p-2 mb-2" />
            <select
              value={itemCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setItemCategory(cat);
                if (cat) fetchItemsByCategory(cat);
              }}
              className="w-full border p-2 mb-2"
            >
              <option value="">Select Category</option>
              {categoryList.map((c) => (
                <option key={c._id} value={c.categoryName}>{c.categoryName}</option>
              ))}
            </select>

            <select value={itemName} onChange={handleSelectItem} className="w-full border p-2 mb-2">
              <option value="">Select Item</option>
              {suggestions.map((s) => (
                <option key={s._id} value={s.itemName}>{s.itemName}</option>
              ))}
            </select>

            <input placeholder="Item Code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full border p-2 mb-2" />
            <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2 mb-2" />
            <input placeholder="Sale Price" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full border p-2 mb-2" />
            <input type="datetime-local" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} className="w-full border p-2 mb-2" />
            <input type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full border p-2 mb-2" />

            <div className="flex justify-between">
              <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
              <button onClick={handleCloseSlider} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryTags;
