import React, { useEffect, useState } from "react";
import axios from "axios";
import { PuffLoader } from "react-spinners";
import { toast } from "react-toastify";

const Promotion = () => {
  // State for the list of promotions
  const [promotions, setPromotions] = useState([]);

  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for the form (can be for new or editing)
  const [promoName, setPromoName] = useState("");
  const [isEnable, setIsEnable] = useState(true); // New state for the checkbox
  const [editingPromo, setEditingPromo] = useState(null);

  // Fetch all promotions on component mount
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/promotions`);
        setPromotions(Array.isArray(data.data) ? data.data : []);
        setTimeout(() => {
          setLoading(false);
        }, 1500);

      } catch (error) {
        toast.error("Failed to fetch promotions.");
        setPromotions([]);
      }
    };
    fetchPromotions();
  }, []);

  // Handle opening the modal for creating
  const handleAddClick = () => {
    setEditingPromo(null);
    setPromoName("");
    setIsEnable(true); // Default to enabled
    setShowModal(true);
  };

  // Handle opening the modal for editing
  const handleEditClick = (promo) => {
    setEditingPromo(promo);
    setPromoName(promo.name);
    setIsEnable(promo.isEnable); // Set current status
    setShowModal(true);
  };

  // Handle form submission (for both create and update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { name: promoName, isEnable };
    const url = editingPromo
      ? `${import.meta.env.VITE_API_BASE_URL}/promotions/${editingPromo._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/promotions`;
    const method = editingPromo ? 'patch' : 'post';

    try {
      const { data } = await axios[method](url, payload);
      if (editingPromo) {
        setPromotions(promotions.map(p => (p._id === editingPromo._id ? data.data : p)));
        toast.success("Promotion updated!");
      } else {
        setPromotions([...promotions, data.data]);
        toast.success("Promotion added!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(`Failed to ${editingPromo ? 'update' : 'add'} promotion.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling the isEnable status directly from the table
  const handleToggleEnable = async (promo) => {
    console.log("Prp", promo);

    const newStatus = !promo.isEnable;
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/promotions/${promo._id}`,
        { isEnable: newStatus }
      );
      setPromotions(promotions.map(p => (p._id === promo._id ? data.data : p)));

    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <PuffLoader color="#00c7fc" />
      </div>
    );
  }


  // Handle deleting a promotion
  const handleDelete = async (promoId) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/promotions/${promoId}`);
        setPromotions(promotions.filter(p => p._id !== promoId));
        toast.error("Promotion deleted.");
      } catch (error) {
        toast.error("Failed to delete promotion.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Promotions</h1>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-all"
        >
          <span className="text-xl">+</span>
          <span>Add Promotion</span>
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left w-16">S.No.</th>
              <th className="py-2 px-4 text-left w-1/3">Name</th> {/* Wider Name column */}
              <th className="py-2 px-4 text-left w-1/4">Status</th> {/* Wider Status column */}
              <th className="py-2 px-4 text-left">Created At</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No promotions found.
                </td>
              </tr>
            ) : (
              promotions.map((promo, index) => (
                <tr key={promo._id} className="border-b">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{promo.name}</td>
                  <td className="py-2 px-4">
                    {promo.isEnable ? (
                      <span className="text-green-600 font-semibold">Enabled</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Disabled</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(promo.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {/* Flex container for responsive layout */}
                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:justify-end">
                      <button
                        onClick={() => handleToggleEnable(promo)}
                        className={`w-20 px-3 py-1 rounded text-white text-xs font-semibold text-center transition-colors ${promo.isEnable ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                      >
                        {promo.isEnable ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleEditClick(promo)}
                        className="w-20 px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold text-center transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="w-20 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold text-center transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-6 text-primary text-center">
              {editingPromo ? "Edit Promotion" : "Add Promotion"}
            </h2>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="promoName">
                Promotion Name
              </label>
              <input
                id="promoName"
                type="text"
                value={promoName}
                onChange={(e) => setPromoName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Discount, Eid Offer"
                required
              />
            </div>
            <div className="w-full mb-6 flex items-center">
              <input
                id="isEnable"
                type="checkbox"
                checked={isEnable}
                onChange={(e) => setIsEnable(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900" htmlFor="isEnable">
                Enable Promotion
              </label>
            </div>
            <div className="flex w-full gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition-all"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Promotion;
