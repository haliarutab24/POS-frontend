import React, { useState, useCallback, useEffect, useRef } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
const ItemUnit = () => {
  const [manufacturerList, setManufacturerList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [manufacturerName, setManufacturerName] = useState("");
  const [address, setAddress] = useState("");
  const [productsSupplied, setProductsSupplied] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive
  const [gstNumber, setGstNumber] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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


  // Shelves List Fetch 
  const fetchShelvesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/item-unit`);
      setManufacturerList(res.data); // store actual categories array
      console.log("Item Unit ", res.data);
    } catch (error) {
      console.error("Failed to fetch Shelves", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchShelvesList();
  }, [fetchShelvesList]);

  // Handlers
  const handleAddManufacturer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setManufacturerName("");
    setAddress("");
    setProductsSupplied("");
    setEmail("");
    setGstNumber("");
    setStatus(true);
  };

  // Save or Update Manufacturer
  const handleSave = async () => {
    const formData = {
      unitName: manufacturerName,
      description: address,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editId) {
        // Update existing purchase
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/item-unit/${editId}`,
          formData,
          { headers }
        );
        toast.success("Item Unit updated successfully!");
      } else {
        // Create new purchase
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/item-unit`,
          formData,
          { headers }
        );
        toast.success("Item Unit created successfully!");
      }

      // Reset form
      setManufacturerName("");
      setAddress("");
      setProductsSupplied("");
      setEmail("");
      setGstNumber("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchShelvesList()
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} manufacturer failed`);
    }
  };

  // Edit Manufacturer
  const handleEdit = (manufacturer) => {
    setIsEdit(true);
    setEditId(manufacturer._id);
    setManufacturerName(manufacturer.name);
    setAddress(manufacturer.address);
    setProductsSupplied(manufacturer.productsSupplied);
    setEmail(manufacturer.email);
    setGstNumber(manufacturer.gstNumber);
    setStatus(manufacturer.status);
    setIsSliderOpen(true);
  };

  // Delete Manufacturer
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
            const { token } = userInfo || {};
            const headers = {
              Authorization: `Bearer ${token}`,

            };
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/item-unit/${id}`,

              { headers }
            );
            setManufacturerList(manufacturerList.filter((m) => m._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Manufacturer deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete manufacturer.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Manufacturer is safe 🙂",
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
          <HashLoader height="150" width="150" radius={1} color="#84CF16" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Item Unit List
          </h1>

        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
          onClick={handleAddManufacturer}
        >
          + Add Item Unit
        </button>
      </div>

      {/* Manufacturer Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-4 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Unit Item ID</div>
              <div>Name</div>
              <div>Description</div>

              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Manufacturers in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {manufacturerList.map((manufacturer, index) => (
                <div
                  key={manufacturer._id}
                  className="px-8 grid grid-cols-4 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Manufacturer ID */}
                  <div className="text-sm font-medium text-gray-900">
                    {index + 1}
                  </div>

                  {/* Name */}
                  <div className="text-sm text-gray-500">
                    {manufacturer.unitName}
                  </div>

                  {/* Address */}
                  <div className="text-sm text-gray-500">
                    {manufacturer.description}
                  </div>


                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="flex justify-end">
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 text-xl">
                          ⋯
                        </button>
                        <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                          <button
                            onClick={() => handleEdit(manufacturer)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(manufacturer._id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                          >
                            Delete
                          </button>
                        </div>
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
            className="w-1/3 bg-white p-6 h-full overflow-y-auto shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Item Unit" : "Add a New Item Unit"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Unit Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Unit Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturerName}
                  required
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Description <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>


              {/* Save Button */}
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Item Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemUnit;