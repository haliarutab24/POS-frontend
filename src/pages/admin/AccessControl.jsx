import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios';
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";

const AccessControl = () => {
  const [accessControlList, setAccessControlList] = useState([
    {
      _id: "1",
      roleName: "Admin",
      permissions: JSON.stringify([
        "View Dashboard",
        "Manage Users",
        "Manage Groups",
        "Manage Companies",
        "Manage Access Control",
        "View Reports",
        "Edit Settings"
      ])
    },
    {
      _id: "2",
      roleName: "Manager",
      permissions: JSON.stringify([
        "View Dashboard",
        "Manage Users",
        "View Reports"
      ])
    },
    {
      _id: "3",
      roleName: "Viewer",
      permissions: JSON.stringify([
        "View Dashboard",
        "View Reports"
      ])
    }
  ]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null); // Ref for the slider element

  // Static list of available permissions
  const availablePermissions = [
    "View Dashboard",
    "Manage Users",
    "Manage Groups",
    "Manage Companies",
    "Manage Access Control",
    "View Reports",
    "Edit Settings"
  ];

  const handleAddAccessControl = () => {
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
  console.log("Admin", userInfo.isAdmin);

  // Fetch Access Control Data
  const fetchAccessControlData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/access-controls`);
      const result = await response.json();
      console.log("Access Controls ", result);
      setAccessControlList(result);
    } catch (error) {
      console.error("Error fetching access control data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchAccessControlData();
  }, [fetchAccessControlData]);

  console.log("Access Control Data", accessControlList);

  // Save Access Control Data
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("roleName", roleName);
    formData.append("permissions", JSON.stringify(permissions));

    console.log("Form Data", formData);

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      let newRole;
      if (isEdit && editId) {
        newRole = { _id: editId, roleName, permissions: JSON.stringify(permissions) };
        setAccessControlList(accessControlList.map((role) => (role._id === editId ? newRole : role)));
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/access-controls/${editId}`,
          formData,
          { headers }
        );
        toast.success("✅ Role updated successfully");
      } else {
        newRole = { _id: `${accessControlList.length + 1}`, roleName, permissions: JSON.stringify(permissions) };
        setAccessControlList([...accessControlList, newRole]);
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/access-controls`,
          formData,
          { headers }
        );
        toast.success("✅ Role added successfully");
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setRoleName("");
      setPermissions([]);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} role failed`);
    }
  };

  // Edit Access Control
  const handleEdit = (role) => {
    setIsEdit(true);
    setEditId(role._id);
    setRoleName(role.roleName || "");
    setPermissions(role.permissions ? JSON.parse(role.permissions) : []);
    setIsSliderOpen(true);
    console.log("Editing Role Data", role);
  };

  // Delete Access Control
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
              `${import.meta.env.VITE_API_BASE_URL}/access-controls/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setAccessControlList(accessControlList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Role deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Role.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Role is safe 🙂",
            "error"
          );
        }
      });
  };

  // Handle Permissions Change
  const handlePermissionsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setPermissions(selectedOptions);
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
          <h1 className="text-2xl font-bold text-newPrimary">Access Control List</h1>
          <p className="text-gray-500 text-sm">Access Control Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddAccessControl}
        >
          + Add Role
        </button>
      </div>

      {/* Access Control Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Role Name</div>
              <div>Permissions</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Access Control Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {accessControlList.map((role, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Role Name */}
                  <div className="text-sm font-medium text-gray-900">
                    {role.roleName}
                  </div>

                  {/* Permissions */}
                  <div className="text-sm text-gray-500">
                    {role.permissions ? JSON.parse(role.permissions).join(", ") : ""}
                  </div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                        transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(role)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role._id)}
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
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Role" : "Add Role"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Access Control Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Permissions</label>
                    <select
                      multiple
                      value={permissions}
                      onChange={handlePermissionsChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all h-40"
                    >
                      <option value="" disabled>
                        Select permissions
                      </option>
                      {availablePermissions.map((perm, index) => (
                        <option key={index} value={perm}>
                          {perm}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple permissions</p>
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
                  {isEdit ? "Update Role" : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;