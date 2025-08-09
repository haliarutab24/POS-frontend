import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners"; 

const Category = () => {
  // State for the list of categories
  const [categories, setCategories] = useState([]);
  
  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for the form
  const [categoryName, setCategoryName] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`);
        setCategories(Array.isArray(data.data) ? data.data : []);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        toast.error("Failed to fetch categories.");
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <PuffLoader color="#00c7fc" />
      </div>
    );
  }

  // Open modal for adding
  const handleAddClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsEnable(true);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsEnable(category.isEnable);
    setShowModal(true);
  };

  // Handle create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { name: categoryName, isEnable };
    const url = editingCategory
      ? `${import.meta.env.VITE_API_BASE_URL}/categories/${editingCategory._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/categories`;
    const method = editingCategory ? 'patch' : 'post';

    try {
      const { data } = await axios[method](url, payload);
      if (editingCategory) {
        setCategories(categories.map(c => (c._id === editingCategory._id ? data.data : c)));
        toast.success("Category updated!");
      } else {
        setCategories([...categories, data.data]);
        toast.success("Category added!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(`Failed to ${editingCategory ? 'update' : 'add'} category.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle enable/disable toggle
  const handleToggleEnable = async (category) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/categories/${category._id}`,
        { isEnable: !category.isEnable }
      );
      setCategories(categories.map(c => (c._id === category._id ? data.data : c)));
      toast.success(`Category ${!category.isEnable ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/categories/${categoryId}`);
        setCategories(categories.filter(c => c._id !== categoryId));
        toast.error("Category deleted.");
      } catch (error) {
        toast.error("Failed to delete category.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Categories</h1>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-all"
        >
          <span className="text-xl">+</span>
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left w-16">S.No.</th>
              <th className="py-2 px-4 text-left w-1/3">Name</th>
              <th className="py-2 px-4 text-left w-1/4">Status</th>
              <th className="py-2 px-4 text-left">Created At</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr key={category._id} className="border-b">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{category.name}</td>
                  <td className="py-2 px-4">
                    {category.isEnable ? (
                      <span className="text-green-600 font-semibold">Enabled</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Disabled</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {/* Flex container for responsive layout */}
                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:justify-end">
                      <button
                        onClick={() => handleToggleEnable(category)}
                        className="w-20 px-3 py-1 rounded text-white text-xs font-semibold text-center transition-colors
                                   bg-gray-500 hover:bg-gray-600
                                   data-[enabled=true]:bg-green-500 data-[enabled=true]:hover:bg-green-600"
                        data-enabled={!category.isEnable}
                      >
                        {category.isEnable ? "Disable" : "Enable"}
                      </button>
                      <button 
                        onClick={() => handleEditClick(category)}
                        className="w-20 px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold text-center transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(category._id)}
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="categoryName">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Electronics, Clothes"
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
                Enable Category
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

export default Category;
