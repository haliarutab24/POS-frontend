import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios';
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaCog, FaTimes } from 'react-icons/fa';

// Static data for groups
const staticGroupData = [
  { _id: "g1", name: "Admin" },
  { _id: "g2", name: "Manager" },
  { _id: "g3", name: "Viewer" },
];

// Static data for modules
const staticModuleData = [
  { _id: "1", name: "User Management" },
  { _id: "2", name: "Inventory System" },
  { _id: "3", name: "Payment Processing" },
];

// Static data for functionalities (independent of modules)
const staticFunctionalityData = [
  { _id: "f1", functionality: "User Login and Authentication" },
  { _id: "f2", functionality: "Profile Editing" },
  { _id: "f3", functionality: "Stock Update" },
  { _id: "f4", functionality: "Process Credit Card Payments" },
  { _id: "f5", functionality: "View Reports" },
  { _id: "f6", functionality: "Manage Settings" },
];

// Static data for assign rights
const staticAssignRightsData = [
  {
    _id: "r1",
    groupId: "g1",
    groupName: "Admin",
    moduleId: "1",
    moduleName: "User Management",
    functionalities: JSON.stringify(["User Login and Authentication", "Profile Editing"]),
  },
  {
    _id: "r2",
    groupId: "g2",
    groupName: "Manager",
    moduleId: "2",
    moduleName: "Inventory System",
    functionalities: JSON.stringify(["Stock Update"]),
  },
  {
    _id: "r3",
    groupId: "g3",
    groupName: "Viewer",
    moduleId: "3",
    moduleName: "Payment Processing",
    functionalities: JSON.stringify(["Process Credit Card Payments"]),
  },
];

const AssignRights = () => {
  const [assignRightsList, setAssignRightsList] = useState(staticAssignRightsData);
  const [groups, setGroups] = useState(staticGroupData);
  const [modules, setModules] = useState(staticModuleData);
  const [functionalities, setFunctionalities] = useState(staticFunctionalityData);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  const handleAddAssignRights = () => {
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
          sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log("Admin", userInfo?.isAdmin);

  // Fetch Assign Rights Data
  const fetchAssignRightsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assignRights`);
      const result = await response.json();
      console.log("Assign Rights ", result);
      setAssignRightsList(result.length > 0 ? result : staticAssignRightsData);
    } catch (error) {
      console.error("Error fetching assign rights data:", error);
      setAssignRightsList(staticAssignRightsData);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchAssignRightsData();
  }, [fetchAssignRightsData]);

  console.log("Assign Rights Data", assignRightsList);

  // Fetch Group Data
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`);
      const result = await response.json();
      console.log("Groups ", result);
      setGroups(result.length > 0 ? result : staticGroupData);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setGroups(staticGroupData);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Fetch Module Data
  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/modules`);
      const result = await response.json();
      console.log("Modules ", result);
      setModules(result.length > 0 ? result : staticModuleData);
    } catch (error) {
      console.error("Error fetching module data:", error);
      setModules(staticModuleData);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Fetch Functionality Data
  const fetchFunctionalityData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/functionalities`);
      const result = await response.json();
      console.log("Functionalities ", result);
      setFunctionalities(result.length > 0 ? result : staticFunctionalityData);
    } catch (error) {
      console.error("Error fetching functionality data:", error);
      setFunctionalities(staticFunctionalityData);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchGroupData();
    fetchModuleData();
    fetchFunctionalityData();
  }, [fetchGroupData, fetchModuleData, fetchFunctionalityData]);

  // Save Assign Rights Data
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("moduleId", moduleId);
    formData.append("functionalities", JSON.stringify(selectedFunctionalities));

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const groupName = groups.find((g) => g._id === groupId)?.name || "";
      const moduleName = modules.find((m) => m._id === moduleId)?.name || "";

      let newRight;
      if (isEdit && editId) {
        newRight = {
          _id: editId,
          groupId,
          groupName,
          moduleId,
          moduleName,
          functionalities: JSON.stringify(selectedFunctionalities),
        };
        setAssignRightsList(
          assignRightsList.map((right) => (right._id === editId ? newRight : right))
        );
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/assignRights/${editId}`,
          formData,
          { headers }
        );
        toast.success("✅ Right updated successfully");
      } else {
        newRight = {
          _id: `r${assignRightsList.length + 1}`,
          groupId,
          groupName,
          moduleId,
          moduleName,
          functionalities: JSON.stringify(selectedFunctionalities),
        };
        setAssignRightsList([...assignRightsList, newRight]);
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/assignRights`,
          formData,
          { headers }
        );
        toast.success("✅ Right added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setGroupId("");
      setModuleId("");
      setSelectedFunctionalities([]);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} right failed`);
    }
  };

  // Edit Assign Rights
  const handleEdit = (right) => {
    setIsEdit(true);
    setEditId(right._id);
    setGroupId(right.groupId || "");
    setModuleId(right.moduleId || "");
    setSelectedFunctionalities(right.functionalities ? JSON.parse(right.functionalities) : []);
    setIsSliderOpen(true);
    console.log("Editing Right Data", right);
  };

  // Delete Assign Rights
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
            const token = userInfo?.token;
            if (!token) {
              toast.error("Authorization token missing!");
              return;
            }

            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/assignRights/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setAssignRightsList(assignRightsList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Right deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Right.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Right is safe 🙂",
            "error"
          );
        }
      });
  };

  // Handle Functionality Selection
  const handleFunctionalitySelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedFunctionalities.includes(selectedValue)) {
      setSelectedFunctionalities([...selectedFunctionalities, selectedValue]);
    }
    // Reset the select value
    e.target.value = "";
  };

  // Remove a functionality
  const removeFunctionality = (funcToRemove) => {
    setSelectedFunctionalities(
      selectedFunctionalities.filter((func) => func !== funcToRemove)
    );
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PuffLoader
            height="150"
            width="150"
            radius={1}
            color="#00809D"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Assign Rights List</h1>
          <p className="text-gray-500 text-sm">Assign Rights Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddAssignRights}
        >
          + Add Right
        </button>
      </div>

      {/* Assign Rights Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-4 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Group</div>
              <div>Module</div>
              <div>Functionalities</div>
              {userInfo?.isAdmin && (
                <div className="text-right flex items-center justify-end gap-1">
                  <FaCog className="text-gray-500" />
                  <span>Actions</span>
                </div>
              )}
            </div>

            {/* Assign Rights Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {assignRightsList.map((right, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Group */}
                  <div className="text-sm font-medium text-gray-900">
                    {right.groupName}
                  </div>

                  {/* Module */}
                  <div className="text-sm font-semibold text-green-600">
                    {right.moduleName}
                  </div>

                  {/* Functionalities */}
                  <div className="text-sm text-gray-500">
                    {right.functionalities ? JSON.parse(right.functionalities).join(", ") : ""}
                  </div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                        transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(right)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(right._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2"
                        >
                          <FaTrash />
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
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Right" : "Add Right"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Assign Rights Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Group</label>
                    <select
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Group</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Functionalities</label>
                    <select
                      onChange={handleFunctionalitySelect}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select functionality</option>
                      {functionalities
                        .filter(func => !selectedFunctionalities.includes(func.functionality))
                        .map((func) => (
                          <option key={func._id} value={func.functionality}>
                            {func.functionality}
                          </option>
                        ))
                      }
                    </select>
                    
                    {/* Selected Functionalities Tags */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFunctionalities.map((func, index) => (
                        <div
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {func}
                          <button
                            type="button"
                            onClick={() => removeFunctionality(func)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                  {isEdit ? "Update Right" : "Save Right"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRights;