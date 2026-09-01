import React, { useCallback, useEffect, useState } from 'react';
import upload_area from '../../assets/upload_area.png';
import axios from 'axios';
import { FaTrash, FaEdit, FaTimes, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confirmation from '../../components/Confirmation/Confirmation';

const UserPage = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const itemsPerPage = 8;
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addImage, setAddImage] = useState(false);
  const [image, setImage] = useState(false);

  const [addData, setAddData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/user/list-users/user`);
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (err) {
      toast.error('An error occurred while fetching users');
    }
  }, [url]);

  // Deactivate user
  const deactivateUser = async () => {
    try {
      const response = await axios.put(`${url}/api/user/deactivate/${selectedUser}`);
      if (response.data.success) {
        toast.success('User deactivated successfully');
        await fetchUsers();
        setShowModal(false);
      } else {
        toast.error('Failed to deactivate user');
      }
    } catch (err) {
      toast.error('An error occurred while deactivating the user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lock background scroll while a modal is open
  useEffect(() => {
    document.body.style.overflow = (isEditMode || isAddMode) ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isEditMode, isAddMode]);

  // Delete / deactivate button
  const handleDeleteClick = (userId) => {
    setSelectedUser(userId);
    setShowModal(true);
  };

  // Open edit modal with existing user data
  const editUser = (user) => {
    setData({
      name: user.name,
      phone: user.phone,
      email: user.email,
    });
    setImage(false);
    setCurrentEditId(user._id);
    setIsEditMode(true);
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }));
  };

  // Update user
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", currentEditId);
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (image) {
        formData.append("image", image);
      }
      const response = await axios.put(`${url}/api/user/admin-edit/${currentEditId}`,formData);
      if (response.data.success) {
        setData({ name: "", phone: "", email: "" });
        setImage(false);
        setIsEditMode(false);
        setCurrentEditId(null);
        toast.success(response.data.message || "User updated successfully");
        await fetchUsers();
      } else {
        toast.error(response.data.message || "Error while updating the user");
      }
    } catch (error) {
      console.error("Edit user error:", error);
      toast.error(error.response?.data?.message || "Error while updating the user");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setCurrentEditId(null);
    setData({ name: "", phone: "", email: "" });
    setImage(false);
  };

  // Add new user
  const handleAddUser = async (event) => {
    event.preventDefault();
    if (!addImage) {
      toast.error("Please upload a profile image");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", addData.name);
      formData.append("phone", addData.phone);
      formData.append("email", addData.email);
      formData.append("password", addData.password);
      formData.append("image", addImage);
      const response = await axios.post(`${url}/api/user/add`, formData);
      if (response.data.success) {
        toast.success(response.data.message || "User added successfully");
        setAddData({ name: "", phone: "", email: "", password: "" });
        setAddImage(false);
        setIsAddMode(false);
        await fetchUsers();
      } else {
        toast.error(response.data.message || "Error while adding the user");
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error(error.response?.data?.message || "Error while adding the user");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = users.slice(startIdx, endIdx);

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
      {/* Users Page Header */}
      <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-2xl font-bold text-black">
          Users Page
        </h2>
        <button
          type="button"
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium">
          <FaPlus />
          Add New
        </button>
      </div>

      {/* Users Table */}
      <div className="list add flex-col">
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.5fr 2fr 2fr 1.5fr 0.5fr 0.5fr' }} className="title grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
            <b>Profile</b>
            <b>Name</b>
            <b>Email</b>
            <b>Contact Number</b>
            <b className="col-span-2">Action</b>
          </div>
          {/* User Data */}
          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
                No users found.
            </div>
          ) : (currentItems.map((user, index) => (
            <div key={user._id || index}
              style={{ gridTemplateColumns: '0.5fr 2fr 2fr 1.5fr 0.5fr 0.5fr' }} className="title grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
              <img className="w-[50px] h-[50px] object-cover rounded-full" src={`${url}/${user.image}`} alt="User Profile"/>
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <p onClick={() => handleDeleteClick(user._id)} className="cursor-pointer"><FaTrash /></p>
              <p onClick={() => editUser(user)} className="cursor-pointer"><FaEdit /></p>
            </div>
          )))}
        </div>

        {/* Pagination */}
        {users.length > itemsPerPage && (
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

      {/* Edit User Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}>
            {/* Heading */}
            <div className="relative bg-blue-100 p-3 rounded mb-6">
              <h3 className="text-2xl font-bold text-black">Edit User</h3>
              {/* Close Button */}
              <button type="button"
                onClick={handleCancel}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Edit User Form */}
            <form className="flex flex-col gap-5" onSubmit={onSubmitHandler}>
              {/* Upload Image */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">Profile Image</p>
                <label htmlFor="editImage" className="cursor-pointer w-fit">
                  <img
                    className="w-32 h-24 object-contain border border-dashed border-gray-300 rounded-full"
                    src={image ? URL.createObjectURL(image) : upload_area}
                    alt="Upload"/>
                </label>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="editImage"
                  hidden/>
              </div>
              {/* Name */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Name</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  name="name"
                  placeholder="Type here"
                  required/>
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Phone Number</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.phone}
                  type="tel"
                  name="phone"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a valid 10-digit phone number"
                  placeholder="9876543210"
                  required/>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.email}
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required/>
              </div>
              {/* Buttons */}
              <div className="flex flex-row gap-3 w-full pt-2">
                <button
                  className="w-1/2 border-none p-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-medium"
                  type="submit">
                  UPDATE
                </button>
                <button
                  className="w-1/2 border-none p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-sm font-medium"
                  type="button"
                  onClick={handleCancel}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddMode(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}>
              {/* Heading */}
            <div className="relative bg-blue-100 p-3 rounded mb-6">
              <h3 className="text-2xl font-bold text-black">Add New User</h3>
              {/* Close Button */}
              <button type="button"
                onClick={() => setIsAddMode(false)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Add User Form */}
            <form className="flex flex-col gap-5" onSubmit={handleAddUser}>
              {/* Upload Image */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">Profile Image</p>
                <label htmlFor="addUserImage" className="cursor-pointer w-fit">
                  <img
                    className="w-32 h-24 object-contain border border-dashed border-gray-300 rounded-full"
                    src={addImage ? URL.createObjectURL(addImage) : upload_area}
                    alt="Upload"/>
                </label>
                <input
                  onChange={(e) => setAddImage(e.target.files[0])}
                  type="file"
                  id="addUserImage"
                  hidden
                  required/>
              </div>
              {/* Name */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Name</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                  value={addData.name}
                  type="text"
                  placeholder="Type here"
                  required/>
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Phone Number</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={(e) => setAddData({ ...addData, phone: e.target.value })}
                  value={addData.phone}
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a valid 10-digit phone number"
                  placeholder="9876543210"
                  required/>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                  value={addData.email}
                  type="email"
                  placeholder="name@example.com"
                  required/>
              </div>
              {/* Password */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Password</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                  value={addData.password}
                  type="password"
                  placeholder="Enter password"
                  required/>
              </div>
              {/* Buttons */}
              <div className="flex flex-row gap-3 w-full pt-2">
                <button
                  className="w-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-medium"
                  type="submit">
                  ADD USER
                </button>
                <button
                  className="w-1/2 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-sm font-medium"
                  type="button"
                  onClick={() => setIsAddMode(false)}>
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
        message="Are you sure you want to deactivate this user?"
        onConfirm={deactivateUser}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserPage;
