import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaCog, FaTimes } from "react-icons/fa";

const AssignRights = () => {
  const [moduleList, setModuleList] = useState([]);
  const [assignRightsList, setAssignRightsList] = useState([]);
  const [groups, setGroups] = useState([]);
  const [functionalityList, setFunctionalityList] = useState([]);
  const [functionalityModuleList, setFunctionalityModuleList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]); // Stores names for UI
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    Authorization: `Bearer ${userInfo?.token || ""}`,
    "Content-Type": "application/json",
  };

  const handleAddAssignRights = () => {
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      sliderRef.current.style.display = "block";
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

  // Fetch Assign Rights Data
  const fetchRights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rights`, { headers });
      if (!res.ok) throw new Error("Failed to fetch rights");
      const result = await res.json();
      console.log("Fetched Rights:", result);
      setAssignRightsList(result);
    } catch (error) {
      console.error("Error fetching rights:", error);
      toast.error("Failed to fetch rights");
      setAssignRightsList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Group Data
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`, { headers });
      if (!response.ok) throw new Error("Failed to fetch groups");
      const result = await response.json();
      setGroups(result);
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast.error("Failed to fetch groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);



  // Fetch Functionality Data
  const fetchFunctionalityData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/functionality`, { headers });
      if (!response.ok) throw new Error("Failed to fetch functionalities");
      const result = await response.json();
      console.log("Functionalities Response:", result);
      setFunctionalityList(result);
    } catch (error) {
      console.error("Error fetching functionality data:", error);
      toast.error("Failed to fetch functionalities");
      setFunctionalityList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Module Data
  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/modules`, { headers });
      if (!response.ok) throw new Error("Failed to fetch modules");
      const result = await response.json();
      console.log("Modules:", result);
      setModuleList(result);

    } catch (error) {
      console.error("Error fetching module data:", error);
      toast.error("Failed to fetch modules");
      setModuleList([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const selectModule = (e) => {
    const id = e.target.value;
    setSelectedFunctionalities([])
    setModuleId(id);
    fetchFunctionalityModuleData(id); // ✅ use fresh value directly
  };

  // Fetch Functionality Data
  const fetchFunctionalityModuleData = useCallback(async (moduleId) => {
    if (!moduleId) return;
    console.log("Module ...... ", moduleId);

    const controller = new AbortController();
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/functionality/module/${moduleId}`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error("Failed to fetch functionalities");
      const result = await response.json();
      setFunctionalityModuleList(result);
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Failed to fetch functionalities");
        setFunctionalityModuleList([]);
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);




  // Fetch all data on mount
  useEffect(() => {
    fetchGroupData();
    fetchModuleData();
    fetchFunctionalityData();
    fetchRights();
  }, [fetchGroupData, fetchModuleData, fetchFunctionalityData, fetchRights]);



  // Convert functionality IDs to names for display
  const getFunctionalityNames = (ids) => {

    return ids
      .map((id) => {
        const func = functionalityList.find((f) => f._id === id);
        return func ? func.functionality : null;
      })
      .filter((name) => name !== null);
  };

  // Save Assign Rights Data
  const handleSave = async () => {
    if (!groupId || !moduleId || selectedFunctionalities.length === 0) {
      toast.error("Please fill all fields");
      return;
    }


    try {
      const groupName = groups.find((g) => g._id === groupId)?.groupName || "";
      const moduleName = moduleList.find((m) => m._id === moduleId)?.moduleName || "";

      const payload = {
        group: groupId,          // ✅ match backend field
        module: moduleId,        // ✅ match backend field
        functionalities: functionalityIds,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token || ""}`,
          "Content-Type": "application/json", // ✅ correct
        },
      };

      let newRight;
      if (isEdit && editId) {
        newRight = {
          _id: editId,
          groupId,
          groupName,
          moduleId,
          moduleName,
          functionalities: functionalityIds,
        };
        setAssignRightsList(
          assignRightsList.map((right) => (right._id === editId ? newRight : right))
        );
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/rights/${editId}`, payload, config);
        toast.success("✅ Right updated successfully");
      } else {
        newRight = {
          _id: `r${assignRightsList.length + 1}`,
          groupId,
          groupName,
          moduleId,
          moduleName,
          functionalities: functionalityIds,
        };
        setAssignRightsList([...assignRightsList, newRight]);
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/rights`, payload, config);
        toast.success("✅ Right added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setGroupId("");
      setModuleId("");
      setSelectedFunctionalities([]);
      fetchRights();
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} right failed`);
    }
  };


  // Edit Assign Rights
  const handleEdit = (right) => {
    console.log("Right Edit", right);

    setIsEdit(true);
    setEditId(right._id);

    // ✅ group and module come as objects, so pick _id
    setGroupId(right?.group?._id || "");
    setModuleId(right?.module?._id || "");

    // ✅ functionalities already have _id and name
    const functionalities = Array.isArray(right.functionalities)
      ? right.functionalities.map(f => ({ _id: f._id, name: f.name }))
      : [];

    setSelectedFunctionalities(functionalities);

    setIsSliderOpen(true);
  };


  // Delete Assign Rights
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-newPrimary text-white px-4 py-2 rounded-lg",
        cancelButton: "bg-gray-300 text-gray-700 px-4 py-2 rounded-lg",
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

            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/rights/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo.token}`,
              },
            });

            setAssignRightsList(assignRightsList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire("Deleted!", "Right deleted successfully.", "success");
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire("Error!", "Failed to delete Right.", "error");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Right is safe 🙂", "info");
        }
      });
  };

  // Handle Functionality Selection
  const handleFunctionalitySelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const selectedFunc = functionalityModuleList.find(
      (func) => func._id === selectedId
    );

    if (selectedFunc) {
      setSelectedFunctionalities((prev) => {
        if (prev.some((f) => f._id === selectedFunc._id)) return prev;

        const updated = [...prev, { _id: selectedFunc._id, name: selectedFunc.name }];
        console.log("✅ Updated Selected Functionalities:", updated);
        return updated;
      });
    }

    e.target.value = ""; // reset dropdown
  };

  const functionalityIds = selectedFunctionalities.map(f => f._id);
  console.log("functionalityIds ", functionalityIds);



  // Remove a functionality
  const removeFunctionality = (funcId) => {
    setSelectedFunctionalities(
      selectedFunctionalities.filter((func) => func._id !== funcId)
    );
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
              {assignRightsList.map((right) => (
                <div
                  key={right._id}
                  className="grid grid-cols-4 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm font-medium text-gray-900">{right?.group?.groupName}</div>
                  <div className="text-sm font-semibold text-green-600">{right?.module?.moduleName}</div>
                  <div className="text-sm text-gray-500">
                    {right?.functionalities?.map((func) => (
                      <div key={func._id}>{func.name}</div>
                    ))}

                  </div>

                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col justify-between">
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
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Module</label>
                    <select
                      value={moduleId}
                      onChange={selectModule}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Module</option>
                      {moduleList.map((module) => (
                        <option key={module._id} value={module._id}>
                          {module.moduleName}
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
                      {functionalityModuleList
                        .filter((func) => !selectedFunctionalities.some(f => f._id === func._id))
                        .map((func) => (
                          <option key={func._id} value={func._id}>
                            {func.name}
                          </option>
                        ))}
                    </select>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFunctionalities.map((func) => (
                        <div
                          key={func._id}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {func.name}
                          <button
                            type="button"
                            onClick={() => removeFunctionality(func._id)}
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