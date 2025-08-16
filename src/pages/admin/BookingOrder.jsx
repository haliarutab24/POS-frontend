import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const BookingOrder = () => {

    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerMobile, setCustomerMobile] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [date, setDate] = useState("");
    const [time, setTimne] = useState("");

    const [formState, setEditFormState] = useState({
        name: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const [items, setItems] = useState([{ itemName: "", price: 0, qty: 1, total: 0 }]);
    const sliderRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [givenAmount, setGivenAmount] = useState(0);
    const [payable, setPayable] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log("Admin", userInfo.isAdmin);

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


    // Handlers
    const handleAddStaff = () => {
        setIsSliderOpen(true);
    };

    //  Item saved
    const handleSave = async () => {
        const formData = new FormData();
        formData.append("username", staffName);
        formData.append("department", department);
        formData.append("designation", designation);
        formData.append("address", address);
        formData.append("number", number);
        formData.append("email", email);
        formData.append("password", password);


        console.log("Form Data", formData);

        try {
            const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            };

            if (isEdit && editId) {
                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/staff/${editId}`,
                    formData,
                    { headers }
                );
                toast.success("✅ Staff updated successfully");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/staff`,
                    formData,
                    { headers }
                );
                toast.success("✅ Staff added successfully");
            }

            // Reset fields
            setStaffName("");
            setDepartment("");
            setDesignation("");
            setAddress("");
            setNumber("");
            setEmail("");
            setEditId(null);
            setIsEdit(false);
            setIsSliderOpen(false);

            // Refresh list
            fetchStaff();
        } catch (error) {
            console.error(error);
            toast.error(`❌ ${isEdit ? "Update" : "Add"} staff failed`);
        }
    };


    // Static Data for Customer Orders
    const item = [
        {
            customerName: "Ali Khan",
            mobile: "0301-1234567",
            address: "House #45, Street 10, Lahore",
            date: "2025-08-10",
            time: "2:30 PM",
            items: "2x Biryani, 1x Coke",
            nearby: "Packages Mall",
            payment: "Transfer",
            totalAmount: 9500
        },
        {
            customerName: "Sara Ahmed",
            mobile: "0321-9876543",
            address: "Flat #12, Garden Town, Karachi",
            date: "2025-08-09",
            time: "7:15 PM",
            items: "1x Pizza, 2x Garlic Bread",
            nearby: "Dolmen Mall",
            totalAmount: 4500,
            payment: "Card",
        },
        {
            customerName: "Usman Malik",
            mobile: "0333-4567890",
            address: "Bahria Town, Islamabad",
            date: "2025-08-11",
            time: "12:00 PM",
            items: "3x Shawarma",
            nearby: "Safari Mall",
            payment: "Transfer",
            totalAmount: 5000
        },
        {
            customerName: "Fatima Noor",
            mobile: "0300-5551122",
            address: "F-7 Markaz, Islamabad",
            date: "2025-08-12",
            time: "8:45 PM",
            items: "1x Burger, 1x Fries, 1x Coke",
            nearby: "Centaurus Mall",
            payment: "Card",
            totalAmount: 2500
        },
        {
            customerName: "Hamza Ali",
            mobile: "0345-6667788",
            address: "Gulshan-e-Iqbal, Karachi",
            date: "2025-08-08",
            time: "1:15 PM",
            items: "1x Zinger Burger",
            nearby: "Nipa Chowrangi",
            payment: "Cash",
            totalAmount: 1500
        },
    ];

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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-newPrimary">Customer Booking Orders</h1>
                    <p className="text-gray-500 text-sm">Manage your customer Booking order details</p>
                </div>
                <button
                    className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                    onClick={handleAddStaff}
                >
                    + Booking Order
                </button>
            </div>

            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center bg-gray-50 py-3 px-4 text-xs font-medium text-gray-500 uppercase rounded-lg">
                <div>Customer Name</div>
                <div>Mobile #</div>
                <div className="pl-4">Address</div> {/* Extra padding */}
                <div>Date</div>
                <div>Time</div>
                <div>Items</div>
                <div>Near By</div>
                <div>Total Amount</div>
                <div>Payment</div>
                {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Table Rows */}
            <div className="mt-4 flex flex-col gap-[6px]">
                {item.map((staff, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-x-8 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                        {/* Customer Name */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">
                                {staff.customerName}
                            </span>
                        </div>

                        {/* Mobile */}
                        <div className="text-sm text-gray-500">{staff.mobile}</div>

                        {/* Address */}
                        <div className="text-sm text-gray-500">{staff.address}</div>

                        {/* Date */}
                        <div className="text-sm font-semibold text-gray-500">{staff.date}</div>

                        {/* Time */}
                        <div className="text-sm font-semibold text-gray-500">{staff.time}</div>

                        {/* Items */}
                        <div className="text-sm font-semibold text-gray-500">{staff.items}</div>

                        {/* Near By */}
                        <div className="text-sm font-semibold text-gray-500">{staff.nearby}</div>

                         {/* Total Amount */}
                         <div className="text-sm font-semibold text-gray-500">{staff.totalAmount}</div>

                        {/* Payment */}
                        <div
                            className={`text-sm font-semibold ${staff.payment === "Cash"  ? "text-green-400"
                                  : staff.payment === "Card" ? "text-orange-300" 
                                  : staff.payment === "Transfer" ? "text-blue-400" 
                                  : "text-red-500"
                                }`}
                        >
                            {staff.payment}
                        </div>

                        {/* Actions */}
                        {userInfo?.isAdmin && (
                            <div className="text-right relative group">
                                <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                                <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
            opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
            transition-opacity duration-300 z-50 flex flex-col justify-between">
                                    <button
                                        onClick={() => handleEdit(staff)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(staff._id)}
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



            {/* Slider */}
            {isSliderOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
                    <div
                        ref={sliderRef}
                        className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-newPrimary">
                                {isEdit ? "Update Item" : "Add a New Item"}
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

                        <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
                            {/*  Customer Name */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Customer Name <span className="text-newPrimary">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
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
                                    value={customerMobile}
                                    required
                                    onChange={(e) => setCustomerMobile(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={customerAddress}
                                    required
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Date <span className="text-newPrimary">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    required
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />

                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-gray-700 font-medium">
                                    Time <span className="text-newPrimary">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={time}
                                    required
                                    onChange={(e) => setTimne(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

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

                             {/* payment */}
                             <div>
                                <label className="block text-gray-700 font-bold mb-2">Payment <span className="text-newPrimary">*</span></label>
                                <select
                                    // value={supplier}
                                    required
                                    // onChange={(e) => setSupplier(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select Payment</option>
                                    <option value="ABC Traders">Cash</option>
                                    <option value="HomeDeco">Tranfer</option>
                                    <option value="KitchenPro">Card</option>
                                </select>
                            </div>


                            <div className="mb-2 font-bold">Payable Amount: {payable}</div>
                            <div className="mb-4 font-bold">Return Amount: {returnAmount}</div>


                            {/* Save Button */}
                            <button
                                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
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
