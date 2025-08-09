import React, { useState } from "react";

const FollowUp = () => {
  const followUpList = [
    { customerName: "John Doe", customerNumber: "12345", customerDescription: "Discuss product demo", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Jane Smith", customerNumber: "67890", customerDescription: "Follow up on payment", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Alice Johnson", customerNumber: "11223", customerDescription: "Review contract", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Bob Wilson", customerNumber: "44556", customerDescription: "Schedule meeting", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Charlie Brown", customerNumber: "77889", customerDescription: "Send proposal", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Dana White", customerNumber: "99001", customerDescription: "Check availability", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Eve Davis", customerNumber: "22334", customerDescription: "Confirm order", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Frank Miller", customerNumber: "55667", customerDescription: "Discuss feedback", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Grace Lee", customerNumber: "88990", customerDescription: "Arrange call", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
    { customerName: "Henry Clark", customerNumber: "11223", customerDescription: "Follow up email", date: "23 Jul, 2025", time: "12:30 PM", status: "Active" },
  ];

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerDescription, setCustomerDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("Active");

  const handleAddFollowUp = () => {
    setIsSliderOpen(true);
  };

  const handleSave = () => {
    console.log("Saving:", { customerName, customerNumber, customerDescription, date, time, status });
    setIsSliderOpen(false);
    setCustomerName("");
    setCustomerNumber("");
    setCustomerDescription("");
    setDate("");
    setTime("");
    setStatus("Active");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Follow Up</h1>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary"
          onClick={handleAddFollowUp}
        >
          + Add Follow Up
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-secondary/10">
                <th className="py-3 px-4 text-left text-gray-900">Customer Name</th>
                <th className="py-3 px-4 text-left text-gray-900">Customer Number</th>
                <th className="py-3 px-4 text-left text-gray-900">Customer Description</th>
                <th className="py-3 px-4 text-left text-gray-900">Date</th>
                <th className="py-3 px-4 text-left text-gray-900">Time</th>
                <th className="py-3 px-4 text-left text-gray-900">Active or Non Active</th>
              </tr>
            </thead>
            <tbody>
              {followUpList.map((followUp, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{followUp.customerName || "N/A"}</td>
                  <td className="py-3 px-4">{followUp.customerNumber || "N/A"}</td>
                  <td className="py-3 px-4">{followUp.customerDescription || "N/A"}</td>
                  <td className="py-3 px-4">{followUp.date || "N/A"}</td>
                  <td className="py-3 px-4">{followUp.time || "N/A"}</td>
                  <td className="py-3 px-4">
                    <span className={followUp.status === "Active" ? "text-green-600" : "text-red-600"}>
                      {followUp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-newPrimary">Add Follow Up</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Customer Number</label>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Customer Description</label>
                <input
                  type="text"
                  value={customerDescription}
                  onChange={(e) => setCustomerDescription(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary focus:border-newPrimary"
                >
                  <option value="Active">Active</option>
                  <option value="Non Active">Non Active</option>
                </select>
              </div>
              <button
                className="w-full bg-newPrimary text-white py-2 rounded-md hover:bg-newPrimary transition-colors"
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

export default FollowUp;