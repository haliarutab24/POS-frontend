import React, { useState, useRef, useEffect } from "react";
import Barcode from "react-barcode";
import gsap from "gsap";

const ItemBarcode = () => {
  const [ItemBarcodeList, setItemBarcodeList] = useState([]);
  const [itemCategory, setItemCategory] = useState("");
  const [code, setCode] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [stock, setStock] = useState("");
  const [reorderUnit, setReorderUnit] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);

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
          // Reset fields
          setItemCategory("");
          setCode("");
          setManufacturer("");
          setSupplier("");
          setItemName("");
          setQuantityUnit("");
          setStock("");
          setReorderUnit("");
          setSalePrice("");
        },
      });
    } else {
      setIsSliderOpen(false);
      // Reset fields
      setItemCategory("");
      setCode("");
      setManufacturer("");
      setSupplier("");
      setItemName("");
      setQuantityUnit("");
      setStock("");
      setReorderUnit("");
      setSalePrice("");
    }
  };

  const handleAddItem = () => {
    setIsSliderOpen(true);
  };

  const handleSave = () => {
    if (!code) {
      alert("Please enter a code before saving!");
      return;
    }

    const newItem = {
      itemCategory,
      code,
      manufacturer,
      supplier,
      itemName,
      quantityUnit,
      stock,
      reorderUnit,
      salePrice,
    };

    setItemBarcodeList([...ItemBarcodeList, newItem]);
    setIsSliderOpen(false);

    // Reset fields
    setItemCategory("");
    setCode("");
    setManufacturer("");
    setSupplier("");
    setItemName("");
    setQuantityUnit("");
    setStock("");
    setReorderUnit("");
    setSalePrice("");
  };

  // Print individual barcode
  const handlePrint = (item) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body style="display: flex; flex-direction: column; align-items: center; font-family: sans-serif;">
          <h3>${item.itemName}</h3>
          <div>
            ${document.getElementById(`barcode-${item.code}`).outerHTML}
          </div>
          <p>Price: ${item.salePrice}</p>
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">Item Barcode</h1>
          <p className="text-gray-500 text-sm">Manage your item barcodes</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full sm:w-auto"
          onClick={handleAddItem}
        >
          + Add Item Barcode
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-xl shadow p-4 sm:p-6 border border-gray-100">
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {ItemBarcodeList.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Sr.#</div>
                <div className="text-sm text-gray-900">{index + 1}</div>
                <div className="text-sm font-medium text-gray-500">Code</div>
                <div className="text-sm text-gray-900">{item.code}</div>
                <div className="text-sm font-medium text-gray-500">Item Name</div>
                <div className="text-sm text-gray-900 truncate">{item.itemName}</div>
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="text-sm text-gray-900">{item.itemCategory}</div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-sm text-gray-900">{item.salePrice}</div>
                <div className="text-sm font-medium text-gray-500">Barcode</div>
                <div className="text-sm text-gray-900">
                  <div id={`barcode-${item.code}`}>
                    <Barcode value={item.code} height={40} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => handlePrint(item)}
                >
                  Print
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-[50px_100px_200px_120px_100px_150px_auto] items-center bg-secondary/10 py-3 px-4 text-xs font-medium text-gray-500 uppercase rounded-lg gap-x-4">
              <div className="min-w-[50px]">Sr.#</div>
              <div className="min-w-[100px]">Code</div>
              <div className="min-w-[200px]">Item Name</div>
              <div className="min-w-[120px]">Category</div>
              <div className="min-w-[100px]">Price</div>
              <div className="min-w-[150px]">Barcode</div>
              <div className="text-right min-w-[80px]">Actions</div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {ItemBarcodeList.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[50px_100px_200px_120px_100px_150px_auto] gap-x-4 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm text-gray-900 min-w-[50px]">{index + 1}</div>
                  <div className="text-sm text-gray-900 min-w-[100px]">{item.code}</div>
                  <div className="text-sm text-gray-900 truncate min-w-[200px]">{item.itemName}</div>
                  <div className="text-sm text-gray-900 min-w-[120px]">{item.itemCategory}</div>
                  <div className="text-sm text-gray-900 min-w-[100px]">{item.salePrice}</div>
                  <div className="min-w-[150px]">
                    <div id={`barcode-${item.code}`}>
                      <Barcode value={item.code} height={40} />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => handlePrint(item)}
                    >
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLIDER FORM */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div
            ref={sliderRef}
            className="bg-white p-4 sm:p-6 h-full overflow-y-auto shadow-lg w-full max-w-md lg:max-w-lg"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-semibold text-newPrimary">Add Item</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={handleCloseSlider}
              >
                &times;
              </button>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Item Category <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                >
                  <option value="">Select</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Code <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Manufacturer <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                >
                  <option value="">Select</option>
                  <option value="Nestle">Nestle</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Supplier <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                >
                  <option value="">Select</option>
                  <option value="Supplier A">Supplier A</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Item Name <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                >
                  <option value="">Select</option>
                  <optgroup label="Vegetables">
                    <option value="Carrot">Carrot</option>
                    <option value="Potato">Potato</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Cabbage">Cabbage</option>
                    <option value="Spinach">Spinach</option>
                  </optgroup>
                  <optgroup label="Fruits">
                    <option value="Apple">Apple</option>
                    <option value="Banana">Banana</option>
                    <option value="Orange">Orange</option>
                    <option value="Grapes">Grapes</option>
                    <option value="Mango">Mango</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Quantity Unit <span className="text-newPrimary">*</span>
                </label>
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                >
                  <option value="">Select</option>
                  <option value="Pc">Pc</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Stock <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Reorder Unit <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={reorderUnit}
                  onChange={(e) => setReorderUnit(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Sale Price Per Piece <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary/80"
                />
              </div>
              <button
                className="w-full bg-newPrimary text-white py-2 rounded-lg hover:bg-newPrimary/80"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemBarcode;