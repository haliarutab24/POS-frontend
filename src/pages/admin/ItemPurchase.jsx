import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

export default function PurchaseManager() {
    const [view, setView] = useState("list"); // list | form
    const [purchases, setPurchases] = useState([]);


    const sliderRef = useRef(null);

    const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
    const [sliderOpen, setSliderOpen] = useState(false);

    const [formData, setFormData] = useState({
        grnNo: "",
        grnDate: new Date().toISOString().split("T")[0],
        supplier: "",
        invoiceNo: "",
        discountPercent: 0,
    });
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: "",
        category: "",
        purchase: 0,
        sale: 0,
        unit: "",
        qty: 0,
    });


    // Slider animation
    useEffect(() => {
        if (sliderOpen && sliderRef.current) {
            gsap.fromTo(
                sliderRef.current,
                { x: "100%", opacity: 0 },
                { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
            );
        }
    }, [sliderOpen]);
    // Total calculations
    const totalPurchase = items.reduce(
        (acc, item) => acc + item.purchase * item.qty,
        0
    );
    const totalQty = items.reduce((acc, item) => acc + Number(item.qty), 0);
    const discountAmount = (totalPurchase * formData.discountPercent) / 100;
    const payable = totalPurchase - discountAmount;

    const handleSavePurchase = () => {
        const newPurchase = {
            ...formData,
            items,
            totalPurchase,
            totalQty,
            discountAmount,
            payable,
        };
        setPurchases([...purchases, newPurchase]);
        setFormData({
            grnNo: "",
            grnDate: new Date().toISOString().split("T")[0],
            supplier: "",
            invoiceNo: "",
            discountPercent: 0,
        });
        setItems([]);
        setIsSliderOpen(false);
        setView("list");
    };

    const handleAddItem = () => {
        setItems([...items, newItem]);
        setNewItem({
            name: "",
            category: "",
            purchase: 0,
            sale: 0,
            unit: "",
            qty: 0,
        });
        setSliderOpen(false);
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {view === "list" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold  text-newPrimary px-4 py-2">
                            PURCHASE ITEMS
                        </h1>
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            onClick={() => setPurchaseDrawerOpen(true)}
                        >
                            + Add New Purchase
                        </button>
                    </div>
                    <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-3">Sr.#</th>
                                    <th className="py-2 px-3">GRN No</th>
                                    <th className="py-2 px-3">GRN Date</th>
                                    <th className="py-2 px-3">Invoice No</th>
                                    <th className="py-2 px-3">Supplier</th>
                                    <th className="py-2 px-3">Items</th>
                                    <th className="py-2 px-3">Total Purchase</th>
                                    <th className="py-2 px-3">Total Qty</th>
                                    <th className="py-2 px-3">Discount</th>
                                    <th className="py-2 px-3">Payable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((p, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-3">{idx + 1}</td>
                                        <td className="py-2 px-3">{p.grnNo}</td>
                                        <td className="py-2 px-3">{p.grnDate}</td>
                                        <td className="py-2 px-3">{p.invoiceNo}</td>
                                        <td className="py-2 px-3">{p.supplier}</td>
                                        <td className="py-2 px-3">
                                            {p.items.map((it) => it.name).join(", ")}
                                        </td>
                                        <td className="py-2 px-3">{p.totalPurchase}</td>
                                        <td className="py-2 px-3">{p.totalQty}</td>
                                        <td className="py-2 px-3">{p.discountAmount}</td>
                                        <td className="py-2 px-3">{p.payable}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Purchase Drawer */}
            {purchaseDrawerOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                    <div className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
                        <h1 className="text-xl font-bold text-right text-newPrimary px-4 py-2">
                            PURCHASE ITEM ENTRY
                        </h1>

                        {/* Section 1 */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="GRN No"
                                className="border p-2"
                                value={formData.grnNo}
                                onChange={(e) =>
                                    setFormData({ ...formData, grnNo: e.target.value })
                                }
                            />
                            <input
                                type="date"
                                className="border p-2"
                                value={formData.grnDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, grnDate: e.target.value })
                                }
                            />
                            <select
                                className="border p-2"
                                value={formData.supplier}
                                onChange={(e) =>
                                    setFormData({ ...formData, supplier: e.target.value })
                                }
                            >
                                <option value="">Select Supplier</option>
                                <option>Abdullah Traders</option>
                                <option>Fresh Fruits Co</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Invoice No"
                                className="border p-2"
                                value={formData.invoiceNo}
                                onChange={(e) =>
                                    setFormData({ ...formData, invoiceNo: e.target.value })
                                }
                            />
                        </div>

                        {/* Section 2 */}
                        <div className="bg-gray-50 shadow p-4 mt-4">
                            <div className="flex justify-between mb-2">
                                <h2 className="font-bold">Items</h2>
                                <button
                                    className="bg-newPrimary hover:bg-newPrimary/70 text-white px-4 py-1 rounded"
                                    onClick={() => setSliderOpen(true)}
                                >
                                    + Add Item
                                </button>
                            </div>
                            <table className="min-w-full border mt-2">
                                <thead className="bg-gray-200 text-xs">
                                    <tr>
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">Name</th>
                                        <th className="py-2 px-3">Category</th>
                                        <th className="py-2 px-3">Purchase Price</th>
                                        <th className="py-2 px-3">Sale Price</th>
                                        <th className="py-2 px-3">Qty</th>
                                        <th className="py-2 px-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="py-2 px-3">{idx + 1}</td>
                                            <td className="py-2 px-3">{it.name}</td>
                                            <td className="py-2 px-3">{it.category}</td>
                                            <td className="py-2 px-3">{it.purchase}</td>
                                            <td className="py-2 px-3">{it.sale}</td>
                                            <td className="py-2 px-3">{it.qty}</td>
                                            <td className="py-2 px-3">{it.purchase * it.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>

                        {/* Section 3 */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>Total Price: {totalPurchase}</div>
                            <input
                                type="number"
                                placeholder="Discount %"
                                className="border p-2"
                                value={formData.discountPercent}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountPercent: Number(e.target.value),
                                    })
                                }
                            />
                            <div>Discount: {discountAmount}</div>
                            <div>Payable: {payable}</div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-4 flex gap-2">
                            <button
                                className="bg-newPrimary hover:bg-newPrimary/80 text-white px-4 py-2 rounded"
                                onClick={handleSavePurchase}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={() => setPurchaseDrawerOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Slider */}
            {sliderOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                    <div className="w-96 bg-white p-4 h-full overflow-y-auto shadow-lg">
                        <h2 className="font-bold mb-4">Add Item</h2>
                        <label htmlFor="">Item Name:</label>
                        <input
                            type="text"
                            placeholder="Item Name"
                            className="border p-2 w-full mb-2"
                            value={newItem.name}
                            onChange={(e) =>
                                setNewItem({ ...newItem, name: e.target.value })
                            }
                        />
                        <label htmlFor="">Item Category:</label>

                        <select
                            className="border p-2 w-full mb-2"
                            value={newItem.category}
                            onChange={(e) =>
                                setNewItem({ ...newItem, category: e.target.value })
                            }
                        >
                            <option value="">Select Category</option>
                            <option>Vegetables</option>
                            <option>Fruits</option>
                        </select>
                        <label htmlFor="">Purchase</label>
                        <input
                            type="number"
                            placeholder="Purchase Price"
                            className="border p-2 w-full mb-2"
                            value={newItem.purchase}
                            onChange={(e) =>
                                setNewItem({ ...newItem, purchase: Number(e.target.value) })
                            }
                        />
                        <label htmlFor="">Sale Price:</label>
                        <input
                            type="number"
                            placeholder="Sale Price"
                            className="border p-2 w-full mb-2"
                            value={newItem.sale}
                            onChange={(e) =>
                                setNewItem({ ...newItem, sale: Number(e.target.value) })
                            }
                        />
                        <label htmlFor="">Quantity:</label>
                        <input
                            type="number"
                            placeholder="Quantity"
                            className="border p-2 w-full mb-2"
                            value={newItem.qty}
                            onChange={(e) =>
                                setNewItem({ ...newItem, qty: Number(e.target.value) })
                            }
                        />

                        <div className="flex justify-between mt-4">
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                    if (!newItem.name || !newItem.category || !newItem.purchase || !newItem.qty) {
                                        alert("Please fill all required fields!");
                                        return;
                                    }

                                    // Add item to list
                                    setItems((prev) => [...prev, newItem]);

                                    // Reset fields
                                    setNewItem({
                                        name: "",
                                        category: "",
                                        purchase: 0,
                                        sale: 0,
                                        unit: "",
                                        qty: 0,
                                    });

                                    // Close slider
                                    setSliderOpen(false);
                                }}
                            >
                                Add
                            </button>

                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={() => setSliderOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}