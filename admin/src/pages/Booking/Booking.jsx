import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { FaPlus, FaTimes } from "react-icons/fa";

const Booking = ({ url }) => {
  const [booking, setBooking] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [addData, setAddData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    from: "",
    to: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    carName: "",
    carImage: "",
    amount: "",
    pickupdate: "",
    dropoffdate: "",
    pickuptime: "",
    dropofftime: "",
    status: "Car Booked",
    payment: true
  });

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

  useEffect(() => {
    document.body.style.overflow = isAddMode ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAddMode]);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        address: {
          firstName: addData.firstName,
          lastName: addData.lastName,
          email: addData.email,
          phone: addData.phone,
          from: addData.from,
          to: addData.to,
          street: addData.street,
          city: addData.city,
          state: addData.state,
          zipcode: addData.zipcode,
          country: addData.country
        },
        caritem: {
          name: addData.carName,
          image: addData.carImage
        },
        amount: Number(addData.amount),
        pickupdate: addData.pickupdate,
        dropoffdate: addData.dropoffdate,
        pickuptime: addData.pickuptime,
        dropofftime: addData.dropofftime,
        status: addData.status,
        payment: addData.payment
      };
      const response = await axios.post(
        `${url}/api/book/admin-add-booking`,
        bookingData
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Booking added successfully"
        );
        setAddData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          from: "",
          to: "",
          street: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          carName: "",
          carImage: "",
          amount: "",
          pickupdate: "",
          dropoffdate: "",
          pickuptime: "",
          dropofftime: "",
          status: "Car Booked",
          payment: true
        });
        setIsAddMode(false);
        if (isAdminView) {
          fetchAdminBooking();
        } else {
          fetchAllBooking();
        }
      } else {
        toast.error(response.data.message || "Failed to add booking");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Error while adding booking"
      );
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(booking.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = booking.slice(startIdx, endIdx);

  // Change page
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
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
          <FaPlus />
          Add Booking
        </button>
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

      {/* Add Booking Modal */}
      {isAddMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddMode(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative bg-blue-100 p-3 rounded mb-6">
              <h3 className="text-2xl font-bold text-black">Add New Booking</h3>
              {/* Close Button */}
              <button type="button" onClick={() => setIsAddMode(false)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Add New Booking Form */}
            <form className="flex flex-col gap-5" onSubmit={handleAddBooking}>
              {/* CUSTOMER DETAILS */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">
                  Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input type="text" name="firstName" value={addData.firstName}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type First Name" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input type="text" name="lastName" value={addData.lastName}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Last Name" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input type="email" name="email" value={addData.email}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Email" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input type="tel" name="phone" value={addData.phone}
                      onChange={handleAddChange} maxLength="10" className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Phone Number" required/>
                  </div>
                </div>
              </div>
              {/* BOOKING DETAILS */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">
                  Booking Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      From Place
                    </label>
                    <input type="text" name="from" value={addData.from}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type From Place" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      To Place
                    </label>
                    <input type="text" name="to" value={addData.to}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type To Place" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Pickup Date
                    </label>
                    <input type="date" name="pickupdate" value={addData.pickupdate}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Select Pickup Date" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Pickup Time
                    </label>
                    <input type="time" name="pickuptime" value={addData.pickuptime}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Select Pickup Time" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dropoff Date
                    </label>
                    <input type="date" name="dropoffdate" value={addData.dropoffdate}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Select Dropoff Date" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dropoff Time
                    </label>
                    <input type="time" name="dropofftime" value={addData.dropofftime}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Select Dropoff Time" required/>
                  </div>
                </div>
              </div>
              {/* ADDRESS */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">
                  Address Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input type="text" name="street" value={addData.street}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Street Address" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input type="text" name="city" value={addData.city}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type City" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input type="text" name="state" value={addData.state}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type State" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Zip Code
                    </label>
                    <input type="text" name="zipcode" value={addData.zipcode}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Zip Code" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input type="text" name="country" value={addData.country}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Country" required/>
                  </div>
                </div>
              </div>
              {/* CAR DETAILS */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">
                  Car Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Car Name
                    </label>
                    <input type="text" name="carName" value={addData.carName}
                      onChange={handleAddChange} className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Car Name" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Car Image Filename
                    </label>
                    <input type="text" name="carImage" value={addData.carImage}
                      onChange={handleAddChange} placeholder="example.jpg" className="w-full p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input type="number" name="amount" value={addData.amount}
                      onChange={handleAddChange} className="w-full p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                      placeholder="Type Total Amount" required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Booking Status
                    </label>
                    <select name="status" value={addData.status}
                      onChange={handleAddChange} className="w-full p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black">
                      <option value="Car Booked">
                        Car Booked
                      </option>
                      <option value="Pending">
                        Pending
                      </option>
                      <option value="Completed">
                        Completed
                      </option>
                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              {/* BUTTONS */}
              <div className="flex gap-4 pt-3">
                <button type="submit"
                  className="w-1/2 bg-green-600 hover:bg-green-700 text-white p-3 rounded font-medium">
                  ADD BOOKING
                </button>
                <button type="button" onClick={() => setIsAddMode(false)}
                  className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-medium">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
