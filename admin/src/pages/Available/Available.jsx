import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Available = ({ url }) => {
    const [cars, setCars] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [adminBookingList, setAdminBookingList] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];

        if (new Date(newStartDate) < new Date(today)) {
            alert("Start date cannot be earlier than today.");
        } else if (new Date(newStartDate) > new Date(endDate)) {
            alert("Start date cannot be greater than end date.");
        } else {
            setStartDate(newStartDate);
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        if (new Date(startDate) > new Date(newEndDate)) {
            alert("End date cannot be less than start date.");
        } else {
            setEndDate(newEndDate);
        }
    };

    useEffect(() => {
        // Fetch all cars from the backend
        const fetchCars = async () => {
            try {
                const response = await axios.get(`${url}/api/car/listactive-car`);
                if (response.data.success) {
                    setCars(response.data.data);
                } else {
                    toast.error('Failed to fetch cars');
                }
            } catch (error) {
                toast.error('Error fetching cars');
                console.log(error);
            }
        };
        // Fetch all bookinglist from the backend
        const fetchBookingList = async () => {
            try {
                const response = await axios.get(`${url}/api/book/listbooking`);
                const bookingData = response.data.data.map(booking => ({
                    carItemId: booking.caritem.id,
                    pickupDate: booking.pickupdate,
                    dropoffDate: booking.dropoffdate,
                    status: booking.status,
                }));
                setBookingList(bookingData);
            } catch (error) {
                toast.error('Error fetching booking list');
                console.log(error);
            }
        };
        // Fetch all adminbookinglist from the backend
        const fetchAdminBookingList = async () => {
            try {
                const response = await axios.get(`${url}/api/available/admin-booked-cars`, {
                    params: {
                        startDate,
                        endDate,
                    },
                });
                if (response.data.success) {
                    const adminBookingData = response.data.data.map(booking => ({
                        carItemId: booking.caritem._id,
                        startDate: booking.startdate,
                        endDate: booking.enddate,
                        status: booking.status,
                    }));
                    setAdminBookingList(adminBookingData);
                }
            } catch (error) {
                toast.error('Error fetching admin booking list');
                console.log(error);
            }
        };
        if (startDate && endDate) {
            fetchAdminBookingList();
        }
        fetchCars();
        fetchBookingList();
    }, [url,startDate, endDate]);

    const isCarBooked = (carId) => {
        if (!startDate || !endDate) return false;
        const iscustomerBooking = bookingList.some(booking => (
            booking.carItemId === carId &&
            (booking.status === "Car Booked" || booking.status === "Car Started" || booking.status === "Car Reached Destination" || booking.status === "Car Not Cancelled") &&
            new Date(startDate) <= new Date(booking.dropoffDate) &&
            new Date(endDate) >= new Date(booking.pickupDate)
        ));
        const isadminBooking = adminBookingList.some(booking => (
            booking.carItemId === carId &&
            (booking.status === "Car Booked by Admin" || booking.status === "Admin Car Being Started" || booking.status === "Admin Car Being Ended") &&
            new Date(startDate) <= new Date(booking.endDate) &&
            new Date(endDate) >= new Date(booking.startDate)
        ));
        return iscustomerBooking || isadminBooking;
    };

    // Handle car selection
    const handleCarSelection = (car) => {
        if (!isCarBooked(car._id)) {
            setSelectedCar(car);
        } else {
            toast.error("Car is already booked for the selected dates.");
        }
    };

    // Handle update availability
    const handleUpdateAvailability = async () => {
        if (!selectedCar || !startDate || !endDate) {
            toast.error('Please select a car and specify the dates');
            return;
        }
        try {
            const response = await axios.post(`${url}/api/available/update`, {
                carId: selectedCar._id,
                startDate,
                endDate
            });
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to update availability');
            console.log(error);
        }
    };

    return (
        <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
            {/* Car Availability Page Header */}
            <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
                <h2 className="text-2xl font-bold text-black">
                Update Car Availability
                </h2>
            </div>
            <div className="mt-5">
                <label className="block text-lg font-semibold mb-2">Start Date:</label>
                <input type="date" value={startDate} onChange={handleStartDateChange} onClick={(e) => {
                    if (e.currentTarget.showPicker) {
                        e.currentTarget.showPicker();
                    }
                }} className="border p-2 w-full cursor-pointer"/>
            </div>
            <div className="mt-5">
                <label className="block text-lg font-semibold mb-2">End Date:</label>
                <input type="date" value={endDate} onChange={handleEndDateChange} onClick={(e) => {
                    if (e.currentTarget.showPicker) {
                        e.currentTarget.showPicker();
                    }
                }} className="border p-2 w-full cursor-pointer"/>
            </div>
            <div className="mt-5">
                <h3 className="text-lg font-semibold mb-3">Select Car:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {cars.map((car, index) => (
                        <div key={index} className={`border p-3 cursor-pointer transform transition-transform duration-300 hover:scale-105 ${selectedCar && selectedCar._id === car._id ? 'border-2 border-blue-500 ' : 'border-gray-300'} ${isCarBooked(car._id) ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => !isCarBooked(car._id) && handleCarSelection(car)}>
                            <img src={`${url}/images/${car.image}`} alt={car.name} className="w-full h-28 object-cover" />
                            <p className="mt-2 text-center">{car.name}</p>
                        </div>
                    ))}
                </div>
                <button onClick={handleUpdateAvailability} className="mt-5 bg-blue-500 text-white py-2 px-4 rounded">Update Availability</button>
            </div>
        </div>
    );
};

export default Available;
