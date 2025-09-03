import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";

const ItemList = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [itemUnitList, setItemUnitList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [shelvesList, setShelvesList] = useState([]);

  const [itemList, setItemList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [details, setDetails] = useState("");
  const [manufacture, setManufacture] = useState("");
  const [supplier, setSupplier] = useState("");
  const [shelveLocation, setShelveLocation] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [perUnit, setPerUnit] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sales, setSales] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [reorder, setReorder] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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



  // Item Detals Fetch 
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-details`);
      setItemList(res.data); // store actual categories array
      console.log("Item Details ", res.data);
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CategoryList Fetch 
  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/list`);
      setCategoryList(res.data); // store actual categories array
      console.log("Categories ", res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Item Unit List Fetch 
  const fetchItemUnitList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-unit`);
      setItemUnitList(res.data); // store actual categories array
      console.log("Item Unit ", res.data);
    } catch (error) {
      console.error("Failed to fetch item unit", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitList();
  }, [fetchItemUnitList]);

  // Manufacturer List Fetch 
  const fetchManufacturerList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/manufacturers/list`);
      setManufacturerList(res.data); // store actual categories array
      console.log("Manufacturer ", res.data);
    } catch (error) {
      console.error("Failed to fetch Manufacturer", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchManufacturerList();
  }, [fetchManufacturerList]);

  // Supplier List Fetch 
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/suppliers/list`);
      setSupplierList(res.data); // store actual categories array
      console.log("Supplier ", res.data);
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // Shelves List Fetch 
  const fetchShelvesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shelves`);
      setShelvesList(res.data); // store actual categories array
      console.log("Shelves ", res.data);
    } catch (error) {
      console.error("Failed to fetch Shelves", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchShelvesList();
  }, [fetchShelvesList]);





  // Handlers
  const handleAddItem = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setItemCategory("");
    setItemName("");
    setDetails("");
    setManufacture("");
    setSupplier("");
    setShelveLocation("");
    setItemUnit("");
    setPerUnit("");
    setPurchase("");
    setSales("");
    setStock("");
    setPrice("");
    setBarcode("");
    setReorder("");
    setEnabled(true);
    setImage(null);
    setImagePreview(null);
  };

  // Save or Update Item
  const handleSave = async () => {
    const formData = new FormData();

    formData.append("itemCategory", itemCategory);
    formData.append("itemName", itemName);
    formData.append("details", details);
    formData.append("manufacturer", manufacture);
    formData.append("supplier", supplier);
    formData.append("shelveLocation", shelveLocation);
    formData.append("itemUnit", itemUnit);
    formData.append("perUnit", parseInt(perUnit) || 0);
    formData.append("purchase", parseFloat(purchase) || 0);
    formData.append("price", parseFloat(sales) || 0);
    formData.append("stock", parseInt(stock) || 0);
    formData.append("labelBarcode", barcode);
    formData.append("reorder", parseInt(reorder) || 0);
    formData.append("isEnable", enabled);

    if (image) {
      formData.append("itemImage", image); // ✅ append actual file, not preview
    }

    console.log("Form Data", [...formData.entries()]);

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "multipart/form-data",
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/item-details/${editId}`,
          formData,
          { headers }
        );
        toast.success("Item Details Updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/item-details`,
          formData,
          { headers }
        );
        toast.success("Item Details Added successfully");
      }

      reState();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} Item Unit failed`);
    }
  };


  // Set All States Null
  const reState = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
    setItemCategory('')
    setManufacture('');
    setItemName("");
    setDetails("");
    setSupplier("");
    setShelveLocation("");
    setItemUnit("");
    setPerUnit("");
    setPurchase("");
    setSales("");
    setStock("");
    setPrice("");
    setBarcode("");
    setReorder("");
    setEnabled(false);
    setImagePreview("");
    setImage(null);
  }
  // Edit Item
 const handleEdit = (item) => {
  console.log("Item", item);

  setIsEdit(true);
  setEditId(item._id);

  // Dropdowns ke liye _id set karo
  setItemCategory(item?.itemCategory?._id || "");
  setManufacture(item?.manufacturer?._id || "");
  setSupplier(item?.supplier?._id || "");
  setShelveLocation(item?.shelveLocation?._id || "");
  setItemUnit(item?.itemUnit?._id || "");

  // Normal fields
  setItemName(item.itemName || "");
  setDetails(item.details || "");
  setPerUnit(item.perUnit ? item.perUnit.toString() : "");
  setPurchase(item.purchase ? item.purchase.toString() : "");
  setSales(item.sales ? item.sales.toString() : "");
  setStock(item.stock ? item.stock.toString() : "");
  setPrice(item.price ? item.price.toString() : "");
  setBarcode(item.labelBarcode || "");
  setReorder(item.reorder ? item.reorder.toString() : "");

  // Enable/Disable
  setEnabled(item.isEnable !== undefined ? item.isEnable : true);

  // Image
  setImagePreview(item?.itemImage?.url || "");
  setImage(null);

  setIsSliderOpen(true);
};

  // Delete Item
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

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/item-details/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}` // if you’re using auth
                }
              }
            );
            setItemList(itemList.filter((item) => item._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Item deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete item.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Item is safe 🙂",
            "error"
          );
        }
      });
  };

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Image
  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  // Capitalize First Letter
  function capitalizeFirstLetter(value) {
    if (!value) return "";
    const str = String(value); // ensure it's a string
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Items List</h1>
          <p className="text-gray-500 text-sm">Manage your items details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddItem}
        >
          + Add Item
        </button>
      </div>

      {/* Item Table */}
