import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from "axios";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";


const GroupManagement = () => {
  const [groupList, setGroupList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Store detailed fetch errors
  const sliderRef = useRef(null);

  // Safe userInfo parsing
  const getUserInfo = () => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
      console.log("Parsed userInfo:", info);
      return info;
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return {};
    }
  };

  const userInfo = getUserInfo();

  // GSAP Animation for Slider
  useEffect(() => {
    if (sliderRef.current) {
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
            sliderRef.current.style.display = "none";
          },
        });
      }
    }
  }, [isSliderOpen]);

  // ✅ Fetch User Data (silent fallback)
  const fetchUserData = useCallback(async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/company-users`;

      const response = await fetch(apiUrl);

      let result = [];
      if (response.ok) {
        result = await response.json();
        console.log("User list ", result);

      }

      const list = Array.isArray(result) ? result : result?.data || [];

      setUserList(list.length > 0 ? list : staticUsers);

    } catch {
      // ❌ No console.error / toast
      setUserList(staticUsers);
    }
  }, [userInfo?.token]);

  // ✅ Fetch Group Data (silent fallback)
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/groups`;

      const response = await fetch(apiUrl);


      let result = [];
      if (response.ok) {
        result = await response.json();
      }

      const list = Array.isArray(result) ? result : result?.data || [];
      // console.log("Response ", list);
      setGroupList(list);

    } catch {
      setGroupList([]);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  // ✅ Fetch data on mount
  useEffect(() => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      setGroupList(staticGroups);
      setUserList(staticUsers);
      setLoading(false);
      return;
    }
    fetchGroupData();
    fetchUserData();
  }, [fetchGroupData, fetchUserData]);
  console.log("Group and User data fetched");

  // Validate form
  const validateForm = () => {
    if (!groupName.trim()) return "Group name is required";
    return null;
  };

  // Save Group Data
  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(`❌ ${validationError}`);
      return;
    }

    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error("❌ Authorization token missing!");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const payload = { groupName, users: selectedUsers };

      if (isEdit && editId) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/groups/${editId}`, payload, { headers });
        toast.success("✅ Group updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/groups`, payload, { headers });
        toast.success("✅ Group added successfully");
      }

      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      fetchGroupData();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} group failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Edit Group
  const handleEdit = (group) => {
    console.log("Edit   ", group.users);

    setIsEdit(true);
    setEditId(group._id);
    setGroupName(group.groupName || "");
    console.log("Selected users", selectedUsers);

    setSelectedUsers(group.users.map(u => u._id) || userList);
    setIsSliderOpen(true);
  };

  // Delete Group
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
              toast.error("❌ Authorization token missing!");
              return;
            }

            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/groups/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setGroupList(groupList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire("Deleted!", "Group deleted successfully.", "success");
          } catch (error) {
            console.error("Delete error:", error.response?.data || error.message);
            swalWithTailwindButtons.fire(
              "Error!",
              `Failed to delete Group: ${error.response?.data?.message || error.message}`,
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Group is safe 🙂", "info");
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
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}. Data is using fallback values.
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Group List</h1>
          <p className="text-gray-500 text-sm">Group Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={() => {
            setGroupName("");
            setSelectedUsers([]);
            setIsEdit(false);
            setEditId(null);
            setIsSliderOpen(true);
          }}
        >
          + Add Group
        </button>
      </div>

      {/* Group Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Group Name</div>
              <div>Users</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Group Table */}
            {groupList.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No groups found.</div>
            ) : (
              <div className="mt-4 flex flex-col gap-[14px] pb-14">
                {groupList.map((group) => (
                  <div
                    key={group._id}
                    className="grid grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                  >
                    <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {group.users.map((user) => user.name).join(", ")}
                    </div>
                    {userInfo?.isAdmin && (
                      <div className="text-right relative group">
                        <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                        <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                          opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                          transition-opacity duration-300 z-50 flex flex-col justify-between">
                          <button
                            onClick={() => handleEdit(group)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(group._id)}
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
            )}
          </div>
        </div>
      </div>

      {/* Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
          <div
            ref={sliderRef}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Group" : "Add Group"}</h2>
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
                    <label className="block text-gray-700 mb-1">
                      Group Name <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Users</label>
                    <select
                      multiple
                      value={selectedUsers}
                      onChange={(e) =>
                        setSelectedUsers(Array.from(e.target.selectedOptions, (option) => option.value))
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      {userList.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name || user._id}
                        </option>
                      ))}
                    </select>

                    <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => {
                    setGroupName("");
                    setSelectedUsers([]);
                    setIsEdit(false);
                    setEditId(null);
                    setIsSliderOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-newPrimary text-white px-6 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Group" : "Save Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;