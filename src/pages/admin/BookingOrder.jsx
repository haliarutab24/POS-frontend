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

    const [suggestions, setSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchIndex, setSearchIndex] = useState(null);
    const [formData, setFormData] = useState({
        customerName: "",
        mobileNo: "",
        date: "",
        time: "",
        bookingDate: "",
        items: [{ itemName: "", price: 0, qty: 1, total: 0 }],
        discount: 0,
        payable: 0,
        paid: 0,
        balance: 0,
        paymentMethod: "",
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



    // Handlers
    const handleAddStaff = () => {
        setIsSliderOpen(true);
    };

    //  Booking customer  saved
    const handleSave = async () => {

        const bookingData = {
            customerName: formData.customerName,
            mobileNo: formData.mobileNo,
            address: formData.address,
            date: formData.date,
            time: formData.time,
            items: formData.items,
            discount: formData.discount,
            payable: formData.payable,
            paid: formData.paid,
            balance: formData.balance,
            paymentMethod: formData.paymentMethod,
        };

        console.log("Booking Data", bookingData);

        try {
            const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            if (isEdit && editId) {
                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/bookings/${editId}`,
                    bookingData,
                    { headers }
                );
                toast.success("✅ Booking updated successfully");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/bookings`,
                    bookingData,
                    { headers }
                );
                toast.success("✅ Booking created successfully");
            }

            // Reset fields
            setCustomerName("");
            setMobileNo("");
            setAddress("");
            setDate("");
            setTime("");
            setItems([]);
            setDiscount(0);
            setPaid(0);
            setPaymentMethod("");
            setEditId(null);
            setIsEdit(false);
            setIsSliderOpen(false);

            // Refresh list
            fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error(`❌ ${isEdit ? "Update" : "Create"} booking failed`);
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
                    className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
                    onClick={handleAddStaff}
                >
                    + Booking Order
                </button>
            </div>

            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center bg-gray-50 py-3 px-4 text-xs font-medium text-gray-500 uppercase rounded-lg">
                <div>Customer Name</div>
                <div>Mobile No.</div>
                <div className="pl-4">Address</div> {/* Extra padding */}
                <div>Items</div>
                <div>Near By</div>
                <div>Total</div>
                <div>Discount</div>
                <div>Payable</div>
                <div>Paid</div>
                <div>Balance</div>
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

                        {/* Items */}
                        <div className="text-sm font-semibold text-gray-500">{staff.items}</div>

                        {/* Near By */}
                        <div className="text-sm font-semibold text-gray-500">{staff.nearby}</div>

                        {/* Total Amount */}
                        <div className="text-sm font-semibold text-gray-500">{staff.totalAmount}</div>

                        {/* Payment */}
                        <div
                            className={`text-sm font-semibold ${staff.payment === "Cash" ? "text-green-400"
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
                                <div key={i} className="relative flex gap-2 mb-2">
                                    <input
                                        placeholder="Item Name"
                                        className="border p-2 flex-1"
                                        value={item.itemName}
                                        onChange={(e) => handleInputChange(e.target.value, i)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="border p-2 w-20"
                                        value={item.price}
                                        readOnly
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

                                    {/* Suggestions dropdown (inside map, so i exists) */}
                                    {suggestions.length > 0 && searchIndex === i && (
                                        <ul className="absolute bg-white border w-[12.5rem] mt-10 z-10">
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

                            {/* Add Item Button */}
                            <button
                                onClick={addItemRow}
                                className="text-green-600 font-semibold hover:underline mb-4"
                            >
                                + Add Item
                            </button>

                            {/* Totals */}
                            <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 text-gray-700">Order Summary</h3>

                                {/* Discount */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Discount
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Discount"
                                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                        value={discount}
                                        onChange={(e) => {
                                            setDiscount(parseFloat(e.target.value));
                                            calculateTotals(items, parseFloat(e.target.value), givenAmount);
                                        }}
                                    />
                                </div>

                                {/* Given Amount */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Given Amount
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Given Amount"
                                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                        value={givenAmount}
                                        onChange={(e) => {
                                            setGivenAmount(parseFloat(e.target.value));
                                            calculateTotals(items, discount, parseFloat(e.target.value));
                                        }}
                                    />
                                </div>
                            </div>


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
                                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
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
