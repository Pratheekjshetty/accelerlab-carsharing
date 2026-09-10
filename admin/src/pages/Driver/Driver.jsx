import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaTimes} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confirmation from  '../../components/Confirmation/Confirmation';

const DriverPage = ({ url }) => {
  const [drivers, setDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const itemsPerPage = 6;
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [existingLicense, setExistingLicense] = useState(null);
  const [existingProof, setExistingProof] = useState(null);
  const [newLicense, setNewLicense] = useState(null);
  const [newProof, setNewProof] = useState(null);

  const [driverData, setDriverData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    alemail: "",
    alphone: "",
    adharnumber: "",
    licencenumber: "",
    expiredate: "",
    preferredLocation: "",
    experience: "",
    reference: "",
    language: "",
    availability: ""
  });

  // Fetch drivers
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/user/list-users/driver`);
      if (response.data.success) {
        setDrivers(response.data.users);
      } else {
        toast.error('Failed to fetch drivers');
      }
    } catch (err) {
      toast.error('An error occurred while fetching drivers');
      console.error(err);
    }
  }, [url]);

  // Deactivate driver
  const deactivateDriver = async () => {
    try {
      const response = await axios.put(`${url}/api/user/deactivate/${selectedDriver}`);
      if (response.data.success) {
        toast.success('Driver deactivated successfully');
        fetchDrivers(); // Refresh the driver list after deactivation
        setShowModal(false);
      } else {
        toast.error('Failed to deactivate driver');
      }
    } catch (err) {
      toast.error('An error occurred while deactivating the driver');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Delete / deactivate button
  const handleDeleteClick = (driverId) => {
    setSelectedDriver(driverId);
    setShowModal(true);
  };

  // Open edit model with existing driver data
  const editDriver = async (driver) => {
    try {
      const response = await axios.get(`${url}/api/driver/admin-edit/${driver._id}`);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to load driver details");
        return;
      }
      const fullDriver = response.data.driver;
      setDriverData({
        firstName: fullDriver.address?.firstName || "",
        lastName: fullDriver.address?.lastName || "",
        email: fullDriver.address?.email || "",
        phone: fullDriver.address?.phone || "",
        dob: fullDriver.address?.dob
          ? new Date(fullDriver.address.dob).toISOString().split("T")[0]
          : "",
        gender: fullDriver.address?.gender || "",
        street: fullDriver.address?.street || "",
        city: fullDriver.address?.city || "",
        state: fullDriver.address?.state || "",
        zipcode: fullDriver.address?.zipcode || "",
        country: fullDriver.address?.country || "",
        alemail: fullDriver.address?.alemail || "",
        alphone: fullDriver.address?.alphone || "",
        adharnumber: fullDriver.adharnumber || "",
        licencenumber: fullDriver.licencenumber || "",
        expiredate: fullDriver.expiredate
          ? new Date(fullDriver.expiredate).toISOString().split("T")[0]
          : "",
        preferredLocation: fullDriver.preferredLocation || "",
        experience: fullDriver.experience || "",
        reference: fullDriver.reference || "",
        language: fullDriver.language || "",
        availability: fullDriver.availability || ""
      });
      setIsEditMode(true);
      setCurrentEditId(driver._id);
      setExistingLicense(fullDriver.driversLicense || null);
      setExistingProof(fullDriver.proofOfAddress || null);
      setNewLicense(null);
      setNewProof(null);
    } catch (err) {
      toast.error("An error occurred while fetching driver details");
      console.error(err);
    }
  };

  const ALLOWED_DOC_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const MAX_DOC_SIZE_MB = 10;

  const validateDocFile = (file) => {
    if (!file) return false;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG or PDF files are allowed");
      return false;
    }
    if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be smaller than ${MAX_DOC_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const onDriverChange = (event) => {
    const { name, value } = event.target;
    setDriverData(prev => ({ ...prev, [name]: value}));
  };

  // Update driver
  const onDriverSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(driverData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (newLicense) formData.append("driversLicense", newLicense);
      if (newProof) formData.append("proofOfAddress", newProof);
      const response = await axios.put(`${url}/api/driver/admin-edit/${currentEditId}`,formData);
      if (response.data.success) {
        toast.success(response.data.message || "Driver updated successfully");
        setIsEditMode(false);
        setCurrentEditId(null);
        setExistingLicense(null);
        setExistingProof(null);
        setNewLicense(null);
        setNewProof(null);
        await fetchDrivers();
      } else {
        toast.error(response.data.message || "Failed to update driver");
      }
    } catch (error) {
      console.error("Edit driver error:", error);
      toast.error(error.response?.data?.message ||"Error while updating driver");
    }
  };

  const handleDriverCancel = () => {
    setDriverData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      alemail: "",
      alphone: "",
      adharnumber: "",
      licencenumber: "",
      expiredate: "",
      preferredLocation: "",
      experience: "",
      reference: "",
      language: "",
      availability: ""
    });
    setIsEditMode(false);
    setCurrentEditId(null);
    setExistingLicense(null);
    setExistingProof(null);
    setNewLicense(null);
    setNewProof(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = drivers.slice(startIdx, endIdx);

  // Change page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page if current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
      {/* Drivers Page Header */}
      <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-2xl font-bold text-black">
          Drivers Page
        </h2>
        {/* <button
          type="button"
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium">
          <FaPlus />
          Add New
        </button> */}
      </div>

      {/* Drivers Table */}
      <div className="list add flex-col">
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.7fr 2fr 2fr 1.5fr 0.5fr 0.5fr' }} className="title grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
            <b>Photo</b>
            <b>Name</b>
            <b>Email</b>
            <b>Contact Number</b>
            <b className="col-span-2">Action</b>
          </div>
          {/* Drivers Data */}
          {drivers.length === 0 ? (
            <div className="text-center py-10 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
                No drivers found.
            </div>
          ) : (currentItems.map((driver, index) => (
            <div key={driver._id || index}
              style={{ gridTemplateColumns: '0.7fr 2fr 2fr 1.5fr 0.5fr 0.5fr' }} className="title grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
              <img className="w-16" src={`${url}/${driver.image}`} alt="Driver Icon" />
              <p className="mt-2 mb-1">{driver.name}</p>
              <p>{driver.email}</p>
              <p>{driver.phone}</p>
              <p onClick={() => handleDeleteClick(driver._id)} className="cursor-pointer"><FaTrash /></p>
              <p onClick={() => editDriver(driver)} className="cursor-pointer"><FaEdit /></p>
            </div>
          )))}
        </div>

        {/* Pagination */}
        {drivers.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-5">
            {/* Previous Button */}
            <button
              className="px-5 py-2 bg-blue-500 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}>Prev</button>
            {/* Page Number */}
            <span className="text-sm font-medium text-black">
              Page {currentPage} of {totalPages}
            </span>
            {/* Next Button */}
            <button
              className="px-5 py-2 bg-blue-500 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Edit Driver Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleDriverCancel}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[750px] max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}>
            {/* Heading */}
            <div className="relative bg-blue-100 p-3 rounded mb-6">
              <h3 className="text-2xl font-bold text-black">Edit Driver Details</h3>
              {/* Close Button */}
              <button type="button"
                onClick={handleDriverCancel}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Edit Driver Form */}
            <form className="flex flex-col gap-6" onSubmit={onDriverSubmit}>
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="firstName"
                    value={driverData.firstName}
                    onChange={onDriverChange}
                    placeholder="First Name"
                    required/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="lastName"
                    value={driverData.lastName}
                    onChange={onDriverChange}
                    placeholder="Last Name"
                    required/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm md:col-span-2"
                    name="email"
                    type="email"
                    value={driverData.email}
                    onChange={onDriverChange}
                    placeholder="Email"
                    required/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    value={driverData.phone}
                    onChange={onDriverChange}
                    placeholder="Phone"
                    required/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="dob"
                    type="date"
                    value={driverData.dob}
                    onChange={onDriverChange}
                    required/>
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="gender"
                    value={driverData.gender}
                    onChange={onDriverChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm md:col-span-2"
                    name="street"
                    value={driverData.street}
                    onChange={onDriverChange}
                    placeholder="Street Address"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="city"
                    value={driverData.city}
                    onChange={onDriverChange}
                    placeholder="City"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="state"
                    value={driverData.state}
                    onChange={onDriverChange}
                    placeholder="State"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="zipcode"
                    value={driverData.zipcode}
                    onChange={onDriverChange}
                    placeholder="Zip Code"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="country"
                    value={driverData.country}
                    onChange={onDriverChange}
                    placeholder="Country"/>
                </div>
              </div>
              {/* Additional Contact */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Additional Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="alemail"
                    type="email"
                    value={driverData.alemail}
                    onChange={onDriverChange}
                    placeholder="Alternate Email"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="alphone"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    value={driverData.alphone}
                    onChange={onDriverChange}
                    placeholder="Alternate Phone"/>
                </div>
              </div>
              {/* Driving Information */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Driving Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="adharnumber"
                    type="tel"
                    pattern="[0-9]{12}"
                    maxLength={12}
                    minLength={12}
                    value={driverData.adharnumber}
                    onChange={onDriverChange}
                    placeholder="Aadhar Number"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="licencenumber"
                    maxLength={16}
                    minLength={16}
                    value={driverData.licencenumber}
                    onChange={onDriverChange}
                    placeholder="Driving Licence Number"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="expiredate"
                    type="date"
                    value={driverData.expiredate}
                    onChange={onDriverChange}
                    placeholder="Expiry Date"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="experience"
                    type="number"
                    value={driverData.experience}
                    onChange={onDriverChange}
                    placeholder="Years of Driving Experience"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="reference"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    value={driverData.reference}
                    onChange={onDriverChange}
                    placeholder="Reference Contact"/>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="language"
                    value={driverData.language}
                    onChange={onDriverChange}
                    placeholder="Mother Tongue"/>
                </div>
              </div>
              {/* Availability */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Availability & Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="availability"
                    value={driverData.availability}
                    onChange={onDriverChange}>
                    <option value="">Select Availability</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm"
                    name="preferredLocation"
                    value={driverData.preferredLocation}
                    onChange={onDriverChange}
                    placeholder="Preferred Location"/>
                </div>
              </div>
              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold text-[#123B66] mb-3">
                  Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driver's License */}
                  <div className="border border-gray-300 rounded-sm p-3 flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">Driver's License</p>
                    <div className="flex items-center gap-2">
                      {existingLicense ? (
                        <a href={`${url}/${existingLicense}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1.5 bg-blue-100 text-[#123B66] rounded hover:bg-blue-200 font-medium">
                          View Current
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No file uploaded</span>
                      )}
                    </div>
                    <label
                      htmlFor="editLicense"
                      className="cursor-pointer text-sm px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-center">
                      {newLicense ? newLicense.name : "Replace file"}
                    </label>
                    <input
                      id="editLicense"
                      type="file"
                      accept="image/jpeg, image/png, application/pdf"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (validateDocFile(file)) {
                          setNewLicense(file);
                        } else {
                          e.target.value = "";
                        }
                      }}/>
                  </div>
                  {/* Proof of Address */}
                  <div className="border border-gray-300 rounded-sm p-3 flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">Proof of Address</p>
                    <div className="flex items-center gap-2">
                      {existingProof ? (
                        <a href={`${url}/${existingProof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1.5 bg-blue-100 text-[#123B66] rounded hover:bg-blue-200 font-medium">
                          View Current
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No file uploaded</span>
                      )}
                    </div>
                    <label
                      htmlFor="editProof"
                      className="cursor-pointer text-sm px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-center">
                      {newProof ? newProof.name : "Replace file"}
                    </label>
                    <input
                      id="editProof"
                      type="file"
                      accept="image/jpeg, image/png, application/pdf"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (validateDocFile(file)) {
                          setNewProof(file);
                        } else {
                          e.target.value = "";
                        }
                      }}/>
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  className="w-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-medium"
                  type="submit">
                  UPDATE
                </button>
                <button
                  className="w-1/2 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-sm font-medium"
                  type="button"
                  onClick={handleDriverCancel}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Confirmation
        show={showModal}
        message="Are you sure you want to deactivate this driver?"
        onConfirm={deactivateDriver}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default DriverPage;
