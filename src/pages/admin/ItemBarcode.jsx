import React, { useState, useRef } from "react";
import Barcode from "react-barcode";

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-newPrimary">Item Barcode</h1>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary"
          onClick={handleAddItem}
        >
          + Add Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-secondary/10">
                <th className="py-3 px-4">Sr.#</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ItemBarcodeList.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{item.code}</td>
                  <td className="py-3 px-4">{item.itemName}</td>
                  <td className="py-3 px-4">{item.itemCategory}</td>
                  <td className="py-3 px-4">{item.salePrice}</td>
                  <td className="py-3 px-4">
                    <div id={`barcode-${item.code}`}>
                      <Barcode value={item.code} height={40} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => handlePrint(item)}
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* SLIDER FORM */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-newPrimary">Add Item</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-5">
              <div>
                <label>Item Category</label>
                <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label>Code</label>
                <input type="number" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label>Manufacturer</label>
                <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select</option>
                  <option value="Nestle">Nestle</option>
                </select>
              </div>

              <div>
                <label>Supplier</label>
                <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select</option>
                  <option value="Supplier A">Supplier A</option>
                </select>
              </div>

              <div>
                <label>Item Name</label>
                <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full p-2 border rounded">
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
                <label>Quantity Unit</label>
                <select value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select</option>
                  <option value="Pc">Pc</option>
                </select>
              </div>

              <div>
                <label>Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label>Reorder Unit</label>
                <input type="number" value={reorderUnit} onChange={(e) => setReorderUnit(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label>Sale Price Per Piece</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <button className="w-full bg-newPrimary text-white py-2 rounded" onClick={handleSave}>
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
