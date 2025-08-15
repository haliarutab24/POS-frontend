import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";

const SalesInvoice = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Static invoice data with expiry tags structure
  const [invoices, setInvoices] = useState([
    {
      receiptNo: "EXP-001",
      itemCode: "0130",
      itemName: "CHIK FRESH TIKKA TOPPING",
      price: 1020,
      manufacturer: "AM SONS",
      supplier: "AM SONS",
      category: "CHICKEN ITEMS",
      salePrice: 900,
      manufactureDate: "11 August 2025",
      expiryDate: "11 August 2025",
    },
    {
      receiptNo: "EXP-002",
      itemCode: "0131",
      itemName: "CHIK FRESH FAJITATOPPING",
      price: 1150,
      manufacturer: "AM SONS",
      supplier: "AM SONS",
      category: "CHICKEN ITEMS",
      salePrice: 1000,
      manufactureDate: "11 August 2025",
      expiryDate: "11 August 2025",
    },
  ]);

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

  // Category options for dropdown
  const categoryOptions = ["CHICKEN ITEMS", "BURGER ITEMS", "OTHER"];

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

  // Save invoice
  const handleSaveInvoice = () => {
    const newInvoice = {
      receiptNo,
      itemCode,
      itemName,
      price,
      manufacturer,
      supplier,
      category,
      salePrice,
      manufactureDate,
      expiryDate,
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
    setItemCode(invoice.itemCode);
    setItemName(invoice.itemName);
    setPrice(invoice.price);
    setManufacturer(invoice.manufacturer);
    setSupplier(invoice.supplier);
    setCategory(invoice.category);
    setSalePrice(invoice.salePrice);
    setManufactureDate(invoice.manufactureDate);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-newPrimary">Expiry Tags List</h1>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          onClick={() => {
            resetForm();
            setIsSliderOpen(true);
          }}
        >
          + Add Expiry Tag
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100">
        <div className="hidden lg:grid grid-cols-9 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
          <div>Receipt No.</div>
          <div>Item Code</div>
          <div>Item Name</div>
          <div>Price</div>
          <div>Manufacturer</div>
          <div>Supplier</div>
          <div>Category</div>
          <div>Sale Price</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="mt-4 flex flex-col gap-[14px]">
          {invoices.map((inv, index) => (
            <div
              key={index}
              className="grid grid-cols-9 items-center gap-4 bg-white p-4 rounded-xl shadow-sm"
            >
              <div>{inv.receiptNo}</div>
              <div>{inv.itemCode}</div>
              <div>{inv.itemName}</div>
              <div>{inv.price}</div>
              <div>{inv.manufacturer}</div>
              <div>{inv.supplier}</div>
              <div>{inv.category}</div>
              <div>{inv.salePrice}</div>
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
                <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Edit Expiry Tag" : "Add New Expiry Tag"}
              </h2>
              <button
                       className="text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setIsSliderOpen(false)}
              >
                 ×
              </button>
            </div>

            {/* Expiry Tag Info */}
            <select
              className="w-full border p-2 mb-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Item Category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              placeholder="Manufacturer"
          className="w-full border p-2 mb-2"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
            <input
              placeholder="Supplier"
             className="w-full border p-2 mb-2"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
            <input
              placeholder="Item Name"
          className="w-full border p-2 mb-2"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Sale Price"
              className="w-full border p-2 mb-2"
              // className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
              value={salePrice}
              onChange={(e) => setSalePrice(parseFloat(e.target.value))}
            />
            <input
              type="datetime-local"
              className="w-full border p-2 mb-2"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full border p-2 mb-2"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />

            {/* Save */}
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg w-full"
              onClick={handleSaveInvoice}
            >
              Save Expiry Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;