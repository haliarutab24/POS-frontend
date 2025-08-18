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
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchIndex, setSearchIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static invoice data
  const [invoices, setInvoices] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  // console.log("userInfo", userInfo);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState([{ itemName: "", price: 0, qty: 1, total: 0 }]);
  const [discount, setDiscount] = useState();
  const [givenAmount, setGivenAmount] = useState();
  const [payable, setPayable] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [editId, setEditId] = useState(null);

  // Animate slider
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.8, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);


  // Fetch Sales Invoice Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/saleInvoices`);
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


  // search suggestion with debouncing 
  useEffect(() => {
    // ✅ Run only if searchValue is not empty and has more than 1 character
    if (!searchValue || searchValue.length <= 1) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/item-details/search?q=${searchValue}`
          );
          setSuggestions(res.data);
          console.log("Suggestion Item", res.data);
        } catch (error) {
          console.error("Error fetching items", error);
        }
      };

      fetchData();
    }, 50); // 👈 debounce (increase to 50ms for smoother API calls)

    return () => clearTimeout(delay);
  }, [searchValue]);


  const handleSearch = (selectedItem, index) => {
    handleItemChange(index, "itemName", selectedItem.itemName);
    handleItemChange(index, "price", selectedItem.price); // auto-fill price
    setSearchValue(""); // clear searchValue after selection
    setSuggestions([]); // close dropdown
  };

  const handleInputChange = (value, index) => {
    handleItemChange(index, "itemName", value); // update input field
    setSearchValue(value); // trigger useEffect
    setSearchIndex(index); // track row for suggestions
  }


  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    updatedItems[index].total =
      parseFloat(updatedItems[index].price || 0) *
      parseFloat(updatedItems[index].qty || 0);
    setItems(updatedItems);
    calculateTotals(updatedItems, discount, givenAmount);
  };

  // Add new item row
  const addItemRow = () => {
    setItems([...items, { itemName: "", price: 0, qty: 1, total: 0 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotals(updatedItems, discount, givenAmount);
  };

  // Calculate totals
  const calculateTotals = (itemsList, disc, given) => {
    const totalBill = itemsList.reduce((sum, item) => sum + item.total, 0);
    const payableAmt = totalBill - parseFloat(disc || 0);
    setPayable(payableAmt);
    setReturnAmount(parseFloat(given || 0) - payableAmt);
  };

  // Save invoice
  const handleSaveInvoice = async () => {
    const formData = {
      customerName,
      mobile,
      items,
      discount,
      givenAmount,
      payable,
      returnAmount,
    };
    console.log("Form data ", formData);

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Update existing invoice
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/saleInvoices/${editId}`,
          formData,
          { headers }
        );
        toast.success("Invoice updated successfully ✅");
      } else {
        // Create new invoice (receiptNo is auto-generated in backend)
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/saleInvoices`,
          formData,
          { headers }
        );
        toast.success("Invoice created successfully ✅");
      }

      // reset form
      resetForm()
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);

      // refresh invoice list if you have one
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Create"} invoice failed`);
    }
  };

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setMobile("");
    setItems([{ itemName: "", price: 0, qty: 1, total: 0 }]);
    setDiscount(0);
    setGivenAmount(0);
    setPayable(0);
    setReturnAmount(0);
  };

  // Delete invoice
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
              `${import.meta.env.VITE_API_BASE_URL}/saleInvoices/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}` // if you’re using auth
                }
              }
            );
            setInvoices(invoices.filter((s) => s._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Sales Invoice deleted successfully.",
              "success"
            );
            fetchData()
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete sales invoice.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Sales Invoice is safe 🙂",
            "error"
          );
        }
      });
  };

  // Edit invoice
  const handleEdit = (invoice) => {
    console.log(invoice);

    setIsEdit(true);
    setEditId(invoice._id);
    console.log("Eidit ", editId);

    setCustomerName(invoice.customerName || '');
    setMobile(invoice.mobile || '');
    setItems(invoice.items || []); // default to empty array
    setDiscount(invoice.discount || 0);
    setGivenAmount(invoice.givenAmount || 0);
    setPayable(invoice.payable || 0);
    setReturnAmount(invoice.returnAmount || 0);
    setIsSliderOpen(true);
  };

  // Print invoice
  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");

    // Build items table HTML
    const itemsHTML = invoice.items
      .map(
        (i, idx) => `
      <tr>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${idx + 1}</td>
        <td style="border:1px solid #000;padding:4px;">${i.itemName}</td>
        <td style="border:1px solid #000;padding:4px;text-align:right;">${i.price}</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${i.qty}</td>
        <td style="border:1px solid #000;padding:4px;text-align:right;">${i.total}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${invoice.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h4 { text-align: center; margin: 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <h2>Shop Name</h2>
        <h4>Sales Invoice</h4>
        <hr/>
        <p><strong>Receipt No:</strong> ${invoice.receiptNo}</p>
        <p><strong>Customer:</strong> ${invoice.customerName}</p>
        <p><strong>Mobile:</strong> ${invoice.mobile}</p>

        <table>
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:4px;">#</th>
              <th style="border:1px solid #000;padding:4px;">Item</th>
              <th style="border:1px solid #000;padding:4px;">Price</th>
              <th style="border:1px solid #000;padding:4px;">Qty</th>
              <th style="border:1px solid #000;padding:4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <hr/>
        <p><strong>Discount:</strong> ${invoice.discount}</p>
        <p><strong>Payable:</strong> ${invoice.payable}</p>
        <p><strong>Given Amount:</strong> ${invoice.givenAmount}</p>
        <p><strong>Return Amount:</strong> ${invoice.returnAmount}</p>

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
          <PuffLoader height="150" width="150" radius={1} color="#00809D" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">
          Sales Invoice List
        </h1>
        <button
          className="bg-newPrimary text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-primaryDark w-full sm:w-auto"
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
        >
          + Add Sales Invoice
        </button>
      </div>


      {/* Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100">
        {/* Table container with horizontal scrolling */}
        <div className="overflow-x-auto">
          {/* Table wrapper to ensure consistent width */}
          <div className="min-w-[800px]">
            {/* Table header - always visible */}
            <div className="grid grid-cols-7 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div className="min-w-[100px]">Receipt No.</div>
              <div className="min-w-[150px]">Customer Name</div>
              <div className="min-w-[100px]">Mobile #</div>
              <div className="min-w-[80px]">Payable</div>
              <div className="min-w-[80px]">Given</div>
              <div className="min-w-[80px]">Return</div>
              <div className="min-w-[80px] text-right">Actions</div>
            </div>

            {/* Table rows */}
            <div className="mt-4 flex flex-col gap-[14px]">
              {invoices.map((inv, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 items-center gap-4 bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="min-w-[100px]">{inv.receiptNo}</div>
                  <div className="min-w-[150px]">{inv.customerName}</div>
                  <div className="min-w-[100px]">{inv.mobile}</div>
                  <div className="min-w-[80px]">{inv.payable}</div>
                  <div className="min-w-[80px]">{inv.givenAmount}</div>
                  <div className="min-w-[80px]">{inv.returnAmount}</div>
                  <div className="min-w-[80px] flex justify-end">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                        <button
                          onClick={() => handleEdit(inv)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-red-500 flex items-center gap-2"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/10 text-blue-700 flex items-center gap-2"
                        >
                          Print
                        </button>
                      </div>
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
          <div
            ref={sliderRef}
            className="w-full sm:w-full md:w-2/3 lg:w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold mb-4">
                {isEdit ? "Edit Invoice" : "Add New Invoice"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Customer Info */}
            <input
              placeholder="Customer Name"
              className="w-full border p-2 mb-2"
              value={customerName}
              required
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              placeholder="Mobile #"
              className="w-full border p-2 mb-2"
              value={mobile}
              required
              onChange={(e) => setMobile(e.target.value)}
            />

            {/* Items */}
            <div>
              <h3 className="font-bold mt-4 mb-2">Items</h3>
              {items.map((item, i) => (
                <div key={i} className="flex flex-col gap-1 mb-4 relative">
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder="Item Name"
                      className="border p-2 flex-1 min-w-[120px]"
                      value={item.itemName}
                      onChange={(e) => handleInputChange(e.target.value, i)}
                    />
                    <input
                      readOnly
                      placeholder="Price"
                      className="border p-2 w-20"
                      value={item.price || ""}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      className="border p-2 w-16"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(i, "qty", parseFloat(e.target.value))
                      }
                    />
                    <div className="p-2 w-20 text-right">{item.total}</div>
                    <button
                      onClick={() => removeItemRow(i)}
                      className="text-red-500 hover:underline"
                    >
                      X
                    </button>
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && searchIndex === i && (
                    <ul className="absolute bg-white border w-[12.5rem] mt-8 z-10">
                      {suggestions.map((s) => (
                        <li
                          key={s._id}
                          className="p-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleSearch(s, i)}
                        >
                          {s.itemName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <button
                onClick={addItemRow}
                className="text-green-500 hover:underline mb-4"
              >
                + Add Item
              </button>
            </div>

            {/* Totals */}
            <label>Discount Amount</label>
            <input
              type="number"
              placeholder="Discount"
              className="w-full border p-2 mb-2"
              value={discount}
              onChange={(e) => {
                setDiscount(parseFloat(e.target.value));
                calculateTotals(items, parseFloat(e.target.value), givenAmount);
              }}
            />
            <label>Given Amount</label>
            <input
              type="number"
              placeholder="Given Amount"
              className="w-full border p-2 mb-2"
              value={givenAmount}
              onChange={(e) => {
                setGivenAmount(parseFloat(e.target.value));
                calculateTotals(items, discount, parseFloat(e.target.value));
              }}
            />
            <div className="mb-2 font-bold">Payable: {payable}</div>
            <div className="mb-4 font-bold">Return: {returnAmount}</div>

            {/* Save */}
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg w-full"
              onClick={handleSaveInvoice}
            >
              {isEdit ? "Update Invoice" : "Save Invoice"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesInvoice;
