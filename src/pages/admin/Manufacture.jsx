import React, { useState, useEffect, useRef } from "react";
import { PuffLoader } from "react-spinners";
import gsap from "gsap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Manufacture = () => {
  const [manufacturerList, setManufacturerList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [manufacturerId, setManufacturerId] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [ntn, setNtn] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [email, setEmail] = useState("");
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

  // Static Data for Manufacturers
  const manufacturers = [
    {
      _id: "10001",
      name: "Samsung",
      address: "123 Tech Street, Seoul, South Korea",
      phoneNumber: "+82-2-1234-5678",
      personName: "John Kim",
      mobileNumber: "+82-10-9876-5432",
      designation: "Sales Manager",
      ntn: "NTN123456789",
      gstNumber: "27ABCDE1234F1Z5",
      email: "contact@samsung.com",
      status: true,
    },
    {
      _id: "10002",
      name: "Ikea",
      address: "456 Furniture Ave, Stockholm, Sweden",
      phoneNumber: "+46-8-2345-6789",
      personName: "Anna Svensson",
      mobileNumber: "+46-70-1234-5678",
      designation: "Regional Director",
      ntn: "NTN987654321",
      gstNumber: "29FGHIJ5678K2M9",
      email: "support@ikea.com",
      status: true,
    },
    {
      _id: "10003",
      name: "Haier",
      address: "789 Appliance Road, Qingdao, China",
      phoneNumber: "+86-532-1234-5678",
      personName: "Li Wei",
      mobileNumber: "+86-138-1234-5678",
      designation: "Operations Head",
      ntn: "NTN456789123",
      gstNumber: "30NOPQR9012S3T4",
      email: "info@haier.com",
      status: false,
    },
    {
      _id: "10004",
      name: "Levis",
      address: "101 Fashion Blvd, San Francisco, USA",
      phoneNumber: "+1-415-123-4567",
      personName: "Sarah Johnson",
      mobileNumber: "+1-510-987-6543",
      designation: "Marketing Lead",
      ntn: "NTN789123456",
      gstNumber: "06UVWXY3456Z7A8",
      email: "sales@levis.com",
      status: true,
    },
    {
      _id: "10005",
      name: "Oxford",
      address: "202 Stationery Lane, London, UK",
      phoneNumber: "+44-20-1234-5678",
      personName: "James Brown",
      mobileNumber: "+44-7700-123456",
      designation: "Procurement Manager",
      ntn: "NTN321654987",
      gstNumber: "09BCDEF6789G1H2",
      email: "contact@oxford.com",
      status: false,
    },
  ];

  // Initialize manufacturer list with static data
  useEffect(() => {
    setManufacturerList(manufacturers);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Handlers
  const handleAddManufacturer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setManufacturerId("");
    setManufacturerName("");
    setAddress("");
    setPhoneNumber("");
    setPersonName("");
    setMobileNumber("");
    setDesignation("");
    setNtn("");
    setGstNumber("");
    setEmail("");
    setStatus(true);
  };

  // Save or Update Manufacturer
  const handleSave = async () => {
    const formData = {
      _id: manufacturerId,
      name: manufacturerName,
      address,
      phoneNumber,
      personName,
      mobileNumber,
      designation,
      ntn,
      gstNumber,
      email,
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
        setManufacturerList(
          manufacturerList.map((m) =>
            m._id === editId ? { ...m, ...formData } : m
          )
        );
        toast.success("✅ Manufacturer updated successfully");
      } else {
        // Simulate API create
        const newManufacturer = {
          ...formData,
          _id: String(10000 + manufacturerList.length + 1),
        };
        setManufacturerList([...manufacturerList, newManufacturer]);
        toast.success("✅ Manufacturer added successfully");
      }

      // Reset form
      setManufacturerId("");
      setManufacturerName("");
      setAddress("");
      setPhoneNumber("");
      setPersonName("");
      setMobileNumber("");
      setDesignation("");
      setNtn("");
      setGstNumber("");
      setEmail("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} manufacturer failed`);
    }
  };

  // Edit Manufacturer
  const handleEdit = (manufacturer) => {
    setIsEdit(true);
    setEditId(manufacturer._id);
    setManufacturerId(manufacturer._id);
    setManufacturerName(manufacturer.name);
    setAddress(manufacturer.address);
    setPhoneNumber(manufacturer.phoneNumber);
    setPersonName(manufacturer.personName);
    setMobileNumber(manufacturer.mobileNumber);
    setDesignation(manufacturer.designation);
    setNtn(manufacturer.ntn);
    setGstNumber(manufacturer.gstNumber);
    setEmail(manufacturer.email);
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
            Manufacturers List
          </h1>
          <p className="text-gray-500 text-sm">Manage your manufacturer details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddManufacturer}
        >
          + Add Manufacturer
        </button>
      </div>

      {/* Manufacturer Table */}
      <div className="rounded-xl shadow p-6 border border-gray-100 w-full">
        {/* Wrap the whole table area in a scrollable box */}
        <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[500px]">
          <div className="min-w-max">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-[130px_120px_240px_120px_120px_120px_120px_120px_120px_100px_60px] gap-4 bg-gray-50 py-3 px-6 text-xs font-medium text-gray-500 uppercase rounded-t-lg sticky top-0 z-10">
              <div>Manufacturer ID</div>
              <div>Name</div>
              <div>Address</div>
              <div>Phone Number</div>
              <div>Person Name</div>
              <div>Mobile Number</div>
              <div>Designation</div>
              <div>NTN</div>
              <div>GST</div>
              <div className="items-center flex justify-center">Status</div>
              {userInfo?.isAdmin && <div className="text-center">Actions</div>}
            </div>

            {/* Manufacturers in Table */}
            <div className="mt-4 flex flex-col gap-[14px] pb-14">
              {manufacturerList.map((manufacturer) => (
                <div
                  key={manufacturer._id}
                  className="px-4 grid grid-cols-[130px_120px_240px_120px_120px_120px_120px_120px_120px_100px_60px] items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {manufacturer._id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.address}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.personName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.mobileNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.designation}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.ntn}
                  </div>
                  <div className="text-sm text-gray-500">
                    {manufacturer.gstNumber}
                  </div>
                  <div className="text-sm font-semibold items-center flex justify-center">
                    {manufacturer.status ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </div>
                  {userInfo?.isAdmin && (
                    <div className="flex justify-center">
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
                {isEdit ? "Update Manufacturer" : "Add a New Manufacturer"}
              </h2>
              <button
                className="text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setManufacturerId("");
                  setManufacturerName("");
                  setAddress("");
                  setPhoneNumber("");
                  setPersonName("");
                  setMobileNumber("");
                  setDesignation("");
                  setNtn("");
                  setGstNumber("");
                  setEmail("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Manufacturer ID */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Manufacturer ID <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturerId}
                  required
                  onChange={(e) => setManufacturerId(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={isEdit}
                  placeholder="e.g. 10001"
                />
              </div>

              {/* Manufacturer Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Manufacturer Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturerName}
                  required
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Address <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Email Address <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Phone Number <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  required
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. +82-2-1234-5678"
                />
              </div>

              {/* Person Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Person Name <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={personName}
                  required
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Mobile Number <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  required
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. +82-10-9876-5432"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Designation <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  required
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* NTN */}
              <div>
                <label className="block text-gray-700 font-medium">
                  NTN <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={ntn}
                  required
                  onChange={(e) => setNtn(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. NTN123456789"
                />
              </div>

              {/* GST/Tax Number */}
              <div>
                <label className="block text-gray-700 font-medium">
                  GST/Tax Number <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  required
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 27ABCDE1234F1Z5"
                />
              </div>



              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${status ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${status ? "translate-x-7" : "translate-x-0"
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
                Save Manufacturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manufacture;
