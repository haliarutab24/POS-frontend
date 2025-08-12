import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


const ItemList = () => {
  const [staffList, setStaffList] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [details, setDetails] = useState("");
  const [manufacture, setManufacture] = useState("");
  const [supplier, setSupplier] = useState("");
  const [shelveLocation, setShelveLocation] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [perUnit, setPerUnit] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sales, setSales] = useState("");
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");
  const [enabled, setEnabled] = useState(true);




  const [formState, setEditFormState] = useState({
    name: "",
    department: "",
    designation: "",
    address: "",
    number: "",
    email: "",
    password: "",
    image: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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


  // // Fetch data from API
  // const fetchStaff = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/staff`);
  //     const result = await response.json();

  //     if (result.success && Array.isArray(result.data)) {
  //       const mappedStaff = result.data.map((staff) => ({
  //         _id: staff._id,
  //         name: staff.username,
  //         department: staff.department,
  //         designation: staff.designation,
  //         address: staff.address,
  //         number: staff.number,
  //         email: staff.email,
  //         password:staff.password,
  //         image: staff.image || [],
  //       }));

  //       setStaffList(mappedStaff);

  //     }
  //   } catch (error) {
  //     console.error("Error fetching staff data:", error);
  //   } finally {
  //     setTimeout(() => setLoading(false), 1000);
  //   }
  // }, []); // No dependencies so the function is memoized once

  // console.log("Staff List", staffList);

  // useEffect(() => {
  //   fetchStaff(); // Only re-executes if fetchStaff reference changes
  // }, [fetchStaff]);


  // Handlers
  const handleAddStaff = () => {
    setIsSliderOpen(true);
  };


  //  Item saved
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


  // Static Data
  const items = [
    {
      "image": "https://img.freepik.com/free-vector/white-product-podium-with-green-tropical-palm-leaves-golden-round-arch-green-wall_87521-3023.jpg",
      "itemCategory": "Electronics",
      "itemName": "Smartphone",
      "manufacture": "Samsung",
      "supplier": "ABC Traders",
      "purchase": 500,
      "sales": 650,
      "stock": 120
    },
    {
      
      "image": "https://img.freepik.com/free-vector/white-product-podium-with-green-tropical-palm-leaves-golden-round-arch-green-wall_87521-3023.jpg",
      "itemCategory": "Furniture",
      "itemName": "Office Chair",
      "manufacture": "Ikea",
      "supplier": "HomeDeco",
      "purchase": 80,
      "sales": 120,
      "stock": 45
    },
    {
      "image": "https://img.freepik.com/free-vector/white-product-podium-with-green-tropical-palm-leaves-golden-round-arch-green-wall_87521-3023.jpg",
      "itemCategory": "Appliances",
      "itemName": "Microwave Oven",
      "manufacture": "Haier",
      "supplier": "KitchenPro",
      "purchase": 200,
      "sales": 280,
      "stock": 60
    },
    {
      "image": "https://img.freepik.com/free-vector/white-product-podium-with-green-tropical-palm-leaves-golden-round-arch-green-wall_87521-3023.jpg",
      "itemCategory": "Clothing",
      "itemName": "Men's Jacket",
      "manufacture": "Levis",
      "supplier": "Fashion Hub",
      "purchase": 40,
      "sales": 70,
      "stock": 150
    },
    {
      "image": "https://img.freepik.com/free-vector/white-product-podium-with-green-tropical-palm-leaves-golden-round-arch-green-wall_87521-3023.jpg",
      "itemCategory": "Stationery",
      "itemName": "Notebook",
      "manufacture": "Oxford",
      "supplier": "PaperHouse",
      "purchase": 2,
      "sales": 5,
      "stock": 500
    }
  ]


  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // For upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // For preview
      };
      reader.readAsDataURL(file);
    }
  };


  const removeImage = () => {
    setImagePreview("");
    setEditFormState({ ...formState, image: "" });
  };


    // Capital 1st letter 
    function capitalizeFirstLetter(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

  // // Show loading spinner
  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <PuffLoader
  //           height="150"
  //           width="150"
  //           radius={1}
  //           color="#00809D"
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Items List</h1>
          <p className="text-gray-500 text-sm">Manage your items details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddStaff}
        >
          + Add Item
        </button>
      </div>

      {/* Item Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full  overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-8 gap-12 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Item Category</div>
              <div>Item Name</div>
              <div>Manufacture</div>
              <div>Supplier</div>
              <div>Purchase</div>
              <div>Sales</div>
              <div>Stock</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Staff in Table */}
            <div className="mt-4 flex flex-col gap-[6px]">
              {items.map((staff, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 items-center gap-12 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                          <img
                            src={staff.image[0]?.url || staff.image}
                            alt="Product Icon"
                            className="w-7 h-7 object-cover rounded-full"
                          />
                        <span className="text-sm font-medium text-gray-900">
                          {capitalizeFirstLetter(staff.itemCategory)}
                        </span>
                      </div>

                  {/* itemName */}
                  <div className="text-sm text-gray-500">{staff.itemName}</div>

                  {/* manufacture */}
                  <div className="text-sm text-gray-500">{staff.manufacture}</div>

                  {/* supplier */}
                  <div className="text-sm font-semibold text-gray-500">{staff.supplier}</div>

                  {/* purchase */}
                  <div className="text-sm font-semibold text-gray-500">{staff.purchase}</div>

                  {/* sales */}
                  <div className="text-sm font-semibold text-gray-500">{staff.sales}</div>

                  {/* stock */}
                  <div className="text-sm font-semibold text-gray-500">{staff.stock}</div>

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
                          className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2">
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
              <h2 className="text-xl font-bold text-newPrimary">{isEdit ? "Update Item" : "Add a New Item"}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
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

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Item Category */}
              <div>
                <label className="block text-gray-700 font-medium">Item Category <span className="text-newPrimary">*</span></label>
                <select
                  value={itemCategory}
                  required
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-gray-700 font-medium">Item Name <span className="text-newPrimary">*</span></label>
                <input
                  type="text"
                  value={itemName}
                  required
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-gray-700 font-medium">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Manufacture */}
              <div>
                <label className="block text-gray-700 font-medium">Manufacture <span className="text-newPrimary">*</span></label>

                <select
                  value={manufacture}
                  required
                  onChange={(e) => setManufacture(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Manufacture</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Ikea">Ikea</option>
                  <option value="Haier">Haier</option>
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-gray-700 font-medium">Supplier <span className="text-newPrimary">*</span></label>
                <select
                  value={supplier}
                  required
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Supplier</option>
                  <option value="ABC Traders">ABC Traders</option>
                  <option value="HomeDeco">HomeDeco</option>
                  <option value="KitchenPro">KitchenPro</option>
                </select>
              </div>

              {/* Shelve Location */}
              <div>
                <label className="block text-gray-700 font-medium">Shelve Location <span className="text-newPrimary">*</span></label>
                <select
                  value={shelveLocation}
                  required
                  onChange={(e) => setShelveLocation(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Location</option>
                  <option value="A1">A1</option>
                  <option value="B2">B2</option>
                  <option value="C3">C3</option>
                </select>
              </div>

              {/* Item Unit */}
              <div>
                <label className="block text-gray-700 font-medium">Item Unit <span className="text-newPrimary">*</span></label>
                <select
                  value={itemUnit}
                  required
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kg</option>
                  <option value="pcs">Pieces</option>
                  <option value="ltr">Liters</option>
                </select>
              </div>

              {/* Per Unit */}
              <div>
                <label className="block text-gray-700 font-medium">Per Unit</label>
                <input
                  type="number"
                  value={perUnit}
                  onChange={(e) => setPerUnit(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Purchase */}
              <div>
                <label className="block text-gray-700 font-medium">Purchase <span className="text-newPrimary">*</span></label>
                <input
                  type="number"
                  required
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Sales */}
              <div>
                <label className="block text-gray-700 font-medium">Sales <span className="text-newPrimary">*</span></label>
                <input
                  type="number"
                  value={sales}
                  required
                  onChange={(e) => setSales(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-gray-700 font-medium">Stock <span className="text-newPrimary">*</span></label>
                <input
                  type="number"
                  value={stock}
                  required
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Reorder */}
              <div>
                <label className="block text-gray-700 font-medium">Reorder</label>
                <input
                  type="number"
                  value={reorder}
                  onChange={(e) => setReorder(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Images { }
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

              {/* Enable / Disable */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Enable / Disable </label>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-7" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;