import React, { useState, useCallback, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ShelveLocation = () => {
  const [shelveLocationList, setShelveLocationList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [shelfName, setShelfName] = useState("");
  const [aisleNumber, setAisleNumber] = useState("");
  const [section, setSection] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [currentStockCount, setCurrentStockCount] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive

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

  // Static Data for Shelve Locations
  const shelveLocations = [
    {
      _id: "LOC001",
      locationId: "LOC001",
      shelfName: "SH-A1",
      aisleNumber: 1,
      section: "Electronics",
      floor: 1,
      capacity: 100,
      currentStockCount: 75,
      status: true,
    },
    {
      _id: "LOC002",
      locationId: "LOC002",
      shelfName: "SH-B2",
      aisleNumber: 2,
      section: "Books",
      floor: 1,
      capacity: 200,
      currentStockCount: 120,
      status: true,
    },
    {
      _id: "LOC003",
      locationId: "LOC003",
      shelfName: "SH-C3",
      aisleNumber: 3,
      section: "Clothing",
      floor: 2,
      capacity: 150,
      currentStockCount: 90,
      status: false,
    },
    {
      _id: "LOC004",
      locationId: "LOC004",
      shelfName: "SH-D4",
      aisleNumber: 4,
      section: "Groceries",
      floor: 1,
      capacity: 300,
      currentStockCount: 200,
      status: true,
    },
    {
      _id: "LOC005",
      locationId: "LOC005",
      shelfName: "SH-E5",
      aisleNumber: 5,
      section: "Home Goods",
      floor: 2,
      capacity: 250,
      currentStockCount: 180,
      status: true,
    },
  ];

  // Initialize shelve location list with static data
  useEffect(() => {
    setShelveLocationList(shelveLocations);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Handlers
  const handleAddShelveLocation = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setLocationId("");
    setShelfName("");
    setAisleNumber("");
    setSection("");
    setFloor("");
    setCapacity("");
    setCurrentStockCount("");
    setStatus(true);
  };

  // Save or Update Shelve Location
  const handleSave = async () => {
    const formData = {
      locationId,
      shelfName,
      aisleNumber: parseInt(aisleNumber),
      section,
      floor: parseInt(floor),
      capacity: parseInt(capacity),
      currentStockCount: parseInt(currentStockCount),
      status,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Simulate API update
        setShelveLocationList(
          shelveLocationList.map((s) =>
            s._id === editId ? { ...s, ...formData } : s
          )
        );
        toast.success("✅ Shelve Location updated successfully");
      } else {
        // Simulate API create
        const newShelveLocation = {
          ...formData,
          _id: `LOC${String(1000 + shelveLocationList.length + 1).padStart(3, "0")}`,
        };
        setShelveLocationList([...shelveLocationList, newShelveLocation]);
        toast.success("✅ Shelve Location added successfully");
      }

      // Reset form
      setLocationId("");
      setShelfName("");
      setAisleNumber("");
      setSection("");
      setFloor("");
      setCapacity("");
      setCurrentStockCount("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} shelve location failed`);
    }
  };

  // Edit Shelve Location
  const handleEdit = (shelveLocation) => {
    setIsEdit(true);
    setEditId(shelveLocation._id);
    setLocationId(shelveLocation.locationId);
    setShelfName(shelveLocation.shelfName);
    setAisleNumber(shelveLocation.aisleNumber.toString());
    setSection(shelveLocation.section);
    setFloor(shelveLocation.floor.toString());
    setCapacity(shelveLocation.capacity.toString());
    setCurrentStockCount(shelveLocation.currentStockCount.toString());
    setStatus(shelveLocation.status);
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
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
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
            <div className="hidden lg:grid grid-cols-9 gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-lg">
              <div>Location ID</div>
              <div>Shelf Name / Code</div>
              <div>Aisle Number</div>
              <div>Section</div>
              <div>Floor</div>
              <div>Capacity</div>
              <div>Current Stock Count</div>
              <div>Status</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* Shelve Locations in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {shelveLocationList.map((shelveLocation) => (
                <div
                  key={shelveLocation._id}
                  className="grid grid-cols-9 items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {/* Location ID */}
                  <div className="text-sm font-medium text-gray-900">
                    {shelveLocation.locationId}
                  </div>

                  {/* Shelf Name / Code */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.shelfName}
                  </div>

                  {/* Aisle Number */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.aisleNumber}
                  </div>

                  {/* Section */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.section}
                  </div>

                  {/* Floor */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.floor}
                  </div>

                  {/* Capacity */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.capacity}
                  </div>

                  {/* Current Stock Count */}
                  <div className="text-sm text-gray-500">
                    {shelveLocation.currentStockCount}
                  </div>

                  {/* Status */}
                  <div className="text-sm font-semibold">
                    {shelveLocation.status ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
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
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setLocationId("");
                  setShelfName("");
                  setAisleNumber("");
                  setSection("");
                  setFloor("");
                  setCapacity("");
                  setCurrentStockCount("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Location ID */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Location ID <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={locationId}
                  required
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Shelf Name / Code */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Shelf Name / Code <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={shelfName}
                  required
                  onChange={(e) => setShelfName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Aisle Number */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Aisle Number <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={aisleNumber}
                  required
                  onChange={(e) => setAisleNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Section <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={section}
                  required
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Floor */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Floor <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={floor}
                  required
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Capacity <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={capacity}
                  required
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Current Stock Count */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Current Stock Count <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={currentStockCount}
                  required
                  onChange={(e) => setCurrentStockCount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    status ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      status ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{status ? "Active" : "Inactive"}</span>
              </div>

              {/* Save Button */}
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-900 w-full"
                onClick={handleSave}
              >
                Save Shelve Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelveLocation;