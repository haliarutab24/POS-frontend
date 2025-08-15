import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";

const SalesInvoice = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Static invoice data
  const [invoices, setInvoices] = useState([
    {
      receiptNo: "INV-001",
      customerName: "Ali Khan",
      mobile: "03001234567",
      items: [
        { itemName: "Smartphone", price: 650, qty: 1, total: 650 },
        { itemName: "Notebook", price: 5, qty: 10, total: 50 },
        { itemName: "Men's Jacket", price: 70, qty: 2, total: 140 }
      ],
      discount: 0,
      givenAmount: 1000,
      payable: 840,
      returnAmount: 160
    },
    {
      receiptNo: "INV-002",
      customerName: "Sara Ahmed",
      mobile: "03009876543",
      items: [{ itemName: "Microwave Oven", price: 280, qty: 1, total: 280 }],
      discount: 20,
      givenAmount: 300,
      payable: 260,
      returnAmount: 40
    }
  ]);

  // Form states
  const [receiptNo, setReceiptNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState([{ itemName: "", price: 0, qty: 1, total: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [givenAmount, setGivenAmount] = useState(0);
  const [payable, setPayable] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);

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
  const handleSaveInvoice = () => {
    const newInvoice = {
      receiptNo,
      customerName,
      mobile,
      items,
      discount,
      givenAmount,
      payable,
      returnAmount
    };

    if (isEdit) {
      const updatedInvoices = [...invoices];
      updatedInvoices[editIndex] = newInvoice;
      setInvoices(updatedInvoices);
      setIsEdit(false);
      setEditIndex(null);
    } else {
      setInvoices([...invoices, newInvoice]);
    }

    resetForm();
    setIsSliderOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setReceiptNo("");
    setCustomerName("");
    setMobile("");
    setItems([{ itemName: "", price: 0, qty: 1, total: 0 }]);
    setDiscount(0);
    setGivenAmount(0);
    setPayable(0);
    setReturnAmount(0);
  };

  // Delete invoice
  const handleDelete = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the invoice.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setInvoices(invoices.filter((_, i) => i !== index));
        Swal.fire("Deleted!", "Invoice removed.", "success");
      }
    });
  };

  // Edit invoice
  const handleEdit = (invoice, index) => {
    setIsEdit(true);
    setEditIndex(index);
    setReceiptNo(invoice.receiptNo);
    setCustomerName(invoice.customerName);
    setMobile(invoice.mobile);
    setItems(invoice.items);
    setDiscount(invoice.discount);
    setGivenAmount(invoice.givenAmount);
    setPayable(invoice.payable);
    setReturnAmount(invoice.returnAmount);
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


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-newPrimary">Sales Invoice List</h1>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
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
        <div className="hidden lg:grid grid-cols-7 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
          <div>Receipt No.</div>
          <div>Customer Name</div>
          <div>Mobile #</div>
          <div>Payable</div>
          <div>Given</div>
          <div>Return</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="mt-4 flex flex-col gap-[14px]">
          {invoices.map((inv, index) => (
            <div
              key={index}
              className="grid grid-cols-7 items-center gap-4 bg-white p-4 rounded-xl shadow-sm"
            >
              <div>{inv.receiptNo}</div>
              <div>{inv.customerName}</div>
              <div>{inv.mobile}</div>
              <div>{inv.payable}</div>
              <div>{inv.givenAmount}</div>
              <div>{inv.returnAmount}</div>
             <div className="flex justify-center">
                        <div className="relative group">
                <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                            <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                <button
                  onClick={() => handleEdit(inv, index)}
                  className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                   className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-red-500 flex items-center gap-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePrint(inv)}
                  className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-blue-700 flex items-center gap-2"
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

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div ref={sliderRef} className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Invoice" : "Add New Invoice"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => {
                setIsSliderOpen(false);

              }}
            >
              ×
            </button>
            </div>

            {/* Customer Info */}
            <input
              placeholder="Receipt No."
              className="w-full border p-2 mb-2"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
            />
            <input
              placeholder="Customer Name"
              className="w-full border p-2 mb-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              placeholder="Mobile #"
              className="w-full border p-2 mb-2"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            {/* Items */}
            <h3 className="font-bold mt-4 mb-2">Items</h3>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder="Item Name"
                  className="border p-2 flex-1"
                  value={item.itemName}
                  onChange={(e) => handleItemChange(i, "itemName", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="border p-2 w-20"
                  value={item.price}
                  onChange={(e) => handleItemChange(i, "price", parseFloat(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="border p-2 w-16"
                  value={item.qty}
                  onChange={(e) => handleItemChange(i, "qty", parseFloat(e.target.value))}
                />
                <div className="p-2 w-20 text-right">{item.total}</div>
                <button
                  onClick={() => removeItemRow(i)}
                  className="text-red-500 hover:underline"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addItemRow}
              className="text-green-500 hover:underline mb-4"
            >
              + Add Item
            </button>

            {/* Totals */}
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
              className="bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
              onClick={handleSaveInvoice}
            >
              Save Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;
