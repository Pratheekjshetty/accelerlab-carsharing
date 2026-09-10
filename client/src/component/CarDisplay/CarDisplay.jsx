import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import not_found from '../../assets/not_found.png'
import axios from 'axios';
import CarItem from '../CarItem/CarItem';

const CarDisplay = ({ category, setCategory, seats, setSeats, priceRange, setPriceRange, location, setLocation }) => {
    const { vehicle_list, bookingList, adminbookingList, url} = useContext(StoreContext);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [dropoffDate, setDropoffDate] = useState('');
    const [averageRatings, setAverageRatings] = useState({});
    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };
    const handleSeatsChange = (e) => {
        setSeats(e.target.value);
    };
    const handlePriceChange = (e) => {
        setPriceRange(e.target.value);
    };
    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };
    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
    };
    const handlePickupDateChange = (e) => {
        const newPickupDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];
        if(new Date(newPickupDate) < new Date(today)){
            alert("Pickup date cannot be earlier than today.");
        } else if (new Date(newPickupDate) > new Date(dropoffDate)) {
            alert("Pickup date cannot be greater than dropoff date.");
        } else {
            setPickupDate(newPickupDate);
        }
    };
    const handleDropoffDateChange = (e) => {
        const newDropoffDate = e.target.value;
        if (new Date(pickupDate) > new Date(newDropoffDate)) {
            alert("Dropoff date cannot be less than pickup date.");
        } else {
            setDropoffDate(newDropoffDate);
        }
    };
    const isPriceInRange = (price, range) => {
        if (range === 'All') return true;
        const [min, max] = range.split('-').map(Number);
        return price >= min && price <= max;
    };
    const isCarBooked = (carId) => {
        if (!pickupDate || !dropoffDate) return false;
        const pickup = new Date(pickupDate).setHours(0, 0, 0, 0);
        const dropoff = new Date(dropoffDate).setHours(0, 0, 0, 0);
        return bookingList.some(booking => {
            const bookingPickup = new Date(booking.pickupDate).setHours(0, 0, 0, 0);
            const bookingDropoff = new Date(booking.dropoffDate).setHours(0, 0, 0, 0);
            const isStatusValid = ["Car Booked", "Car Started", "Car Reached Destination", "Car Not Cancelled"].includes(booking.status);
            return booking.carItemId === carId && isStatusValid &&
                pickup <= bookingDropoff &&
                dropoff >= bookingPickup;
        });
    };
    const isCarAdminBooked = (carId) => {
        if (!pickupDate || !dropoffDate) return false;
        const pickup = new Date(pickupDate).setHours(0, 0, 0, 0);
        const dropoff = new Date(dropoffDate).setHours(0, 0, 0, 0);
        return adminbookingList.some(adminBooking => {
            const adminStart = new Date(adminBooking.startDate).setHours(0, 0, 0, 0);
            const adminEnd = new Date(adminBooking.endDate).setHours(0, 0, 0, 0);
            const isStatusValid = ["Car Booked by Admin", "Admin Car Being Started", "Admin Car Being Ended"].includes(adminBooking.status);
            return adminBooking.carItemId === carId && isStatusValid &&
                pickup <= adminEnd &&
                dropoff >= adminStart;
        });
    };
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${url}/api/settings/list`);
                if (response.data.success) {
                    setCategories(response.data.category || []);
                    setLocations(response.data.location || []);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, [url]);
    useEffect(() => {
        const fetchAverageRatings = async () => {
          const ratingsMap = {};
          await Promise.all(
            vehicle_list.map(async (vehicle) => {
              try {
                const response = await axios.get(`${url}/api/rating/car/${vehicle._id}`);
                if (response.data.success) {
                  const ratings = response.data.data;
                  const averageRating = ratings.length > 0
                    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
                    : 0;
                  ratingsMap[vehicle._id] = averageRating;
                } else {
                  ratingsMap[vehicle._id] = 0;
                }
              } catch (error) {
                console.error("Error fetching ratings", error);
                ratingsMap[vehicle._id] = 0;
              }
            })
          );
          setAverageRatings(ratingsMap);
        };
        fetchAverageRatings();
    }, [vehicle_list, url]);
    const renderFilterOptions = () => {
        switch (filterType) {
            case 'Category':
                return (
                    <select value={category} onChange={handleCategoryChange} className='h-10 w-44 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white cursor-pointer'>
                        <option value="All">All</option>
                        {categories.map((item) => (
                            <option key={item._id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                );
            case 'Seats':
                return (
                    <select value={seats} onChange={handleSeatsChange} className='h-10 w-44 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white cursor-pointer'>
                        <option value="All">All</option>
                        <option value="2">2 seats</option>
                        <option value="3">3 seats</option>
                        <option value="4">4 seats</option>
                        <option value="5">5 seats</option>
                        <option value="greater5">Greater than 5</option>
                    </select>
                );
            case 'Price':
                return (
                    <select value={priceRange} onChange={handlePriceChange} className='h-10 w-44 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white cursor-pointer'>
                        <option value="All">All</option>
                        <option value="0-1999">Less than ₹2000</option>
                        <option value="2000-3000">₹2000 - ₹3000</option>
                        <option value="3000-4000">₹3000 - ₹4000</option>
                        <option value="4000-5000">₹4000 - ₹5000</option>
                        <option value="5000-6000">₹5000 - ₹6000</option>
                        <option value="6001-999999">Greater than ₹6000</option>
                    </select>
                );
            case 'Location':
                return (
                    <select value={location} onChange={handleLocationChange} className='h-10 w-44 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white cursor-pointer'>
                        <option value="All">All</option>
                        {locations.map((item) => (
                            <option key={item._id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };

    const filteredVehicles = vehicle_list.filter(item => {
        const matchesCategory = category === 'All' || category === item.category;
        const matchesSeats = seats === 'All' || (seats === 'greater5' && Number(item.seats) > 5) || seats === String(item.seats);
        const matchesPrice = isPriceInRange(item.price, priceRange);
        const matchesLocation = location === 'All' || location === item.location;
        const notBooked = !isCarBooked(item._id);
        const notAdminBooked = !isCarAdminBooked(item._id);
        return matchesCategory && matchesSeats && matchesPrice && matchesLocation && notBooked && notAdminBooked ;
    });

    return (
        <div className='bg-blue-50 p-8'>
            <div className='p-8' id='car_display'>
                <h2 className='text-xl font-semibold'>Browse by Make</h2>
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    {/* Pickup Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Pickup Date
                        </label>
                        <input type="date" value={pickupDate} onChange={handlePickupDateChange}
                            className="h-10 w-40 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"/>
                    </div>
                    {/* Dropoff Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Dropoff Date
                        </label>
                        <input type="date" value={dropoffDate} onChange={handleDropoffDateChange}
                            className="h-10 w-40 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"/>
                    </div>
                    {/* Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Filter By
                        </label>
                        <select value={filterType} onChange={handleFilterTypeChange}
                            className="h-10 w-40 px-3 border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white cursor-pointer">
                            <option value="">Select Filter</option>
                            <option value="Category">Category</option>
                            <option value="Seats">Seats</option>
                            <option value="Price">Price</option>
                            <option value="Location">Location</option>
                        </select>
                    </div>
                    {/* Selected Filter Value */}
                    {filterType && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                {filterType}
                            </label>
                            {renderFilterOptions()}
                        </div>
                    )}
                </div>
                {filteredVehicles.length === 0 ? (
                    <div className='flex flex-col justify-center items-center'>
                    <img src={not_found} alt="Not Found"/>
                    <p className='mt-8 mb-4 text-3xl text-center font-semibold md:text-4xl text-red-500'>No cars found</p>
                    <p className="mb-4 text-lg text-center font-light text-gray-500 dark:text-gray-400">Sorry, we can't find any cars that match your criteria.</p>
                    </div>
                ) : (
                <div className='grid mt-8 gap-x-13 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {vehicle_list.map((item, index) => {
                        const matchesCategory = category === 'All' || category === item.category;
                        const matchesSeats = seats === 'All' || seats === String(item.seats);
                        const matchesPrice = isPriceInRange(item.price, priceRange);
                        const matchesLocation = location === 'All' || location === item.location;
                        const notBooked = !isCarBooked(item._id);
                        const notAdminBooked = !isCarAdminBooked(item._id);
                        if (matchesCategory && matchesSeats && matchesPrice && matchesLocation && notBooked && notAdminBooked) {
                            return (
                                <CarItem
                                    key={index}
                                    id={item._id}
                                    name={item.name}
                                    price={item.price}
                                    location={item.location}
                                    description={item.description}
                                    image={item.image}
                                    model={item.model}
                                    color={item.color}
                                    seats={item.seats}
                                    averageRating={averageRatings[item._id]}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
                )}
            </div>
        </div>
    );
}

export default CarDisplay;
