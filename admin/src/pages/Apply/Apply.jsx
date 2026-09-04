import React, { useCallback, useState, useEffect } from 'react';
import pending_icon from '../../assets/pending_icon.png';
import approve_icon from '../../assets/approve_icon.png';
import reject_icon from '../../assets/reject_icon.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import Confirmation from '../../components/Confirmation/Confirmation';

const Apply = ({ url }) => {
  const [applications, setApplications] = useState([]);  
  const [currentPage, setCurrentPage] = useState(1);
  const [statuses, setStatuses] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState(null);
  const itemsPerPage = 5;

  const fetchApplications = useCallback(async () => {
    try {
        const response = await axios.get(`${url}/api/driver/applications`);
        const reversedApplications = response.data.reverse();
        setApplications(reversedApplications);
        const newStatuses = {};
            reversedApplications.forEach(app => {
            newStatuses[app.userId] = app.status;
        });
        setStatuses(newStatuses);
    } catch (err) {
      toast.error("An error occurred while fetching applications");
      console.error(err);
    }
  }, [url]);

  const updateStatus = async (userId, status) => {
    try {
      const endpoint = status === 'Driver Confirmed'
        ? `${url}/api/driver/update-role`
        : `${url}/api/driver/delete-role`;
      await axios.post(endpoint, { userId });
      toast.success(`Driver application ${status === 'Driver Confirmed' ? 'accepted' : 'rejected'} successfully`);
      setStatuses(prev => ({ ...prev, [userId]: status }));
    } catch (err) {
      console.error(`Error updating driver status: ${status}`, err);
      toast.error(`Failed to update driver status`);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = applications.slice(startIdx, endIdx);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleActionClick = (application, actionType) => {
    setSelectedApplication(application);
    setAction(actionType);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedApplication) {
      updateStatus(selectedApplication.userId, action);
    }
    setShowConfirmation(false);
    setSelectedApplication(null);
    setAction(null);
  };

  return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
      {/* Driver Application Header */}
      <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-2xl font-bold text-black">
          Driver Applications
        </h2>
      </div>

      {/* Driver Application Table */}
      <div className="list add flex-col">
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.7fr 2fr 2fr 1fr 1.5fr 0.7fr 0.8fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
            <b>Applied Date</b>
            <b>Personal Details</b>
            <b>Driving Details</b>
            <b>Availability</b>
            <b>Preferred Location</b>
            <b>Status</b>
            <b className="col-span-2">Action</b>
          </div>
          {/* Application Data */}
          {applications.length === 0 ? (
            <div className="text-center py-10 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
              No applications found.
            </div>
          ) : (currentItems.map((application) => {
              const status = statuses[application.userId];
              return (
                <div key={application._id}
                  style={{ gridTemplateColumns: '0.7fr 2fr 2fr 1fr 1.5fr 0.7fr 0.8fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
                  {/* Applied Date */}
                  <div>
                      <p className="font-medium text-gray-700">
                          {formatDate(application.date)}
                      </p>
                  </div>
                  {/* Personal Details */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {application.address.firstName}{" "}
                      {application.address.lastName}
                    </p>
                    <p>{application.address.email}</p>
                    <p>{application.address.phone}</p>
                  </div>
                  {/* Driving Details */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {application.licencenumber}
                    </p>
                    <p>
                      {formatDate(application.expiredate)}
                    </p>
                    <p>
                      {application.experience} years
                    </p>
                  </div>
                  {/* Availability */}
                  <p className="font-medium text-gray-700">
                    {application.availability}
                  </p>
                  {/* Preferred Location */}
                  <p className="font-medium text-gray-700">
                    {application.preferredLocation}
                  </p>
                  {/* Status */}
                  <div className="flex justify-center items-center gap-2">
                      <img className="w-12 h-12" src={ status === "Driver Confirmed" ? approve_icon : status === "Driver Rejected" ? reject_icon : pending_icon}
                        alt={ status === "Driver Confirmed" ? "Approved" : status === "Driver Rejected" ? "Rejected" : "Pending"}/>
                  </div>
                  {/* Accept / Approved */}
                  {status === "Driver Confirmed" ? (
                    <div className="p-2 text-center bg-green-200 border border-green-500 text-green-700 font-medium">
                      Approved
                    </div>
                  ) : (
                    <button
                      className="p-2 outline-none transition-transform duration-300 hover:scale-105 bg-blue-200 border border-blue-500"
                      onClick={() =>
                        handleActionClick(
                          application,
                          "Driver Confirmed"
                        )
                      }>
                      Accept
                    </button>
                  )}
                  {/* Reject / Rejected */}
                  {status === "Driver Rejected" ? (
                    <div className="p-2 text-center bg-orange-200 border border-orange-500 text-orange-700 font-medium">
                      Rejected
                    </div>
                  ) : (
                    <button
                      className="p-2 outline-none transition-transform duration-300 hover:scale-105 bg-red-200 border border-red-500"
                      onClick={() =>
                        handleActionClick(
                          application,
                          "Driver Rejected"
                        )
                      }>
                      Reject
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {applications.length > itemsPerPage && (
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
        show={showConfirmation}
        message={`Are you sure you want to ${action === 'Driver Confirmed' ? 'accept' : 'reject'} this application?`}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  )
}

export default Apply;