<div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
  <div className="overflow-x-auto scrollbar-hide">
    {/* Table wrapper with minimum width */}
    <div className="min-w-[1000px]">
      {/* Table Headers */}
      <div className="grid grid-cols-7 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
        <div className="min-w-[120px]">Item Category</div>
        <div className="min-w-[150px]">Item Name</div>
        <div className="min-w-[80px]">Purchase</div>
        <div className="min-w-[80px]">Sales</div>
        <div className="min-w-[80px]">Stock</div>
        <div className="min-w-[100px]">Barcode</div>
        {userInfo?.isAdmin && <div className="min-w-[80px] text-right">Actions</div>}
      </div>

      {/* Items in Table */}
      <div className="mt-4 flex flex-col gap-[6px] mb-14">
        {itemList.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-7 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
          >
            {/* Item Category */}
            <div className="min-w-[120px] flex items-center gap-3">
              <img
                src={item.itemImage?.url}
                alt="Product Icon"
                className="w-7 h-7 object-cover rounded-full"
              />
              <span className="text-sm font-medium text-gray-900">
                {capitalizeFirstLetter(item.itemCategory.categoryName)}
              </span>
            </div>

            {/* Item Name */}
            <div className="min-w-[150px] text-sm text-gray-500">{item.itemName}</div>

            {/* Purchase */}
            <div className="min-w-[80px] text-sm font-semibold text-gray-500">{item.purchase}</div>

            {/* Sales */}
            <div className="min-w-[80px] text-sm font-semibold text-gray-500">{item.price}</div>

            {/* Stock */}
            <div className="min-w-[80px] text-sm font-semibold text-gray-500">{item.stock}</div>

            {/* Barcode */}
            <div className="min-w-[100px] text-sm font-semibold text-gray-500">
              {item.labelBarcode.slice(0, 12)}

            </div>

            {/* Actions */}
            {userInfo?.isAdmin && (
              <div className="min-w-[80px] text-right relative group">
                <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col justify-between">
                  <button
                    onClick={() => handleEdit(item)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                  >
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

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div ref={sliderRef} className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Update Item" : "Add a New Item"}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setItemCategory("");
                  setItemName("");
                  setDetails("");
                  setManufacture("");
                  setSupplier("");
                  setShelveLocation("");
                  setItemUnit("");
                  setPerUnit("");
                  setPurchase("");
                  setSales("");
                  setStock("");
                  setPrice("");
                  setBarcode("");
                  setReorder("");
                  setEnabled(true);
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">

              {/* Item Category */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Category <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={itemCategory}
                  required
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {categoryList.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  required
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Manufacture */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Manufacture <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={manufacture}
                  required
                  onChange={(e) => setManufacture(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Manufacture</option>
                  {manufacturerList.map((manufacture) => (
                    <option key={manufacture._id} value={manufacture._id}>
                      {manufacture.manufacturerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Supplier <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={supplier}
                  required
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Supplier</option>
                  {supplierList.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Purchase <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={purchase}
                  required
                  onChange={(e) => setPurchase(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Sales */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Sales <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={sales}
                  required
                  onChange={(e) => setSales(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Stock <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  required
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              
              {/* Barcode */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Barcode <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={barcode}
                  required
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. BAR1234567890"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-gray-700 font-medium">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Shelve Location */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Shelve Location <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={shelveLocation}
                  required
                  onChange={(e) => setShelveLocation(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Location</option>
                  {shelvesList.map((shelves) => (
                    <option key={shelves._id} value={shelves._id}>
                      {shelves.shelfNameCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Unit */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Unit <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={itemUnit}
                  required
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Unit</option>
                  {itemUnitList.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.unitName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Per Unit */}
              <div>
                <label className="block text-gray-700 font-medium">Per Unit</label>
                <input
                  type="number"
                  value={perUnit}
                  onChange={(e) => setPerUnit(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Reorder */}
              <div>
                <label className="block text-gray-700 font-medium">Reorder</label>
                <input
                  type="number"
                  value={reorder}
                  onChange={(e) => setReorder(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Images <span className="text-newPrimary">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-newPrimary hover:text-newPrimary focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Image</h3>
                    <div className="relative group w-48 h-32">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md border border-gray-200"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enable / Disable */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Enable / Disable</label>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-7" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
                Save Item
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;