import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import { toast } from "react-toastify";
import gsap from "gsap";
import { HashLoader } from "react-spinners";

const ItemBarcode = () => {
  const [itemBarcodeList, setItemBarcodeList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [itemDetailList, setItemDetailList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [itemDetailId, setItemDetailId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [code, setCode] = useState("");
  const [stock, setStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);


  // Safe userInfo parsing
  const getUserInfo = () => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
      // console.log("Parsed userInfo:", info);
      return info;
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return {};
    }
  };

  const userInfo = getUserInfo();

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      sliderRef.current.style.display = "block";
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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
      setCategoryList(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Manufacturers
  const fetchManufacturers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/manufacturers`);
      if (!res.ok) throw new Error("Failed to fetch manufacturers");
      const result = await res.json();
      setManufacturerList(result);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      setManufacturerList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers`);
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const result = await res.json();
      setSupplierList(result);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSupplierList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Item Details
  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-details`);
      setItemDetailList(res.data);
    } catch (error) {
      console.error("Failed to fetch item details:", error);
      setItemDetailList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Units
  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/item-unit`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const result = await res.json();
      setUnitList(result);
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnitList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Barcodes
  const fetchBarcodes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/itemBarcode`);
      if (!res.ok) throw new Error("Failed to fetch barcodes");
      const result = await res.json();
      console.log("Result", result);

      setItemBarcodeList(result);
    } catch (error) {
      console.error("Error fetching barcodes:", error);
      setItemBarcodeList([]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
    fetchSuppliers();
    fetchItemDetails();
    fetchUnits();
    fetchBarcodes();
  }, [fetchCategories, fetchManufacturers, fetchSuppliers, fetchItemDetails, fetchUnits, fetchBarcodes]);

  const handleAddItem = () => {
    setIsSliderOpen(true);
  };

  const handleSave = async () => {
    if (!code || !categoryId || !manufacturerId || !itemDetailId || !stock || !reorderLevel || !salePrice) {
      alert("Please fill in all required fields!");
      return;
    }

    const newItem = {
      code,
      unit: unitId,
      category: categoryId,
      manufacturer: manufacturerId,
      supplier: supplierId || null, // optional
      itemDetail: itemDetailId,
      stock: parseInt(stock),
      reorderLevel: parseInt(reorderLevel),
      salePrice: parseFloat(salePrice),
    };
    // console.log("New item", newItem);

    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error("❌ Authorization token missing!");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let res;
      if (isEdit && editId) {
        // Update
        res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/itemBarcode/${editId}`,
          newItem,
          { headers }
        );
        toast.success("✅ Item updated successfully");
      } else {
        // Create
        res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/itemBarcode`,
          newItem,
          { headers }
        );
        toast.success("✅ Item added successfully");
      }

      // Update local list with new/updated data
      if (res?.data) {
        setItemBarcodeList([...itemBarcodeList, res.data]);
      }

      setIsSliderOpen(false);

      // Reset form fields
      setCode("");
      setCategoryId("");
      setManufacturerId("");
      setSupplierId("");
      setItemDetailId("");
      setUnitId("");
      setStock("");
      setReorderLevel("");
      setSalePrice("");
      fetchBarcodes()
    } catch (error) {
      console.error("❌ Error saving item:", error);
      toast.error("Failed to save item!");
    }
  };


  // Print individual barcode
  const handlePrint = (item) => {
    const itemDetail = itemDetailList.find((d) => d._id === item.itemDetail)?.itemName || "Unknown";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body style="display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
          <h3>${itemDetail}</h3>
          <div>
            ${document.getElementById(`barcode-${item.code}`).outerHTML}
          </div>
          <p>Price: $${item.salePrice}</p>
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
        <div className="text-center">
          <HashLoader height="150" width="150" radius={1} color="#84CF16" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Item Barcode</h1>
          <p className="text-gray-500 text-sm">Item Barcode Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddItem}
        >
          + Add Item Barcode
        </button>
      </div>

      {/* TABLE/CARDS */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-9 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Code</div>
              <div>Item Name</div>
              <div>Category</div>
              <div>Manufacturer</div>
              <div>Supplier</div>
              <div>Unit</div>
              <div>Stock</div>
              <div>Barcode</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 mt-4">
              {itemBarcodeList.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="text-sm font-medium text-gray-500">Sr.#</div>
                  <div className="text-sm text-gray-900">{index + 1}</div>
                  <div className="text-sm font-medium text-gray-500">Code</div>
                  <div className="text-sm text-gray-900">{item.code}</div>
                  <div className="text-sm font-medium text-gray-500">Item Name</div>
                  <div className="text-sm text-gray-900 truncate">{(item?.itemDetail?.itemName)}</div>
                  <div className="text-sm font-medium text-gray-500">Category</div>
                  <div className="text-sm text-gray-900">{item?.category?.categoryName}</div>
                  <div className="text-sm font-medium text-gray-500">Manufacturer</div>
                  <div className="text-sm text-gray-900">{item?.manufacturer?.manufacturerName}</div>
                  <div className="text-sm font-medium text-gray-500">Supplier</div>
                  <div className="text-sm text-gray-900">{item?.supplier?.supplierName}</div>
                  <div className="text-sm font-medium text-gray-500">Unit</div>
                  <div className="text-sm text-gray-900">{(item?.unit?.unitName)}</div>
                  <div className="text-sm font-medium text-gray-500">Stock</div>
                  <div className="text-sm text-gray-900">{item.stock}</div>
                  <div className="text-sm font-medium text-gray-500">Reorder Level</div>
                  <div className="text-sm text-gray-900">{item.reorderLevel}</div>
                  <div className="text-sm font-medium text-gray-500">Price</div>
                  <div className="text-sm text-gray-900">${item.salePrice}</div>
                  <div className="text-sm font-medium text-gray-500">Barcode</div>
                  <div className="text-sm text-gray-900">
                    <div id={`barcode-${item.code}`}>
                      <Barcode value={item.code} height={40} width={1.5} />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50">
                        <button
                          onClick={() => handlePrint(item)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
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
            <div className="mt-4 flex flex-col gap-[14px] pb-14 lg:flex">
              {itemBarcodeList.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-9 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm text-gray-600">{item.code}</div>
                  <div className="text-sm text-gray-600 truncate">{(item?.itemDetail?.itemName)}</div>
                  <div className="text-sm text-gray-600">{(item?.category?.categoryName)}</div>
                  <div className="text-sm text-gray-600">{(item?.manufacturer?.manufacturerName)}</div>
                  <div className="text-sm text-gray-600">{item?.supplier?.supplierName}</div>
                  <div className="text-sm text-gray-600">{(item?.unit?.unitName)}</div>
                  <div className="text-sm text-gray-600">{item.stock}</div>
                  <div id={`barcode-${item.code}`}>
                    <Barcode value={item.code} height={40} width={1.5} />
                  </div>
                  <div className="text-right relative group">
                    <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                    <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50">
                      <button
                        onClick={() => handlePrint(item)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                  {/* Hidden barcode for printing */}
                  <div style={{ display: "none" }}>
                    <div id={`barcode-${item.code}`}>
                      <Barcode value={item.code} height={40} width={1.5} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLIDER FORM */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">Add Item Barcode</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {categoryList.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Manufacturer <span className="text-red-500">*</span></label>
                    <select
                      value={manufacturerId}
                      onChange={(e) => setManufacturerId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Manufacturer</option>
                      {manufacturerList.map((manufacturer) => (
                        <option key={manufacturer._id} value={manufacturer._id}>
                          {manufacturer.manufacturerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Supplier (Optional)</option>
                      {supplierList.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Item Detail <span className="text-red-500">*</span></label>
                    <select
                      value={itemDetailId}
                      onChange={(e) => setItemDetailId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Item</option>
                      {itemDetailList.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.itemName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
                    <select
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Unit</option>
                      {unitList.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.unitName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Reorder Level <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={reorderLevel}
                      onChange={(e) => setReorderLevel(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Sale Price <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
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
                  Save Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemBarcode;