import React, { useEffect, useState, useCallback } from 'react';
import pending_icon from '../../assets/pending_icon.png';
import approve_icon from '../../assets/approve_icon.png';
import reject_icon from '../../assets/reject_icon.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import Confirmation from '../../components/Confirmation/Confirmation';

const Cancel = ({ url }) => {
    const [cancellations, setCancellations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statuses, setStatuses] = useState({});
    const [selectedCancellation, setSelectedCancellation] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [action, setAction] = useState(null);
    const itemsPerPage = 5;

    const fetchCancellations = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/cancel/cancellations`);
            const reversedCancellations = response.data.reverse();
            setCancellations(reversedCancellations);
            const newStatuses = {};
                reversedCancellations.forEach((cancellation) => {
                newStatuses[cancellation.bookingid] = cancellation.status;
            });
            setStatuses(newStatuses);
        } catch (err) {
            toast.error("An error occurred while fetching cancellations");
            console.error(err);  
        }
    }, [url]);

    const isButtonActive = (pickupDate, pickupTime) => {
        const pickupDateTime = new Date(pickupDate);
        const [hours, minutes] = pickupTime.split(':');
        pickupDateTime.setHours(hours, minutes);
        const currentTime = new Date();
        const timeDifference = pickupDateTime - currentTime;
        return timeDifference > 10 * 60 * 1000; // 10 minutes
    };

    const statusHandler = async (bookingid, actionType) => {
        try {
            const endpoint = actionType === 'Cancellation Approved'
                ? `${url}/api/cancel/update-status`
                : `${url}/api/cancel/delete-status`;
            await axios.post(endpoint, { bookingid });
            toast.success(`Cancellation ${actionType === 'Cancellation Approved' ? 'approved' : 'rejected'} successfully`);
            fetchCancellations();
        } catch (err) {
            console.error(`Error ${actionType.toLowerCase()}:`, err);
            toast.error(`Failed to ${actionType.toLowerCase()}`);
        }
    };
    
    useEffect(() => {
        fetchCancellations();
    }, [fetchCancellations]);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const totalPages = Math.ceil(cancellations.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentItems = cancellations.slice(startIdx, endIdx);

    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    };

    const handleActionClick = (cancellation, actionType) => {
        setSelectedCancellation(cancellation);
        setAction(actionType);
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        if (selectedCancellation) {
            statusHandler(selectedCancellation.bookingid, action);
        }
        setShowConfirmation(false);
        setSelectedCancellation(null);
        setAction(null);
    };  

    return (
        <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
           {/* Cancellation Requests Header */}
            <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
                <h2 className="text-2xl font-bold text-black">
                    Cancellation Requests
                </h2>
            </div> 

            {/* Cancellation Requests Table */}
            <div className="list add flex-col">
                <div className="list-table">
                    {/* Column Titles */}
                    <div style={{ gridTemplateColumns: '0.7fr 2fr 1.2fr 1.2fr 2.1fr 0.7fr 0.8fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
                        <b>Applied Date</b>
                        <b>Personal Details</b>
                        <b>Cancellation Date</b>
                        <b>Booking From</b>
                        <b>Reason for Cancellation</b>
                        <b>Status</b>
                        <b className="col-span-2">Action</b>
                    </div>
                    {/* Cancellation Data */}
                    {cancellations.length === 0 ? (
                        <div className="text-center py-10 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
                            No cancellation found.
                        </div>
                    ) : (currentItems.map((cancellation) => {
                            const status = statuses[cancellation.bookingid];
                            const buttonActive = isButtonActive(cancellation.pickupdate, cancellation.pickuptime);
                            return (
                                <div key={cancellation._id} 
                                    style={{ gridTemplateColumns: '0.7fr 2fr 1.2fr 1.2fr 2.1fr 0.7fr 0.8fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
                                    {/* Applied Date */}
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {formatDate(cancellation.bookingdate)}
                                        </p>
                                    </div>
                                    {/* Personal Details */}
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {cancellation.firstName} 
                                            {cancellation.lastName}
                                        </p>
                                        <p>{cancellation.email}</p>
                                        <p>{cancellation.phone}</p>
                                    </div>
                                    {/* Cancellation Date */}
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {formatDate(cancellation.currentdate)}
                                        </p>
                                    </div>
                                    {/* Pickup Details */}
                                    <div>
                                        <p className="font-medium text-gray-700">{formatDate(cancellation.pickupdate)}</p>
                                        <p>{cancellation.pickuptime}</p>
                                    </div>
                                    {/* Reason */}
                                    <p className="font-medium text-gray-700">
                                        {cancellation.reason}
                                    </p>
                                    {/* Status */}
                                    <div className="flex justify-center items-center gap-2">
                                        <img className="w-12 h-12" src={ status === "Cancellation Approved" ? approve_icon : status === "Cancellation Rejected" ? reject_icon : pending_icon}
                                            alt={ status === "Cancellation Approved" ? "Approved" : status === "Cancellation Rejected" ? "Rejected" : "Pending"}/>
                                    </div>
                                    {/* Accept / Approved */}
                                    {status === "Cancellation Approved" ? (
                                    <div className="p-2 text-center bg-green-200 border border-green-500 text-green-700 font-medium">
                                        Approved
                                    </div>
                                    ) : (
                                        <button
                                            className={`p-2 outline-none transition-transform duration-300 hover:scale-105 ${
                                            buttonActive
                                                ? "bg-blue-200 border border-blue-500"
                                                : "bg-gray-300 border border-gray-500 cursor-not-allowed"
                                            }`}
                                            onClick={() => {
                                            if (buttonActive) {
                                                handleActionClick(cancellation, "Cancellation Approved");
                                            } else {
                                                alert("Accept action is not allowed within 10 minutes of pickup time.");
                                            }
                                            }}>
                                            Accept
                                        </button>
                                    )}
                                    {/* Reject / Rejected */}
                                    {status === "Cancellation Rejected" ? (
                                    <div className="p-2 text-center bg-orange-200 border border-orange-500 text-orange-700 font-medium">
                                        Rejected
                                    </div>
                                    ) : (
                                        <button
                                            className={`p-2 outline-none transition-transform duration-300 hover:scale-105 ${
                                            buttonActive
                                                ? "bg-red-200 border border-red-500"
                                                : "bg-gray-300 border border-gray-500 cursor-not-allowed"
                                            }`}
                                            onClick={() => {
                                            if (buttonActive) {
                                                handleActionClick(cancellation, "Cancellation Rejected");
                                            } else {
                                                alert("Reject action is not allowed within 10 minutes of pickup time.");
                                            }
                                            }}>
                                            Reject
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {cancellations.length > itemsPerPage && (
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
                message={`Are you sure you want to ${action === 'Cancellation Approved' ? 'approve' : 'reject'} this cancellation?`}
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirmation(false)}
            />
        </div>
    );
};

export default Cancel;