import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

const Booking = ({ url }) => {
  const [booking, setBooking] = useState([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sortBookings = (bookings) => {
    return bookings.sort((a, b) => {
      const dateA = new Date(a.pickupdate || 0);
      const dateB = new Date(b.pickupdate || 0);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      if (!a.pickuptime || !b.pickuptime) return 0;
      const timeA = a.pickuptime?.split(':').map(Number);
      const timeB = b.pickuptime?.split(':').map(Number);
      if (timeA[0] < timeB[0]) return -1;
      if (timeA[0] > timeB[0]) return 1;
      if (timeA[1] < timeB[1]) return -1;
      if (timeA[1] > timeB[1]) return 1;
      return 0;
    });
  };

  // Fetch bookings
  const fetchAllBooking = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/book/listbooking");
      if (response.data.success) {
        const sortedBookings = sortBookings(response.data.data);
        const reversedBookings = sortedBookings.reverse();
        setBooking(reversedBookings);
      } else {
        toast.error("Failed to fetch booking");
      }
    } catch (err) {
      toast.error("An error occurred while fetching booking");
      console.error(err);
    }
  }, [url]);

  // Fetch admin bookings
  const fetchAdminBooking = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/available/admin-booked-cars");
      if (response.data.success) {
        const sortedBookings = sortBookings(response.data.data);
        const reversedBookings = sortedBookings.reverse();  
        setBooking(reversedBookings);
      } else {
        toast.error("Failed to fetch admin bookings");
      }
    } catch (err) {
      toast.error("An error occurred while fetching admin bookings");
      console.error(err);
    }
  }, [url]);

  useEffect(() => {
    if (isAdminView) {
      fetchAdminBooking();
    } else {
      fetchAllBooking();
    }
  }, [isAdminView, fetchAdminBooking, fetchAllBooking]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalPages = Math.ceil(booking.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = booking.slice(startIdx, endIdx);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
      {/* Booking Page Header */}
      <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-2xl font-bold text-black">
          Booking Page
        </h2>
        <button 
          type="button" 
          onClick={() => setIsAdminView(!isAdminView)}
          className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded font-medium'>
          {isAdminView ? 'User Bookings' : 'Admin Bookings'}
        </button>
      </div>

      {/* Rent Booking Table */}
      <div className="list add flex-col">
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.7fr 2.2fr 1.4fr 1fr 1.4fr 1fr 1fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
            <b>Applied Date</b>
            <b>Personal Details</b>
            <b>Car Name</b>
            <b>Car Image</b>
            <b>Booking Details</b>
            <b>Booking From</b>
            <b>Booking To</b>
            <b>Status</b>
          </div>
          {/* Car Booking Data */}
          {booking.length === 0 ? (
            <div className="text-center py-10 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
              No bookings found.
            </div>
          ) : (currentItems.map((rent) => {
              return (
                <div key={rent._id}
                  style={{ gridTemplateColumns: '0.7fr 2.2fr 1.4fr 1fr 1.4fr 1fr 1fr 0.8fr'}} className="grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
                  {/* Applied Date */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {formatDate(rent.date)}
                    </p>
                  </div>
                  {/* Personal Details */}
                  {!isAdminView ? (
                    <div>
                      <p className="font-medium text-gray-700">
                        {rent.address?.firstName} {rent.address?.lastName}
                      </p>
                      <p>{rent.address?.street}</p>
                      <p>
                        {rent.address?.city}, {rent.address?.state}
                      </p>
                      <p>
                        {rent.address?.country}, {rent.address?.zipcode}
                      </p>
                      <p>+91-{rent.address?.phone}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-700">
                        Pratheek J Shetty
                      </p>
                      <p>Padantarakodi House, Ajjibettu Village</p>
                      <p>Mangalore, Karnataka</p>
                      <p>India, 574324</p>
                      <p>+91-9480984886</p>
                    </div>
                  )}
                  {/* Car Name */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {rent.caritem?.name}
                    </p>
                  </div>
                  {/* Car Image */}
                  <div className="flex justify-center items-center">
                    <img className="w-16"
                      src={url + "/images/" + rent.caritem?.image}
                      alt="carImage"/>
                  </div>
                  {/* Booking Details */}
                  {!isAdminView ? (
                    <div>
                      <p className="font-medium text-gray-700">
                        ₹ {rent.amount}.00
                      </p>
                      <p>{rent.address?.from} to</p>
                      <p>{rent.address?.to}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-700">
                        ₹ {rent.amount}.00
                      </p>
                    </div>
                  )}
                  {/* Booking From */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {formatDate(rent.pickupdate || rent.startdate)}
                    </p>
                    {!isAdminView && (
                      <p>{rent.pickuptime || rent.startdate}</p>
                    )}
                  </div>
                  {/* Booking To */}
                  <div>
                    <p className="font-medium text-gray-700">
                      {formatDate(rent.dropoffdate || rent.enddate)}
                    </p>
                    {!isAdminView && (
                      <p>{rent.dropofftime || rent.enddate}</p>
                    )}
                  </div>
                  {/* Status */}
                  <div>
                    <p className="font-medium text-gray-700">
                      <span className="text-blue-500">&#x25cf;</span>{" "}
                      <b>{rent.status}</b>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {booking.length > itemsPerPage && (
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
    </div>
  );
};

export default Booking;
