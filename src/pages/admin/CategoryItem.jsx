import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);


  // Initialize categories with static data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`);
      setCategories(res.data); // store actual categories array
      console.log("Categories", res.data);
    } catch (error) {
      console.error("Failed to fetch products or categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {

    fetchData();
  }, [fetchData]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  console.log("userinfo", userInfo);

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
    setCategoryName(category.categoryName);
    setIsEnable(category.isEnable);
    setEditId(category._id)
    setIsEdit(true);

    setIsSliderOpen(true);
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("isEnable", isEnable);


    console.log("Form Data entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ":", pair[1]);
    }


    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/categories/${editId}`,
          formData,
          { headers }
        );
        toast.success("Categories Updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/categories`,
          formData,
          { headers }
        );
        toast.success("Categories Added successfully");
      }

      // Reset fields
      setCategoryName("");
      setIsEnable("");
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);

      // Refresh list
      fetchData();

    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} Categories failed`);
    }
  };


  // Toggle
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

  // Delete
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

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/categories/${categoryId}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}` // if you’re using auth
                }
              }
            );

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

  // Loader
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

        {/* Table Data */}
        <div className="rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="table-container max-w-full mb-24">
            <div className="w-full">
              <div className="hidden lg:grid grid-cols-[250px_250px_250px_250px_250px] gap-6 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
                <div>S.No.</div>
                <div>Name</div>
                <div>Status</div>
                <div>Created At</div>
                <div>Actions</div>
              </div>
              <div className="flex flex-col divide-y gap-2 divide-gray-100">
                {categories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No categories found.
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div
                      key={category._id}
                      className="grid grid-cols-[250px_250px_250px_250px_250px] pl-8 items-center gap-6 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                      <div className="text-sm font-medium text-gray-500">{index + 1}</div>
                      <div className="text-sm text-gray-500 ">{category.categoryName}</div>
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

                      {userInfo.isAdmin &&
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                          <div className="absolute  top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="w-full  px-4 py-2 text-sm hover:bg-blue-600/10 text-newPrimary flex items-center gap-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleEnable(category)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-500 flex items-center gap-2"
                            >
                              {category.isEnable ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      }
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
                    setIsEdit(false)
                    setEditingCategory(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
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
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isEnable ? "bg-newPrimary" : "bg-gray-300"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEnable ? "translate-x-4" : "translate-x-0"
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
                  {loading
                    ? "Saving..."
                    : isEdit
                      ? "Update Category"
                      : "Save Category"}
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