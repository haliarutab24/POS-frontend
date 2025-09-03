import React, { useState, useRef, useEffect, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";

export default function PurchaseManager() {
    const [view, setView] = useState("list"); // list | form
    const [purchases, setPurchases] = useState([]);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
    const sliderRef = useRef(null);
    const [supplierList, setSupplierList] = useState([])
    const [formData, setFormData] = useState({
        grnNo: "",
        grnDate: new Date().toISOString().split("T")[0],
        supplier: "",
        invoiceNo: "",
        discountPercent: 0,
    });
    const [items, setItems] = useState([]);
    const [newGrn, setNewGrn] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        category: "",
        purchase: 0,
        sale: 0,
        unit: "",
        qty: 0,
    });

    const totalPrice = items.reduce((sum, item) => sum + item.purchase * item.qty, 0);

    const [editId, setEditId] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPurchase, setEditingPurchase] = useState(null);


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

    // Fetch Purchases Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/purchases`);
            setPurchases(res.data); // store actual categories array
            console.log("Item Purchase", res.data);
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


    // Last GRN No.
    useEffect(() => {
        const fetchLastGRN = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/purchases/last`
                );

                const data = res.data;
                console.log("Latest GRN:", data.grnNo); // 1002

                const nextGrn = String(parseInt(data.grnNo, 10) + 1).padStart(4, "0");
                console.log("New GRN:", nextGrn);

                setNewGrn(nextGrn); // ✅ store in state
            } catch (err) {
                console.error(err);
            }
        };

        fetchLastGRN();
    }, [purchases]);



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


    // Total calculations
    const totalPurchase = items.reduce(
        (acc, item) => acc + item.purchase * item.qty,
        0
    );


    // Handle supplier selection
    const handleSupplierChange = (e) => {
        const selectedSupplierId = e.target.value;
        const selectedSupplier = supplierList.find(s => s._id === selectedSupplierId);

        setFormData({
            ...formData,
            supplier: selectedSupplierId,
            invoiceNo: selectedSupplier?.invoiceNo || "", // auto set invoice number
        });
    };

    const totalQty = items.reduce((acc, item) => acc + Number(item.qty), 0);
    const discountAmount = (totalPurchase * formData.discountPercent) / 100;
    const payable = totalPurchase - discountAmount;

    const handleSavePurchase = async () => {
        // Validation
        if (!formData.grnDate || !formData.supplier || !formData.invoiceNo || items.length === 0) {
            toast.error("❌ Please fill all required fields!");
            return;
        }

        // Prepare payload matching backend
        const payload = {
            grnNo: newGrn,
            grnDate: formData.grnDate,
            supplier: formData.supplier,
            invoiceNo: formData.invoiceNo,
            items: items.map((i) => ({
                name: i.name,
                category: i.category,
                purchase: i.purchase,
                sale: i.sale,
                qty: i.qty,
                total: i.total,
            })),
            discountPercent: formData.discountPercent,
            discountAmount,
            totalPrice,
            payable,
        };

        try {
            const headers = {
                Authorization: `Bearer ${userInfo.token}`,
                "Content-Type": "application/json",
            };

            if (editingPurchase && editId) {
                // Update existing purchase
                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/purchases/${editId}`,
                    payload,
                    { headers }
                );
                toast.success("✅ Purchase updated successfully!");
            } else {
                // Create new purchase
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/purchases`,
                    payload,
                    { headers }
                );
                toast.success("✅ Purchase created successfully!");
            }

            // Reset form
            setFormData({
                grnNo: "",
                grnDate: new Date().toISOString().split("T")[0],
                supplier: "",
                invoiceNo: "",
                discountPercent: 0,
            });
            setItems([]);
            setPurchaseDrawerOpen(false);
            setEditingPurchase(null);
            setEditId(null);

            // Refresh data if needed
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(`❌ ${editingPurchase ? "Update" : "Create"} purchase failed!`);
        }
    };


    const handleEditClick = (purchase) => {
        setEditingPurchase(purchase);
        setFormData({
            grnNo: purchase.grnNo,
            grnDate: purchase.grnDate,
            supplier: purchase.supplier._id,
            invoiceNo: purchase.invoiceNo,
            discountPercent: purchase.discountPercent,
        });
        setItems(purchase.items);
        setPurchaseDrawerOpen(true);
    };

    const handleDelete = (purchaseId) => {
        const swalWithTailwindButtons = Swal.mixin({
            customClass: {
                actions: "space-x-2",
                confirmButton:
                    "bg-green-500 text-white px-4 py-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
                cancelButton:
                    "bg-red-500 text-white px-4 py-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
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
            .then((result) => {
                if (result.isConfirmed) {
                    setPurchases(purchases.filter(p => p._id !== purchaseId));
                    swalWithTailwindButtons.fire(
                        "Deleted!",
                        "Purchase deleted successfully.",
                        "success"
                    );
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithTailwindButtons.fire(
                        "Cancelled",
                        "Purchase is safe 🙂",
                        "error"
                    );
                }
            });
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
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {view === "list" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-newPrimary">Purchase Items</h1>
                                <p className="text-gray-500 text-sm">Manage your purchase items details</p>
                            </div>
                            <button
                                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                                onClick={() => {
                                    setEditingPurchase(null);
                                    setFormData({
                                        grnNo: "",
                                        grnDate: new Date().toISOString().split("T")[0],
                                        supplier: "",
                                        invoiceNo: "",
                                        discountPercent: 0,
                                    });
                                    setItems([]);
                                    setPurchaseDrawerOpen(true);
                                }}
                            >
                                + Add New Purchase
                            </button>
                        </div>
                        <div className="rounded-xl shadow border border-gray-100 overflow-hidden">
                            <div className="table-container max-w-full">
                                <div className="w-full">
                                    <div className="hidden lg:grid grid-cols-[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px] gap-6 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
                                        <div>Sr.#</div>
                                        <div>GRN No</div>
                                        <div>GRN Date</div>
                                        <div>Invoice No</div>
                                        <div>Supplier</div>
                                        <div>Items</div>
                                        <div>Total Purchase</div>
                                        <div>Total Qty</div>
                                        <div>Discount</div>
                                        <div>Payable</div>
                                        <div>Actions</div>
                                    </div>
                                    <div className="flex flex-col divide-y gap-2 mx-2 mb-4 divide-gray-100">
                                        {purchases.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500">
                                                No purchases found.
                                            </div>
                                        ) : (
                                            purchases.map((p, idx) => {
                                                // Calculate total purchase and total qty
                                                const totalPurchase = p.items.reduce((sum, it) => sum + it.total, 0);
                                                const totalQty = p.items.reduce((sum, it) => sum + it.qty, 0);

                                                return (
                                                    <div
                                                        key={p._id}
                                                        className="grid grid-cols-[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px] items-center gap-6 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                                                    >
                                                        <div className="text-sm font-medium text-gray-500">{idx + 1}</div>
                                                        <div className="text-sm text-gray-500">{p.grnNo}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(p.grnDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{p.invoiceNo}</div>
                                                        <div className="text-sm text-gray-500">{p.supplier?.supplierName}</div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {p.items.map((it) => it.name).join(", ")}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{totalPurchase}</div>
                                                        <div className="text-sm text-gray-500">{totalQty}</div>
                                                        <div className="text-sm text-gray-500">{p.discountAmount}</div>
                                                        <div className="text-sm text-gray-500">{p.payable}</div>
                                                        
                                                        <div className="relative group">
                                                            <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                                                            <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                                                                <button
                                                                    onClick={() => handleEditClick(p)}
                                                                    className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(p._id)}
                                                                    className="w-full text-left px-4 py-4 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {purchaseDrawerOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                        <div className="w-full max-w-md bg-white p-4 h-full overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-xl font-bold text-newPrimary">
                                    {editingPurchase ? "Update Purchase" : "Purchase Item Entry"}
                                </h1>
                                <button
                                    className="text-2xl text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        setPurchaseDrawerOpen(false);
                                        setEditingPurchase(null);
                                        setFormData({
                                            grnNo: "",
                                            grnDate: new Date().toISOString().split("T")[0],
                                            supplier: "",
                                            invoiceNo: "",
                                            discountPercent: 0,
                                        });
                                        setItems([]);
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Purchase Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        GRN No <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        readOnly
                                        placeholder="GRN No"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newGrn}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        GRN Date <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={formData.grnDate}
                                        onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Supplier <span className="text-newPrimary">*</span>
                                    </label>
                                    <select
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={formData.supplier}
                                        onChange={handleSupplierChange}
                                    >
                                        <option value="">Select Supplier</option>
                                        {supplierList.map((supplier) => (
                                            <option key={supplier._id} value={supplier._id}>
                                                {supplier.supplierName} {/* ✅ Only string */}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Invoice No <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        readOnly
                                        placeholder="Invoice No"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={formData.invoiceNo}
                                    />
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="bg-gray-50 shadow p-4 mt-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <h2 className="font-bold text-gray-700">Items</h2>
                                    <button
                                        className="bg-newPrimary hover:bg-newPrimary/70 text-white px-4 py-1 rounded"
                                        onClick={() => setIsSliderOpen(true)}
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
                                                <td className="py-2 px-3">{it.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="text-sm text-gray-700">Total Price: {totalPrice}</div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Discount %</label>
                                    <input
                                        type="number"
                                        placeholder="Discount %"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={formData.discountPercent}
                                        onChange={(e) =>
                                            setFormData({ ...formData, discountPercent: Number(e.target.value) })
                                        }
                                    />
                                </div>
                                <div className="text-sm text-gray-700">Discount: {discountAmount}</div>
                                <div className="text-sm text-gray-700">Payable: {payable}</div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    className="w-full bg-newPrimary text-white px-4 py-4 rounded-lg hover:bg-newPrimary/80"
                                    onClick={handleSavePurchase} // ✅ Call function here
                                >
                                    {editingPurchase ? "Update Purchase" : "Save Purchase"}
                                </button>
                                <button
                                    className="w-full bg-gray-500 text-white px-4 py-4 rounded-lg hover:bg-gray-600"
                                    onClick={() => {
                                        setPurchaseDrawerOpen(false);
                                        setEditingPurchase(null);
                                        setFormData({
                                            grnNo: "",
                                            grnDate: new Date().toISOString().split("T")[0],
                                            supplier: "",
                                            invoiceNo: "",
                                            discountPercent: 0,
                                        });
                                        setItems([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Item Slider */}
                {isSliderOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                        <div
                            ref={sliderRef}
                            className="w-full max-w-md bg-white p-4 h-full overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-newPrimary">Add Item</h2>
                                <button
                                    className="text-2xl text-gray-500 hover:text-gray-700"
                                    onClick={() => setIsSliderOpen(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Item Name <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Item Name"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newItem.name}
                                        onChange={(e) =>
                                            setNewItem({ ...newItem, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Item Category <span className="text-newPrimary">*</span>
                                    </label>
                                    <select
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newItem.category}
                                        onChange={(e) =>
                                            setNewItem({ ...newItem, category: e.target.value })
                                        }
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
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Purchase Price <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Purchase Price"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newItem.purchase}
                                        onChange={(e) =>
                                            setNewItem({ ...newItem, purchase: Number(e.target.value) })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Sale Price
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Sale Price"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newItem.sale}
                                        onChange={(e) =>
                                            setNewItem({ ...newItem, sale: Number(e.target.value) })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Quantity <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={newItem.qty}
                                        onChange={(e) =>
                                            setNewItem({ ...newItem, qty: Number(e.target.value) })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between mt-4 gap-4">
                                <button
                                    className="w-full bg-newPrimary text-white px-4 py-4 rounded-lg hover:bg-green-700"
                                    onClick={() => {
                                        if (!newItem.name || !newItem.category || !newItem.purchase || !newItem.qty) {
                                            toast.error("❌ Please fill all required fields!");
                                            return;
                                        }
                                        setItems([...items, { ...newItem, total: newItem.purchase * newItem.qty }]);
                                        setNewItem({ name: "", category: "", purchase: 0, sale: 0, qty: 0 });
                                        setIsSliderOpen(false);
                                    }}
                                >
                                    Add Item
                                </button>
                                <button
                                    className="w-full bg-gray-500 text-white px-4 py-4 rounded-lg hover:bg-gray-600"
                                    onClick={() => setIsSliderOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
    .table-container {
        max-width: 100%;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #edf2f7;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #a0aec0;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #718096;
    }
    @media (max-width: 1024px) {
        .grid-cols-\[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px\] {
            grid-template-columns: 50px 80px 100px 80px 120px 150px 100px 80px 80px 80px 50px;
        }
    }
    @media (max-width: 640px) {
        .grid-cols-\[60px_100px_120px_100px_150px_200px_120px_100px_100px_100px_60px\] {
            grid-template-columns: 40px 70px 90px 70px 100px 120px 90px 70px 70px 70px 40px;
        }
    }
`}</style>

        </div>
    );
}