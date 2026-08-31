import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confirmation from '../../components/Confirmation/Confirmation';

const UserPage = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  // Fetch users when page loads
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Delete / deactivate button
  const handleDeleteClick = (userId) => {
    setSelectedUser(userId);
    setShowModal(true);
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
      </div>
      {/* Users Table */}
      <div className="list add flex-col">
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.5fr 2fr 2fr 1.5fr 0.5fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#f9f9f9]">
            <b>Profile</b>
            <b>Name</b>
            <b>Email</b>
            <b>Contact Number</b>
            <b>Action</b>
          </div>
          {/* User Data */}
          {currentItems.map((user, index) => (
            <div key={user._id || index}
              style={{
                gridTemplateColumns: '0.5fr 2fr 2fr 1.5fr 0.5fr'
              }}className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
              {/* Profile */}
              <img className="w-[50px] h-[50px] object-cover rounded-full" src={`${url}/${user.image}`} alt="User Profile"/>
              {/* Name */}
              <p>{user.name}</p>
              {/* Email */}
              <p>{user.email}</p>
              {/* Contact Number */}
              <p>{user.phone}</p>
              {/* Action */}
              <p onClick={() => handleDeleteClick(user._id)}className="cursor-pointer"><FaTrash /></p>
            </div>
          ))}
        </div>
        {/* No Users */}
        {users.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No users found.
          </div>
        )}
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