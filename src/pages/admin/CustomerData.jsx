import React, { useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios'
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";

const CustomerData = () => {
  const [customerList, setCustomerData] = useState([]);
  const [staffMembers, setStaffMember] = useState([]);
  const [productList, setProductList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [persons, setPersons] = useState([{ fullName: "", phone: "", email: "", designation: "", department: "" }]);
  const [assignedStaff, setAssignedStaff] = useState("");
  const [assignedProduct, setAssignedProduct] = useState("");
  const [image, setImage] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState(null);;

  const handleAddCustomer = () => {
    setIsSliderOpen(true);
  };


  // Token
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log("Admin", userInfo.isAdmin);

  //  Fetch Customer Data
  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients`);
      const result = await response.json();
      console.log("Clients ", result);

      setCustomerData(result);


    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  console.log("Customer Data", customerList);
  


  //  Fetch Staff Member Data
  const fetchAssignedData = useCallback(async () => {
    try {
      setLoading(true);
      const staffRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/staff`);
      const productRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
      const staff = await staffRes.json();
      const product = await productRes.json();
      setStaffMember(staff.data);
      setProductList(product.data);

    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchAssignedData();
  }, [fetchAssignedData]);



  // console.log("Product List ", productList);
  // console.log("Staff List  ", staffMembers);

  // Customer Data Saved
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("email", customerEmail);
    formData.append("mobileNumber", customerPhone);
    formData.append("address", customerAddress);
    formData.append("city", customerCity);
    formData.append("companyName", companyName);
    formData.append("businessType", businessType);
    
    persons.forEach((person, index) => {
      formData.append(`persons[${index}].name`, person.fullName);
      formData.append(`persons[${index}].phoneNumber`, person.phone);
      formData.append(`persons[${index}].email`, person.email);
      formData.append(`persons[${index}].designation`, person.designation);
      formData.append(`persons[${index}].department`, person.department);
    });
    

    formData.append("assignToStaffId", assignedStaff);
    formData.append("assignToProductId", assignedProduct);

    if (image) {
      formData.append("companyLogo", image); // Correct
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
          `${import.meta.env.VITE_API_BASE_URL}/clients/${editId}`,
          formData,
          { headers }
        );
        toast.success("✅ Customer updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/clients`,
          formData,
          { headers }
        );
        toast.success("✅ Customer added successfully");
      }
  
      // Reset fields
      setImage(null);
      setImagePreview(null);
      setEditId(null);
      setIsEdit(false);
      setIsSliderOpen(false);
  
      // Refresh list
      fetchCustomerData();
  
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} staff failed`);
    }
  };


//  Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Image Remove 
  const removeImage = () => {
    setImagePreview(null);
  };


  const handleAddPerson = () => {
    setPersons([...persons, { fullName: "", phone: "", email: "", designation: "", department: "" }]);
  };

  const handlePersonChange = (index, field, value) => {
    const newPersons = [...persons];
    newPersons[index][field] = value;
    setPersons(newPersons);
  };

   // Open the edit modal and populate the form
   const handleEdit = (client) => {
    setIsEdit(true);
    setEditId(client._id); // Save client ID for update
  
    // Prefill customer section
    setCustomerEmail(client.email || "");
    setCustomerPhone(client.mobileNumber || "");
    setCustomerAddress(client.address || "");
    setCustomerCity(client.city || "");
    setCompanyName(client.companyName || "");
    setBusinessType(client.businessType || "");
  
    // Prefill persons array
    setPersons(
      client.persons?.map(person => ({
        fullName: person.name || "",
        phone: person.phoneNumber || "",
        email: person.email || "",
        designation: person.designation || "",
        department: person.department || ""
      })) || []
    );
  
     // Prefill assign section (fix: extract _id if object)
  setAssignedStaff(
    typeof client.assignToStaffId === "object"
      ? client.assignToStaffId._id || ""
      : client.assignToStaffId || ""
  );

  setAssignedProduct(
    typeof client.assignToProductId === "object"
      ? client.assignToProductId._id || ""
      : client.assignToProductId || ""
  );
  
    // Prefill image
    if (client.companyLogo?.url) {
      setImagePreview(client.companyLogo.url);
      setImage([client.companyLogo.url]); // keep array for preview loop
    } else {
      setImagePreview(null);
      setImage([]);
    }
  
    setIsSliderOpen(true); // Open the form modal
    console.log("Editing Client Data", client);
  };
  
  // Delete Customer
const handleDelete = async (id) => {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      actions: "space-x-2", // ensures gap between buttons
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
            `${import.meta.env.VITE_API_BASE_URL}/clients/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update UI after deletion
          setCustomerData(customerList.filter((p) => p._id !== id));

          swalWithTailwindButtons.fire(
            "Deleted!",
            "Customer deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error("Delete error:", error);
          swalWithTailwindButtons.fire(
            "Error!",
            "Failed to delete Customer.",
            "error"
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire(
          "Cancelled",
          "Customer is safe 🙂",
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
          <h1 className="text-2xl font-bold text-newPrimary">Customer List</h1>
          <p className="text-gray-500 text-sm">Call Logs Dashboard</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
          onClick={handleAddCustomer}
        >
          + Add Customer
        </button>
      </div>


      {/* Customer Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full  overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-8 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Name</div>
              <div>Email</div>
              <div>Designation</div>
              <div>Address</div>
              <div>Department</div>
              <div>Assign to Staff</div>
              <div>Assign Product</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Customer Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {customerList.map((client, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#f0d694] rounded-full">
                      <img
                        src={client.companyLogo?.url || "https://via.placeholder.com/40"}
                        alt="Staff"
                        className="w-7 h-7 object-cover rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {client.companyName}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="text-sm font-semibold text-green-600">{client.email}</div>

                  {/* Designation */}
                  <div className="text-sm text-gray-500">{client?.persons?.designation}</div>

                  {/* Address */}
                  <div className="text-sm font-semibold text-green-600">{client.address}</div>

                  {/* Department */}
                  <div className="text-sm text-gray-500">{client.department}</div>

                  {/* Assign to Staff */}
                  <div className="text-sm text-gray-500">{client?.assignToStaffId?.username}</div>

                  {/* Assign Product */}
                  <div className="text-sm text-gray-500">{client?.assignToProductId?.name}</div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="text-right relative group">
                      <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>

                      {/* Dropdown */}
                      <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
                  opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                  transition-opacity duration-300 z-50 flex flex-col justify-between">
                        <button
                          onClick={() => handleEdit(client)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
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

      {/* Centered Modal/Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Edit Client" : "Add Client"}</h2>
              <button
                className="w-6 h-6 text-white rounded-full flex justify-center items-center hover:text-gray-400 text-xl bg-newPrimary"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>

            </div>
            <div className="p-6 space-y-6">
              {/* Customer Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Business Type</label>
                    <input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                      placeholder="Enter business type"
                    />
                  </div>
                </div>
              </div>

              {/* Person Section */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Person</h3>
                  <button
                    className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200"
                    onClick={handleAddPerson}
                  >
                    + Add New Person
                  </button>
                </div>
                {persons.map((person, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 last:mb-0">
                    <div>
                      <label className="block text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={person.fullName}
                        onChange={(e) => handlePersonChange(index, "fullName", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={person.phone}
                        onChange={(e) => handlePersonChange(index, "phone", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={person.email}
                        onChange={(e) => handlePersonChange(index, "email", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={person.designation}
                        onChange={(e) => handlePersonChange(index, "designation", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                        placeholder="Enter designation"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={person.department}
                        onChange={(e) => handlePersonChange(index, "department", e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                        placeholder="Enter department"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Assign Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Assign</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assign to Staff Dropdown */}
                  <div>
                    <label className="block text-gray-700 mb-1">Assign to Staff</label>
                    <select
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Staff</option>
                      {staffMembers.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assign Product Dropdown */}
                  <div>
                    <label className="block text-gray-700 mb-1">Assign Product</label>
                    <select
                      value={assignedProduct}
                      onChange={(e) => setAssignedProduct(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none transition-all"
                    >
                      <option value="">Select Product</option>
                      {productList.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Company Logo Upload</h3>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-newPrimary file:text-white
                    hover:file:bg-primaryDark
                    file:transition-colors file:duration-200"
                />
                
              </div>

               {/* Image Preview */}

               {imagePreview && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Company Logo</h3>
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
                 {isEdit ? "Update Client" : "Save Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerData;