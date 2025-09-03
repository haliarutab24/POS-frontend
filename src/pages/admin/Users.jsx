import React, { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios';
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


const Users = () => {
  const [userList, setUserList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const sliderRef = useRef(null); // Ref for the slider element

  const handleAddUser = () => {
    setIsChangePassword(false);
    setIsSliderOpen(true);
  };

  // GSAP Animation for Slider
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block"; // show again when opening
        gsap.fromTo(
          sliderRef.current,
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    } else {
      if (sliderRef.current) {
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
    }
  }, [isSliderOpen]);


  // Fetch Expense Head Data
  const fetchCompanyUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/company-users`);
      const result = await response.json();
      console.log("Company User ", result);
      setUserList(result);
    } catch (error) {
      console.error("Error fetching expense head data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCompanyUser();
  }, [fetchCompanyUser]);


  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log("Admin", userInfo.isAdmin);

  // Save User Data
  const handleSave = async () => {
    const payload = {
      name,
      email,
      number: mobileNumber,
      designation,
      password,
    };

    console.log("Payload", payload);

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // ✅ JSON
      };

      let response;
      if (isEdit && editId) {
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/company-users/${editId}`,
          payload,
          { headers }
        );
        toast.success("Company User updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/company-users`,
          payload,
          { headers }
        );
        toast.success("Company User saved successfully!");
        fetchCompanyUser()
      }

      // Reset fields
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
      setName("");
      setEmail("");
      setMobileNumber("");
      setDesignation("");
      setPassword("");
    } catch (error) {
      console.error("Error creating company user:", error.response?.data || error.message);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} user failed`);
    }
  };


  // Change Password
  const handleChangePassword = async () => {
    const formData = new FormData();
    formData.append("password", newPassword);

    console.log("Change Password Form Data", formData);

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/${editId}/password`,
        formData,
        { headers }
      );
      toast.success("✅ Password changed successfully");

      // Reset fields
      setIsChangePassword(false);
      setIsSliderOpen(false);
      setEditId(null);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      toast.error("❌ Password change failed");
    }
  };

  // Edit User
  const handleEdit = (user) => {
    setIsChangePassword(false);
    setIsEdit(true);
    setEditId(user._id);
    setName(user.name || "");
    setEmail(user.email || "");
    setMobileNumber(user.mobileNumber || "");
    setDesignation(user.designation || "");
    setPassword(""); // Password is typically not pre-filled for security
    setIsSliderOpen(true);
    console.log("Editing User Data", user);
  };

  // Open Change Password Form
  const handleOpenChangePassword = (user) => {
    setIsChangePassword(true);
    setEditId(user._id);
    setName(user.name || "");
    setIsSliderOpen(true);
    console.log("Opening Change Password for User", user);
  };

  // Delete User
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
              `${import.meta.env.VITE_API_BASE_URL}/company-users/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setUserList(userList.filter((p) => p._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "User deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete User.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "User is safe 🙂",
            "error"
          );
        }
      });
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId], // flip only that user's password state
    }));
  };


  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HashLoader
            height="150"
            width="150"
            radius={1}
            color="#84CF16"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">User List</h1>
          <p className="text-gray-500 text-sm">User Management Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddUser}
        >
          + Add User
        </button>
      </div>

      {/* User Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-6 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Name</div>
              <div>Email</div>
              <div>Mobile Number</div>
              <div>Designation</div>
              <div>Password</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* User Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {userList.map((user, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Name */}
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-500">{user.email}</div>

                  {/* Mobile Number */}
                  <div className="text-sm text-gray-500">{user.number}</div>

                  {/* Designation */}
                  <div className="text-sm text-gray-500">{user.designation}</div>

                  {/* Password */}
                  <div className="flex items-center text-sm text-gray-500">
                    {visiblePasswords[user._id] ? user.password : "•••••"}
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(user._id)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      {visiblePasswords[user._id] ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>


                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>
                      <div className="absolute right-0 top-6 w-36 h-28 bg-white border border-gray-200 rounded-md shadow-lg 
                        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                        transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(user)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenChangePassword(user)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-100 text-yellow-600 flex items-center gap-2"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
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
              <h2 className="text-xl font-bold text-newPrimary">
                {isChangePassword ? "Change Password" : isEdit ? "Edit User" : "Add User"}
              </h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Section */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  {isChangePassword ? (
                    <>
                      <div>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={name}
                          disabled
                          className="w-full p-2 border rounded bg-gray-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder="Enter new password"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Mobile Number</label>
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder="Enter mobile number"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Designation</label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder="Enter designation"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                          placeholder={isEdit ? "Enter new password (optional)" : "Enter password"}
                        />
                      </div>
                    </>
                  )}
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
                  onClick={isChangePassword ? handleChangePassword : handleSave}
                >
                  {isChangePassword ? "Change Password" : isEdit ? "Update User" : "Save User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;