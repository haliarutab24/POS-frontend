import React, { useState, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const sliderRef = useRef(null);

  // Static data for categories (for demonstration)
  const staticCategories = [
    { _id: "001", name: "Electronics", isEnable: true, createdAt: "2025-01-15T10:00:00Z" },
    { _id: "002", name: "Clothes", isEnable: true, createdAt: "2025-02-20T12:00:00Z" },
    { _id: "003", name: "Furniture", isEnable: false, createdAt: "2025-03-10T09:00:00Z" },
    { _id: "004", name: "Books", isEnable: true, createdAt: "2025-04-05T15:00:00Z" },
    { _id: "005", name: "Appliances", isEnable: false, createdAt: "2025-05-12T11:00:00Z" },
  ];

  // Initialize categories with static data
  useEffect(() => {
    setCategories(staticCategories);
    setTimeout(() => setLoading(false), 1000);
  }, []);

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

  // Handlers
  const handleAddClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsEnable(category.isEnable);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      toast.error("❌ Category name cannot be empty.");
      return;
    }
    setLoading(true);

    const payload = { name: trimmedName, isEnable };

    try {
      if (editingCategory) {
        setCategories(categories.map(c => (c._id === editingCategory._id ? { ...c, ...payload } : c)));
        toast.success("✅ Category updated!");
      } else {
        const newCategory = { ...payload, _id: String(categories.length + 1), createdAt: new Date().toISOString() };
        setCategories([...categories, newCategory]);
        toast.success("✅ Category added!");
      }
      setIsSliderOpen(false);
      setCategoryName("");
      setIsEnable(true);
      setEditingCategory(null);
    } catch (error) {
      toast.error(`❌ Failed to ${editingCategory ? "update" : "add"} category.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = async (category) => {
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
        text: `Do you want to ${category.isEnable ? "disable" : "enable"} this category?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Yes, ${category.isEnable ? "disable" : "enable"} it!`,
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            setCategories(categories.map(c => (c._id === category._id ? { ...c, isEnable: !category.isEnable } : c)));
            toast.success(`✅ Category ${!category.isEnable ? "enabled" : "disabled"}.`);
          } catch (error) {
            toast.error("❌ Failed to update status.");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Category status unchanged 🙂",
            "error"
          );
        }
      });
  };

  const handleDelete = async (categoryId) => {
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
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            setCategories(categories.filter(c => c._id !== categoryId));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Category deleted successfully.",
              "success"
            );
          } catch (error) {
            toast.error("❌ Failed to delete category.");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Category is safe 🙂",
            "error"
          );
        }
      });
  };

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
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">All Categories</h1>
            <p className="text-gray-500 text-sm">Manage your category details</p>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
             + Add Category
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="table-container max-w-full">
            <div className="w-full">
            <div className="hidden lg:grid grid-cols-[250px_250px_250px_250px_250px] gap-6 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
                <div>S.No.</div>
                <div>Name</div>
                <div>Status</div>
                <div>Created At</div>
                <div>Actions</div>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No categories found.
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div
                      key={category._id}
                      className="grid grid-cols-[250px_250px_250px_250px_250px] items-center gap-6 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                      <div className="text-sm font-medium text-gray-500">{index + 1}</div>
                      <div className="text-sm text-gray-500 ">{category.name}</div>
                      <div className="text-sm font-semibold ">
                        {category.isEnable ? (
                          <span className="text-green-600">Enabled</span>
                        ) : (
                          <span className="text-red-600">Disabled</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                      {/* <div className="flex justify-center"> */}
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                            <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="w-full text-left px-4 py-4 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleEnable(category)}
                              className="w-full text-left px-4 py-4 text-sm hover:bg-gray-50 text-gray-500 flex items-center gap-2"
                            >
                              {category.isEnable ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="w-full text-left px-4 py-4 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      {/* </div> */}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
            <div
              ref={sliderRef}
              className="w-full max-w-md bg-white p-4 h-full overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingCategory ? "Update Category" : "Add a New Category"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setCategoryName("");
                    setIsEnable(true);
                    setEditingCategory(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-4">
                    Category Name <span className="text-newPrimary">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. Electronics, Clothes"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Status</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEnable(!isEnable)}
                      className={`w-8 h-3 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        isEnable ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          isEnable ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600">{isEnable ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-4 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-newPrimary/50"
                >
                  {loading ? "Saving..." : "Save Category"}
                </button>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
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
            .grid-cols-\[60px_2fr_1fr_2fr_1fr\] {
              grid-template-columns: 60px 1.5fr 0.8fr 1.5fr 0.8fr;
            }
          }
          @media (max-width: 640px) {
            .grid-cols-\[60px_2fr_1fr_2fr_1fr\] {
              grid-template-columns: 50px 1.2fr 0.6fr 1.2fr 0.6fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Category;