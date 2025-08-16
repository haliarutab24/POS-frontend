import React, { useState, useEffect, useRef, useCallback } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";

const ShelveLocation = () => {
  const [shelveLocationList, setShelveLocationList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [shelfNameCode, setshelfNameCode] = useState("");
  const [description, setDescription] = useState("");
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


const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shelves`);
      setShelveLocationList(res.data); // store actual categories array
      console.log("Shelves Location", res.data);
    } catch (error) {
      console.error("Failed to fetch products or categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  // Initialize shelve location list with static data
  useEffect(() => {
  
  fetchData();
}, [fetchData]);


  // Handlers
  const handleAddShelveLocation = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setshelfNameCode("");
    setDescription("");
  };

  // Save or Update Shelve Location
  const handleSave = async () => {
    const formData = {
      shelfNameCode,
      description,
    };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/shelves/${editId}`,
          formData,
          { headers }
        );
        toast.success("Shelves Updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/shelves`,
          formData,
          { headers }
        );
        toast.success("Shelves Added successfully");
      }

      setshelfNameCode('');
      setDescription('');
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchData()
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} shelves failed`);
    }
  };

  // Edit Shelve Location
  const handleEdit = (shelveLocation) => {
    setIsEdit(true);
    setEditId(shelveLocation._id || '');
    setshelfNameCode(shelveLocation.shelfNameCode || '');
    setDescription(shelveLocation.description || '') ;
    setIsSliderOpen(true);
  };

  // Delete Shelve Location
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
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/shelves/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}` // if you’re using auth
                }
              }
            );
            setShelveLocationList(shelveLocationList.filter((s) => s._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Shelve Location deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete shelve location.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Shelve Location is safe 🙂",
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
          <PuffLoader height="150" width="150" radius={1} color="#00809D" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Shelve Locations List
          </h1>
          <p className="text-gray-500 text-sm">Manage your shelve location details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          onClick={handleAddShelveLocation}
        >
          + Add Shelve Location
        </button>
      </div>

      {/* Shelve Location Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="w-full">
            {/* Table Headers */}
            <div className="flex  gap-6 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div  className="flex-[2]">Shelf Name / Code</div>
              {/* <div>Section</div>
              <div>Current Stock Count</div> */}
              <div  className="flex-[6]">Description</div>
              {userInfo?.isAdmin && <div className="text-center flex-[1]">Actions</div>}
            </div>

            {/* Shelve Locations in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {shelveLocationList.map((shelveLocation) => (
                <div
                  key={shelveLocation._id}
                  className="flex gap-6 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Shelf Name / Code */}
                  <div className="text-sm text-gray-500 flex-[2]">
                    {shelveLocation.shelfNameCode}
                  </div>

             

                  {/* Description */}
                  <div className="text-sm text-gray-500 flex-[6]">
                    {shelveLocation.description}
                  </div>

                  {/* Actions */}
                  {userInfo?.isAdmin && (
                    <div className="flex justify-center flex-[1]">
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 text-xl">
                          ⋯
                        </button>
                        <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-50 flex flex-col">
                          <button
                            onClick={() => handleEdit(shelveLocation)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-newPrimary/10 text-newPrimary flex items-center gap-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(shelveLocation._id)}
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
                {isEdit ? "Update Shelve Location" : "Add a New Shelve Location"}
              </h2>
              <button
                className="text-gray-500 text-2xl hover:text-gray-700"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setshelfNameCode("");
                  setDescription("");
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Shelf Name / Code */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Shelf Name / Code <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={shelfNameCode}
                  required
                  onChange={(e) => setshelfNameCode(e.target.value)}
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
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Save Button */}
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
                {loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Shelve Location"
                    : "Save Shelve Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelveLocation;