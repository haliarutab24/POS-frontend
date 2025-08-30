import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";

const SalesInvoice = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Static invoice data with expiry tags structure
  const [invoices, setInvoices] = useState([]);

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
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [editId, setEditId] = useState(null);


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
          setEditIndex(null);
          resetForm();
        },
      });
    } else {
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditIndex(null);
      resetForm();
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/expirayTags`);
      setInvoices(res.data); // store actual categories array
      console.log("Sales Invoices", res.data);
    } catch (error) {
      console.error("Failed to fetch products or categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Initialize shelve location list with static data
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

  // ✅ Fetch items by category
  const fetchItemsByCategory = async (categoryName) => {
    try {
      setItemCategory(categoryName)
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/category/${categoryName}`
      );
      console.log("Response ", res.data);

      setSuggestions(res.data);
      console.log("Items by Category:", res.data);
    } catch (error) {
      console.error("Failed to fetch items by category", error);
    }
  };

  useEffect(() => {
    console.log("Updated Suggestions:", suggestions);
  }, [suggestions]);

  const fetchManufacturer = async (manufacturerId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/manufacturers/${manufacturerId}`
      );
      setManufacturer(res.data.manufacturerName); // assuming API returns { manufacturerName: "..." }
    } catch (error) {
      console.error("Error fetching manufacturer", error);
    }
  };

  // fetch supplier by id
  const fetchSupplier = async (supplierId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers/${supplierId}`
      );
      setSupplier(res.data.supplierName); // assuming API returns { supplierName: "..." }
    } catch (error) {
      console.error("Error fetching supplier", error);
    }
  };



  // when user selects an item
  const handleSelectItem = async (e) => {
    const selectedName = e.target.value;
    setItemName(selectedName);

    const selectedItem = suggestions.find(
      (item) => item.itemName === selectedName
    );

    if (selectedItem) {
      setPrice(selectedItem.purchase || "");
      setSalePrice(selectedItem.sales || "");
      setManufactureDate(selectedItem.createdAt?.slice(0, 16) || "");

      // fetch manufacturer & supplier names by their IDs
      if (selectedItem.manufacturer) {
        await fetchManufacturer(selectedItem.manufacturer);
      }
      if (selectedItem.supplier) {
        await fetchSupplier(selectedItem.supplier);
      }
    }
  };


const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Save invoice
  const handleSaveInvoice = async () => {
    console.log("itemCategory", itemCategory);
    
    const newInvoice = {
      receiptNo,
      itemCode,
      itemName,
      price,
      manufacturer,     // already manufacturerName from API
      supplier,         // already supplierName from API
      category:itemCategory,
      salePrice,
      manufactureDate,
      expiryDate,
    };

     try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Update existing invoice
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/expirayTags/${editId}`,
          newInvoice,
          { headers }
        );
        toast.success("Invoice updated successfully ✅");
      } else {
        // Create new invoice (receiptNo is auto-generated in backend)
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/expirayTags`,
          newInvoice,
          { headers }
        );
        toast.success("Expiray Tags created successfully ✅");
      }

      // reset form
      resetForm()
      setIsEdit(false);
      setEditId(null);

      // refresh invoice list if you have one
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Create"} ExpirayTags failed`);
    }
  };


  // Reset form
  const resetForm = () => {
    setReceiptNo("");
    setItemCode("");
    setItemName("");
    setIsSliderOpen(false)
    setPrice(0);
    setManufacturer("");
    setSupplier("");
    setCategory("");
    setSalePrice(0);
    setManufactureDate("");
    setExpiryDate("");
  };

  // Delete invoice
  const handleDelete = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the invoice.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setInvoices(invoices.filter((_, i) => i !== index));
        Swal.fire("Deleted!", "Invoice removed.", "success");
      }
    });
  };

  // Edit invoice
  const handleEdit = (invoice, index) => {
    console.log(invoice);
    
    setIsEdit(true);
    setEditIndex(index);
    setReceiptNo(invoice.receiptNo);
    setItemCode(invoice.itemCode);
    setItemName(invoice.itemName);
    setPrice(invoice.price);
    setManufacturer(invoice.manufactureDate);
    setSupplier(invoice.supplier);
    setCategory(invoice.category);
    setSalePrice(invoice.salePrice);
    setExpiryDate(invoice.expiryDate);
    setIsSliderOpen(true);
  };

  // Print invoice
  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Expiry Tag - ${invoice.receiptNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h4 { text-align: center; margin: 0; }
            table { border-collapse: collapse; width: 100%; margin-top: 15px; }
            p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h2>Shop Name</h2>
          <h4>Expiry Tag</h4>
          <hr/>
          <p><strong>Receipt No:</strong> ${invoice.receiptNo}</p>
          <p><strong>Item Code:</strong> ${invoice.itemCode}</p>
          <p><strong>Item Name:</strong> ${invoice.itemName}</p>
          <p><strong>Manufacturer:</strong> ${invoice.manufacturer}</p>
          <p><strong>Supplier:</strong> ${invoice.supplier}</p>
          <p><strong>Category:</strong> ${invoice.category}</p>
          <p><strong>Sale Price:</strong> ${invoice.salePrice}</p>
          <p><strong>Manufacture Date:</strong> ${invoice.manufactureDate}</p>
          <p><strong>Expiry Date:</strong> ${invoice.expiryDate}</p>

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
          {invoices.map((inv, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Receipt No.</div>
                <div className="text-sm text-gray-900">{inv.receiptNo}</div>
                <div className="text-sm font-medium text-gray-500">Item Code</div>
                <div className="text-sm text-gray-900">{inv.itemCode}</div>
                <div className="text-sm font-medium text-gray-500">Item Name</div>
                <div className="text-sm text-gray-900 truncate">{inv.itemName}</div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-sm text-gray-900">{inv.price}</div>
                <div className="text-sm font-medium text-gray-500">Manufacturer</div>
                <div className="text-sm text-gray-900">{inv.manufacturer}</div>
                <div className="text-sm font-medium text-gray-500">Supplier</div>
                <div className="text-sm text-gray-900">{inv.supplier}</div>
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="text-sm text-gray-900">{inv.category}</div>
                <div className="text-sm font-medium text-gray-500">Sale Price</div>
                <div className="text-sm text-gray-900">{inv.salePrice}</div>
                <div className="text-sm font-medium text-gray-500">Manufacture Date</div>
                <div className="text-sm text-gray-900">{inv.manufactureDate}</div>
                <div className="text-sm font-medium text-gray-500">Expiry Date</div>
                <div className="text-sm text-gray-900">{inv.expiryDate}</div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                  <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                    <button
                      onClick={() => handleEdit(inv, index)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handlePrint(inv)}
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
              {invoices.map((inv, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-x-4 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm text-gray-900 min-w-[100px]">{inv.receiptNo}</div>
                  <div className="text-sm text-gray-900 min-w-[100px]">{inv.itemCode}</div>
                  <div className="text-sm text-gray-900 truncate min-w-[200px]">{inv.itemName}</div>
                  <div className="text-sm text-gray-900 min-w-[80px]">{inv.price}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{inv.manufacturer}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{inv.supplier}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{inv.category}</div>
                  <div className="text-sm text-gray-900 min-w-[80px]">{inv.salePrice}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{inv.manufactureDate}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{inv.expiryDate}</div>
                  <div className="relative group min-w-[60px]">
                    <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                    <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                      <button
                        onClick={() => handleEdit(inv, index)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePrint(inv)}
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


              {/* Category */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Category <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={itemCategory}
                  required
                  onChange={(e) => {
                    if (!isEdit) { // ❌ block changes if return
                      const categoryName = e.target.value;
                      setItemCategory(categoryName);
                      if (categoryName) fetchItemsByCategory(categoryName);
                    }
                  }}
                  className="w-full p-2 border rounded"

                >
                  <option value="">Select Item Category</option>
                  {categoryList.map((option) => (
                    <option key={option._id} value={option.categoryName}>
                      {option.categoryName}
                    </option>
                  ))}

                </select>
              </div>

              {/* Item Code */}
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
              {/* Item Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Item Name <span className="text-newPrimary">*</span>
                </label>
                <select
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={itemName}
                  onChange={handleSelectItem}
                >
                  <option value="">Select Item</option>
                  {suggestions.map((item) => (
                    <option key={item._id} value={item.itemName}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Purchase <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={price}
                />
              </div>

              {/* Manufacturer */}
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

              {/* Supplier */}
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

              {/* Sales */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Sales <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Sale Price"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Manufacture Date */}
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

              {/* Expiry Date */}
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
                onClick={handleSaveInvoice}
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

export default SalesInvoice;