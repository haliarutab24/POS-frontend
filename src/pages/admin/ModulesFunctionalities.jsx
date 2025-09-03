import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";



const ModulesFunctionalities = () => {
  const [functionalityList, setFunctionalityList] = useState([]);
  const [modules, setModules] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [moduleId, setModuleId] = useState(""); // Use moduleId for selection
  const [name, setName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false); // Initialize as false
  const sliderRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    Authorization: `Bearer ${userInfo?.token || ""}`,
    "Content-Type": "application/json",
  };

  const handleAddFunctionality = () => {
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          if (sliderRef.current) {
            sliderRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isSliderOpen]);

  // Fetch Functionality Data
  const fetchFunctionalityData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/functionality`);
      if (!response.ok) throw new Error("Failed to fetch functionalities");
      const result = await response.json();
      console.log("Functionalities Response:", result);

      setFunctionalityList(result);
    } catch (error) {
      console.error("Error fetching functionality data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Module Data
  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/modules`);


      if (!response.ok) throw new Error("Failed to fetch modules");
      const result = await response.json();
      console.log("Modules Response:", result);
      setModules(result);
    } catch (error) {
      console.error("Error fetching module data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchModuleData();
    fetchFunctionalityData();
  }, [fetchModuleData, fetchFunctionalityData]);

  // Save Functionality Data
  const handleSave = async () => {

    console.log("Module Id", moduleId);
    console.log("Functionality Name", name);

    if (!moduleId || !name) {
      toast.error("Please select a module and enter a functionality");
      return;
    }

    // const formData = new FormData();
    // formData.append("moduleId", moduleId);
    // formData.append("name", name);


    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token || ""}`,
          // "Content-Type": "multipart/form-data",
        },
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/functionality/${editId}`,
          { moduleId, name },
          config
        );
        toast.success("✅ Functionality updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/functionality`,
          { moduleId, name },
          config
        );
        toast.success("✅ Functionality added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setModuleId("");
      setName("");
      fetchFunctionalityData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} functionality failed`);
    }
  };

  // Edit Functionality
  const handleEdit = (func) => {
    setIsEdit(true);
    setEditId(func._id);
    setModuleId(func.moduleId || "");
    setName(func.name || "");
    setIsSliderOpen(true);
  };

  // Delete Functionality
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
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
            if (!userInfo?.token) {
              toast.error("Authorization token missing!");
              return;
            }

            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/functionality/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo.token}`,
              },
            });

            setFunctionalityList(functionalityList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire("Deleted!", "Functionality deleted successfully.", "success");
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire("Error!", "Failed to delete Functionality.", "error");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Functionality is safe 🙂", "info");
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Functionality List</h1>
          <p className="text-gray-500 text-sm">Functionality Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddFunctionality}
        >
          + Add Functionality
        </button>
      </div>

      {/* Functionality Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Module</div>
              <div>Functionality</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Functionality Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {functionalityList.map((func) => (
                <div
                  key={func._id} // Use _id for better key stability
                  className="grid grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm font-medium text-gray-900">{func?.moduleId?.moduleName}</div>
                  <div className="text-sm text-gray-500">{func.name}</div>
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(func)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(func._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            style={{ display: "block" }}
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Functionality" : "Add Functionality"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Module</label>
                    <select
                      value={moduleId}
                      onChange={(e) => setModuleId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Module</option>
                      {modules.map((module) => (
                        <option key={module._id} value={module._id}>
                          {module.moduleName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Functionality</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter functionality"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Functionality" : "Save Functionality"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesFunctionalities;