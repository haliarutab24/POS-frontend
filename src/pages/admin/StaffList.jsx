import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


const StaffList = () => {
  const [staffList, setStaffList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);   
  const [imagePreview, setImagePreview] = useState(null); 

  const [formState, setEditFormState] = useState({
    name: "",
    department: "",
    designation: "",
    address:"",
    number: "",
    email: "",
    password: "",
    image: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null); 

  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log("Admin", userInfo.isAdmin);

  // slider styling 
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },  // offscreen right
        {
          x: "0%",
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",          // smoother easing
        }
      );
    }
  }, [isSliderOpen]);


  // Fetch data from API
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/staff`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const mappedStaff = result.data.map((staff) => ({
          _id: staff._id,
          name: staff.username,
          department: staff.department,
          designation: staff.designation,
          address: staff.address,
          number: staff.number,
          email: staff.email,
          password:staff.password,
          image: staff.image || [],
        }));

        setStaffList(mappedStaff);
        
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []); // No dependencies so the function is memoized once

  console.log("Staff List", staffList);

  useEffect(() => {
    fetchStaff(); // Only re-executes if fetchStaff reference changes
  }, [fetchStaff]);


  // Handlers
  const handleAddStaff = () => {
    setIsSliderOpen(true);
  };


 //  Staff saved
 const handleSave = async () => {
  const formData = new FormData();
  formData.append("username", staffName);
  formData.append("department", department);
  formData.append("designation", designation);
  formData.append("address", address);
  formData.append("number", number);
  formData.append("email", email);
  formData.append('password', password)
  if (image) {
    formData.append("image", image);
  }

  console.log("Form Data", formData);
  
  try {
    const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    if (isEdit && editId) {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/staff/${editId}`,
        formData,
        { headers }
      );
      toast.success("✅ Staff updated successfully");
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/staff`,
        formData,
        { headers }
      );
      toast.success("✅ Staff added successfully");
    }

    // Reset fields
    setStaffName("");
    setDepartment("");
    setDesignation("");
    setAddress("");
    setNumber("");
    setEmail("");
    setImage(null);
    setImagePreview(null);
    setEditId(null);
    setIsEdit(false);
    setIsSliderOpen(false);

    // Refresh list
    fetchStaff();

  } catch (error) {
    console.error(error);
    toast.error(`❌ ${isEdit ? "Update" : "Add"} staff failed`);
  }
};


 
  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Image Remove
  const removeImage = () => {
    setImagePreview("");
    setEditFormState({ ...formState, image: "" });
  };


  // Open the edit modal and populate the form
  const handleEdit = (staff) => {
    setIsEdit(true);
    setEditId(staff._id);
    setStaffName(staff.name || "");
    setDepartment(staff.department || "");
    setDesignation(staff.designation || "");
    setAddress(staff.address || "");
    setNumber(staff.number || "");
    setEmail(staff.email || "");
    setPassword(staff.password || "");
    setImagePreview(staff.image?.url || "");
    setImage(null);
    setIsSliderOpen(true);
  };

 // Delete Staff
const handleDelete = async (id) => {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      actions: "space-x-2", // gap between buttons
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
            `${import.meta.env.VITE_API_BASE_URL}/staff/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update UI
          setStaffList(staffList.filter((p) => p._id !== id));

          swalWithTailwindButtons.fire(
            "Deleted!",
            "Staff deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error("Delete error:", error);
          swalWithTailwindButtons.fire(
            "Error!",
            "Failed to delete staff.",
            "error"
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire(
          "Cancelled",
          "Staff is safe 🙂",
          "error"
        );
      }
    });
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
          <h1 className="text-2xl font-bold text-newPrimary">Staff List</h1>
          <p className="text-gray-500 text-sm">Call Logs Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddStaff}
        >
          + Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full  overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-7 gap-20 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Name</div>
              <div>Department</div>
              <div>Designation</div>
              <div>Address</div>
              <div>Number</div>
              <div>Email</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Staff in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {staffList.map((staff, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 items-center gap-20 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#f0d694] rounded-full">
                      <img
                        src={staff.image?.url || "https://via.placeholder.com/40"}
                        alt="Staff"
                        className="w-7 h-7 object-cover rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {staff.name}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="text-sm text-gray-500">{staff.department}</div>

                  {/* Designation */}
                  <div className="text-sm text-gray-500">{staff.designation}</div>

                  {/* Address */}
                  <div className="text-sm font-semibold text-green-600">{staff.address}</div>

                  {/* Number */}
                  <div className="text-sm font-semibold text-green-600">{staff.number}</div>

                  {/* Email */}
                  <div className="text-sm font-semibold text-green-600">{staff.email}</div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>

                      {/* Dropdown */}
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                  opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                  transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2">
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


      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
          <div
            ref={sliderRef}
            className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Update Staff" : "Add a New Staff"}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                    setIsSliderOpen(false);
                    setIsEdit(false);
                    setEditId(null);
                    setImage(null);
                    setImagePreview(null);
                  }}
              >
                ×
              </button>
            </div>
            <div>
              <div className="mb-4">
               
                <label className="block text-gray-700">Name {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Department {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Designation {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Address {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Number {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Password {}
                <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {/* Image Upload */}
              <div className="mb-10">
                    <label className="block text-gray-700 mb-4 ">
                      Staff Image {}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-newPrimary hover:text-newPrimary focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              onChange={handleImageUpload}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>

                    {/* Image Preview */}

                    {imagePreview && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Image</h3>
                        <div className="relative group w-48 h-32">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md border border-gray-200"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
              {isEdit ? "Update Staff" : "Save Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;