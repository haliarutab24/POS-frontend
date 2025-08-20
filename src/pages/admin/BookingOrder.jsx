import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const BookingOrder = () => {

    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [item, setItem] = useState([]);
    // ===== State =====
    const [formData, setFormData] = useState({
        customerName: "",
        mobileNo: "",
        address: "",
        date: "",
        time: "",
        items: [{ itemName: "", rate: 0, qty: 1, amount: 0 }],
        discount: 0,
        payable: 0,
        paid: 0,
        balance: 0,
        paymentMethod: "",
    });

    const [items, setItems] = useState([{ itemName: "", rate: 0, qty: 1, amount: 0 }]);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [payable, setPayable] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [givenAmount, setGivenAmount] = useState(0);

    // ===== Handle item changes =====
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];

        // Standardize field names: always use "rate" and "qty"
        if (field === "rate" || field === "qty") {
            updatedItems[index][field] = Number(value) || 0;
        } else {
            updatedItems[index][field] = value || "";
        }

        // Always calculate amount
        updatedItems[index].amount = (updatedItems[index].rate || 0) * (updatedItems[index].qty || 0);

        setItems(updatedItems);

        // Recalculate totals using numeric values
        calculateTotals(updatedItems, Number(discount) || 0, Number(givenAmount) || 0);
    };



    // ===== Calculate totals =====
    const calculateTotals = (itemsList, disc = 0, given = 0) => {
        const totalBill = itemsList.reduce((sum, item) => sum + (item.amount || 0), 0);

        const payableAmt = totalBill - Number(disc || 0);
        const returnAmt = Number(given || 0) - payableAmt;

        // Update states
        setPayable(payableAmt);
        setReturnAmount(returnAmt);

        setFormData((prev) => ({
            ...prev,
            total: totalBill,
            payable: payableAmt,
            balance: returnAmt,
            items: itemsList.map((i) => ({
                itemName: i.itemName || "",
                rate: Number(i.rate) || 0,
                qty: Number(i.qty) || 0,
                amount: Number(i.amount) || 0,
            })),
        }));

        console.log("Payable calculated:", payableAmt);
    };




    // ===== Add / Remove Item =====
    const addItemRow = () => {
        const newItem = { itemName: "", rate: 0, qty: 1, amount: 0 };
        setItems([...items, newItem]);
    };

    const removeItemRow = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        calculateTotals(updatedItems, discount, givenAmount);
    };

    // ===== Save Booking =====
    const handleSave = async () => {
        try {
            // Ensure all numbers
            const normalizedItems = items.map((i) => ({
                itemName: i.itemName || "",
                rate: parseFloat(i.rate) || 0,
                qty: parseFloat(i.qty) || 0,
                amount: parseFloat(i.amount) || 0,
            }));

            const total = normalizedItems.reduce((sum, i) => sum + i.amount, 0);
            const payableAmt = total - parseFloat(discount || 0);
            const balanceAmt = parseFloat(givenAmount || 0) - payableAmt;

            const bookingData = {
                ...formData,
                items: normalizedItems,
                total,
                payable: payableAmt,
                balance: balanceAmt,
                discount: parseFloat(discount || 0),
                paid: parseFloat(formData.paid || 0),
                paymentMethod: formData.paymentMethod || "",
            };

            const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
            const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

            if (isEdit && editId) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/bookings/${editId}`, bookingData, { headers });
                toast.success("✅ Booking updated successfully");
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bookings`, bookingData, { headers });
                toast.success("✅ Booking created successfully");
            }

            // Reset
            setFormData({
                customerName: "",
                mobileNo: "",
                address: "",
                date: "",
                time: "",
                items: [{ itemName: "", rate: 0, qty: 1, amount: 0 }],
                discount: 0,
                payable: 0,
                paid: 0,
                balance: 0,
                paymentMethod: "",
            });
            setItems([{ itemName: "", rate: 0, qty: 1, amount: 0 }]);
            setDiscount(0);
            setGivenAmount(0);
            setPayable(0);
            setReturnAmount(0);
            setIsEdit(false);
            setEditId(null);
            setIsSliderOpen(false);

            // fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error(`❌ ${isEdit ? "Update" : "Create"} booking failed`);
        }
    };



    const [suggestions, setSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchIndex, setSearchIndex] = useState(null);
    const sliderRef = useRef(null);
    const [loading, setLoading] = useState(true);


    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // console.log("Admin", userInfo.isAdmin);

    // slider styling
    useEffect(() => {
        if (isSliderOpen && sliderRef.current) {
            gsap.fromTo(
                sliderRef.current,
                { x: "100%", opacity: 0 }, // offscreen right
                {
                    x: "0%",
                    opacity: 1,
                    duration: 1.2,
                    ease: "expo.out", // smoother easing
                }
            );
        }
    }, [isSliderOpen]);

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


    // Fetch Booking Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookings`);
            setItem(res.data); // store actual categories array
            console.log("Booking Data", res.data);
        } catch (error) {
            console.error("Failed to fetch booking or categories", error);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }, []);

    // Initialize shelve location list with static data
    useEffect(() => {

        fetchData();
    }, [fetchData]);

    const handleSearch = (selectedItem, index) => {
        handleItemChange(index, "itemName", selectedItem.itemName);
        handleItemChange(index, "rate", selectedItem.price); // fill price
        setSearchValue("");   // hide suggestions
        setSuggestions([]);
    };



    const handleInputChange = (value, index) => {
        handleItemChange(index, "itemName", value); // update input field
        setSearchValue(value); // trigger useEffect for suggestions
        setSearchIndex(index); // track which row the suggestions belong to
    };




    // Handlers
    const handleAddStaff = () => {
        setIsSliderOpen(true);
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
                            `${import.meta.env.VITE_API_BASE_URL}/bookings/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${userInfo.token}` // if you’re using auth
                                }
                            }
                        );
                        setItem(item.filter((s) => s._id !== id));
                        swalWithTailwindButtons.fire(
                            "Deleted!",
                            "Booking Customer deleted successfully.",
                            "success"
                        );
                        fetchData()
                    } catch (error) {
                        console.error("Delete error:", error);
                        swalWithTailwindButtons.fire(
                            "Error!",
                            "Failed to delete booking customer.",
                            "error"
                        );
                    }
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithTailwindButtons.fire(
                        "Cancelled",
                        "Booking Customer is safe 🙂",
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
                    <PuffLoader height="150" width="150" radius={1} color="#00809D" />
                </div>
            </div>
        );
    }




    return (
        <div className="p-6 bg-gray-50 min-h-screen">
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <div>
                   <h1 className="text-xl sm:text-2xl font-bold text-newPrimary">Customer Booking Orders</h1>
                    {/* <p className="text-gray-500 text-sm">Manage your customer Booking order details</p> */}
                </div>
                <button
                    className="bg-newPrimary text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-primaryDark w-full sm:w-auto"
                    onClick={handleAddStaff}
                >
                    + Booking Order
                </button>
            </div>

            <div className="rounded-xl shadow p-4 sm:p-6 border border-gray-100">
                {/* Mobile Cards (show on small screens) */}
                <div className="lg:hidden space-y-4">
                    {item.map((staff, index) => {
                        const total = staff.total?.$numberInt || staff.total || 0;
                        const discount = staff.discount?.$numberInt || staff.discount || 0;
                        const payable = staff.payable?.$numberInt || staff.payable || 0;
                        const paid = staff.paid?.$numberInt || staff.paid || 0;
                        const balance = staff.balance?.$numberInt || staff.balance || 0;

                        return (
                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-sm font-medium text-gray-500">Customer Name</div>
                                    <div className="text-sm text-gray-900">{staff.customerName || "—"}</div>

                                    <div className="text-sm font-medium text-gray-500">Mobile No.</div>
                                    <div className="text-sm text-gray-900">{staff.mobileNo || "—"}</div>

                                    <div className="text-sm font-medium text-gray-500">Address</div>
                                    <div className="text-sm text-gray-900 truncate">{staff.address || "—"}</div>

                                    <div className="text-sm font-medium text-gray-500">Items</div>
                                    <div className="text-sm text-gray-900">
                                        {Array.isArray(staff.items) && staff.items.length > 0
                                            ? staff.items
                                                .map(item => {
                                                    const qty = item.qty?.$numberInt || item.qty || 0;
                                                    return `${item.itemName || ""} (${qty}x)`;
                                                })
                                                .join(", ")
                                            : "—"}
                                    </div>

                                    <div className="text-sm font-medium text-gray-500">Total</div>
                                    <div className="text-sm text-gray-900">{total}</div>

                                    <div className="text-sm font-medium text-gray-500">Discount</div>
                                    <div className="text-sm text-gray-900">{discount}</div>

                                    <div className="text-sm font-medium text-gray-500">Payable</div>
                                    <div className="text-sm text-gray-900">{payable}</div>

                                    <div className="text-sm font-medium text-gray-500">Paid</div>
                                    <div className="text-sm text-gray-900">{paid}</div>

                                    <div className="text-sm font-medium text-gray-500">Balance</div>
                                    <div className="text-sm text-gray-900">{balance}</div>

                                    <div className="text-sm font-medium text-gray-500">Payment Method</div>
                                    <div className={`text-sm font-semibold ${staff.paymentMethod === "Cash" ? "text-green-500" :
                                            staff.paymentMethod === "Card" ? "text-orange-400" :
                                                staff.paymentMethod === "Transfer" ? "text-blue-500" :
                                                    "text-gray-500"
                                        }`}>
                                        {staff.paymentMethod || "—"}
                                    </div>
                                </div>

                                {userInfo?.isAdmin && (
                                    <div className="mt-4 flex justify-end">
                                        <div className="relative group">
                                            <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                                            <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                                                <button
                                                    onClick={() => handleEditClick(staff)}
                                                    className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(staff._id)}
                                                    className="w-full text-left px-4 py-4 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Table (show on large screens) */}
                <div className="hidden lg:block overflow-x-auto">
                    <div className="min-w-[1400px]">
                        {/* Table header */}
                        <div className="grid grid-cols-[1.5fr_1fr_2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center bg-gray-50 py-3 px-4 text-xs font-medium text-gray-500 uppercase rounded-lg gap-x-4">
                            <div>Customer Name</div>
                            <div>Mobile No.</div>
                            <div>Address</div>
                            <div>Items</div>
                            <div>Total</div>
                            <div>Discount</div>
                            <div>Payable</div>
                            <div>Paid</div>
                            <div>Payment Method</div>
                            <div>Balance</div>
                            {userInfo?.isAdmin && <div className="text-right">Actions</div>}
                        </div>

                        {/* Table rows - using the fixed code from above */}
                        <div className="mt-4 flex flex-col gap-3">
                            {item.map((staff, index) => {
                                const total = staff.total?.$numberInt || staff.total || 0;
                                const discount = staff.discount?.$numberInt || staff.discount || 0;
                                const payable = staff.payable?.$numberInt || staff.payable || 0;
                                const paid = staff.paid?.$numberInt || staff.paid || 0;
                                const balance = staff.balance?.$numberInt || staff.balance || 0;

                                return (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[1.5fr_1fr_2fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-x-4 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                                    >
                                        <div className="text-sm font-medium text-gray-900 min-w-[120px]">
                                            {staff.customerName || "—"}
                                        </div>
                                        <div className="text-sm text-gray-500 min-w-[100px]">
                                            {staff.mobileNo || "—"}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate min-w-[150px]">
                                            {staff.address || "—"}
                                        </div>

                                        {/* Items */}
                                        <div className="text-sm font-semibold text-gray-500 min-w-[180px]">
                                            {Array.isArray(staff.items) && staff.items.length > 0
                                                ? staff.items
                                                    .map(item => {
                                                        const qty = item.qty?.$numberInt || item.qty || 0;
                                                        return `${item.itemName || ""} (${qty}x)`;
                                                    })
                                                    .join(", ")
                                                : "—"}
                                        </div>

                                        <div className="text-sm font-semibold text-gray-500 min-w-[80px]">
                                            {total}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-500 min-w-[80px]">
                                            {discount}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-500 min-w-[80px]">
                                            {payable}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-500 min-w-[80px]">
                                            {paid}
                                        </div>
                                        <div className={`text-sm font-semibold min-w-[100px] ${staff.paymentMethod === "Cash" ? "text-green-500" :
                                                staff.paymentMethod === "Card" ? "text-orange-400" :
                                                    staff.paymentMethod === "Transfer" ? "text-blue-500" :
                                                        "text-gray-500"
                                            }`}>
                                            {staff.paymentMethod || "—"}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-500 min-w-[80px]">
                                            {balance}
                                        </div>

                                        {userInfo?.isAdmin && (
                                            <div className="relative group min-w-[60px]">
                                                <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                                                <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                                                    <button
                                                        onClick={() => handleEditClick(staff)}
                                                        className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(staff._id)}
                                                        className="w-full text-left px-4 py-4 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>



            {/* Slider */}
            {isSliderOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                    <div
                        ref={sliderRef}
                        className="
        bg-white p-6 h-full overflow-y-auto shadow-lg
        w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-1/3
        max-w-[600px]
        transition-all duration-300
      "
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-newPrimary">
                                {isEdit ? "Update Customer Booking" : "New Customer Booking"}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                                onClick={() => {
                                    setIsSliderOpen(false);
                                    setIsEdit(false);
                                    setEditId(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Form Container */}
                        <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
                            {/* Customer Name */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Customer Name <span className="text-newPrimary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Mobile # */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Mobile No. <span className="text-newPrimary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.mobileNo}
                                    required
                                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-gray-700 font-medium">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    required
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium">
                                        Date <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        required
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium">
                                        Time <span className="text-newPrimary">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        required
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            {items.map((item, i) => (
                                <div key={i} className="relative flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                                    <input
                                        placeholder="Item Name"
                                        className="border p-2 flex-1"
                                        value={searchIndex === i ? searchValue : item.itemName}
                                        onChange={(e) => {
                                            setSearchValue(e.target.value);
                                            setSearchIndex(i);
                                        }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Rate"
                                        className="border p-2 w-full sm:w-20"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(i, "rate", e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="border p-2 w-full sm:w-16"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(i, "qty", e.target.value)}
                                    />
                                    <div className="p-2 w-full sm:w-20 text-right">{item.amount}</div>
                                    <button
                                        onClick={() => removeItemRow(i)}
                                        className="text-red-500 hover:underline"
                                    >
                                        X
                                    </button>

                                    {/* Suggestions */}
                                    {suggestions.length > 0 && searchIndex === i && (
                                        <ul className="absolute bg-white border w-full sm:w-[12.5rem] mt-10 z-10">
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
                                className="text-green-600 font-semibold hover:underline mb-4"
                            >
                                + Add Item
                            </button>

                            {/* Totals */}
                            <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm space-y-2">
                                <h3 className="font-bold text-lg mb-2 text-gray-700">Order Summary</h3>
                                <input
                                    type="number"
                                    placeholder="Discount"
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    value={discount || 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setDiscount(val);
                                        calculateTotals(items, val, givenAmount);
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Given Amount"
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    value={givenAmount || 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setGivenAmount(val);
                                        calculateTotals(items, discount, val);
                                    }}
                                />
                            </div>

                            {/* Payment */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Payment <span className="text-newPrimary">*</span>
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    required
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select Payment</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="mb-2 font-bold">Payable Amount: {payable}</div>
                            <div className="mb-4 font-bold">Return Amount: {returnAmount}</div>

                            {/* Save Button */}
                            <button
                                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-green-500 w-full"
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

export default BookingOrder;
