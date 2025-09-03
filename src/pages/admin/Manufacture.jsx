import React, { useState, useEffect, useRef } from "react";
import { HashLoader } from "react-spinners";
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
  const [status, setStatus] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "expo.out" }
      );
    }
  }, [isSliderOpen]);

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

  useEffect(() => {
    setManufacturerList(manufacturers);
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
        setManufacturerList(
          manufacturerList.map((m) =>
            m._id === editId ? { ...m, ...formData } : m
          )
        );
        toast.success("✅ Manufacturer updated successfully");
      } else {
        const newManufacturer = {
          ...formData,
          _id: String(10000 + manufacturerList.length + 1),
        };
        setManufacturerList([...manufacturerList, newManufacturer]);
        toast.success("✅ Manufacturer added successfully");
      }

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
      <div className="rounded-xl shadow border border-gray-100">
        <div className="table-container max-w-full overflow-x-auto">
          <div className="min-w-[1000px] max-w-[100%]">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px] gap-2 bg-gray-50 py-2 px-3 text-xs font-medium text-gray-500 uppercase rounded-t-lg">
              <div>Manufacturer ID</div>
              <div>Name</div>
              <div>Address</div>
              <div>Phone Number</div>
              <div>Person Name</div>
              <div>Mobile Number</div>
              <div>Designation</div>
              <div>NTN</div>
              <div>GST</div>
              <div className="text-center">Status</div>
              {userInfo?.isAdmin && <div className="text-center">Actions</div>}
            </div>

            {/* Manufacturers in Table */}
            <div className="flex flex-col gap-2">
              {manufacturerList.map((manufacturer) => (
                <div
                  key={manufacturer._id}
                  className="grid grid-cols-[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px] items-center gap-2 bg-white p-2 rounded-lg border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {manufacturer._id}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.address}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.personName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.mobileNumber}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.designation}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.ntn}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {manufacturer.gstNumber}
                  </div>
                  <div className="text-sm font-semibold text-center">
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
            className="w-full max-w-md bg-white p-6 h-full overflow-y-auto shadow-lg"
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

            <div className="space-y-4">
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
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                Save Manufacturer
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .table-container {
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #a0aec0 #edf2f7;
        }
        .table-container::-webkit-scrollbar {
          height: 6px;
        }
        .table-container::-webkit-scrollbar-track {
          background: #edf2f7;
          border-radius: 4px;
        }
        .table-container::-webkit-scrollbar-thumb {
          background: #a0aec0;
          border-radius: 4px;
        }
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        @media (max-width: 1024px) {
          .min-w-\[1000px\] {
            min-width: 800px;
          }
          .grid-cols-\[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px\] {
            grid-template-columns: 80px 80px 150px 100px 100px 100px 100px 100px 100px 60px 60px;
          }
        }
        @media (max-width: 640px) {
          .min-w-\[1000px\] {
            min-width: 600px;
          }
          .grid-cols-\[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px\] {
            grid-template-columns: 70px 70px 120px 90px 90px 90px 90px 90px 90px 50px 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default Manufacture;