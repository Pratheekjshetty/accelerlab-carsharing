import React, { useEffect, useState } from 'react';
import { FaUsers, FaUserTie, FaCar, FaBlog } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({ users: 0, drivers: 0, cars: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    labels: [],
    datasets: [{
      label: 'Bookings per Week',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
    }]
  });
  const [carBookingPercentages, setCarBookingPercentages] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userResponse, carResponse, blogResponse] = await Promise.all([
          axios.get(`${url}/api/user/get-count`),
          axios.get(`${url}/api/car/total-cars`),
          axios.get(`${url}/api/blog/total-blogs`),
        ]);
        setStats({
          users: userResponse.data.counts.users || 0,
          drivers: userResponse.data.counts.drivers || 0,
          cars: carResponse.data.totalCars || 0,
          blogs: blogResponse.data.totalBlogs || 0,
        });
      } catch (err) {
        toast.error("Failed to fetch dashboard data");
        console.error(err);
      }
      setLoading(false);
    };
    const fetchBookingData = async () => {
      try {
        const response = await axios.get(`${url}/api/book/week-bookings`);
        console.log('Weekly Bookings Data:', response.data);
        if (response.data && response.data.length > 0) {
          const labels = response.data.map(item => `Week ${item._id.split('-')[1]}, ${item._id.split('-')[0]}`);
          const data = response.data.map(item => item.count);
          setBookingData({
            labels: labels,
            datasets: [{
              label: 'Bookings per Week',
              data: data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            }]
          });
        }
      } catch (err) {
        // toast.error("Failed to fetch booking data");
        console.error(err);
      }
    };
    const fetchCarBookingPercentages = async () => {
      try {
        const response = await axios.get(`${url}/api/book/percentages`);
        setCarBookingPercentages(response.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch car booking percentages");
        console.error(err);
      }
    };
    fetchStats();
    fetchBookingData();
    fetchCarBookingPercentages();
  }, [url]);
  const pieData = {
    labels: carBookingPercentages.map(car => car.carModel),
    datasets: [{
      data: carBookingPercentages.map(car => car.percentage),
      backgroundColor: [
        'rgba(205, 0, 26, 0.6)',
        'rgba(239, 106, 0, 0.6)',
        'rgba(242, 205, 0, 0.6)',
        'rgba(121, 195, 0, 0.6)',
        'rgba(25, 97, 174, 0.6)',
        'rgba(97, 0, 125, 0.6)',
      ],
      hoverBackgroundColor: [
        'rgba(205, 0, 26, 1)',
        'rgba(239, 106, 0, 1)',
        'rgba(242, 205, 0, 1)',
        'rgba(121, 195, 0, 1)',
        'rgba(25, 97, 174, 1)',
        'rgba(97, 0, 125, 1)',
      ],
    }]
  };

  if (loading) {
    return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base">
      <div className="flex justify-center items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-3xl font-bold text-black text-center">
          Admin Dashboard
        </h2>
      </div>
      <div className="mx-20 my-12">
        <div className="overview-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <FaUsers className="text-3xl mb-3" />
            <h2 className="text-2xl font-semibold">Total Users</h2>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
          <div className="card bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <FaUserTie className="text-3xl mb-3" />
            <h2 className="text-2xl font-semibold">Total Drivers</h2>
            <p className="text-3xl font-bold">{stats.drivers}</p>
          </div>
          <div className="card bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <FaCar className="text-3xl mb-3" />
            <h2 className="text-2xl font-semibold">Total Cars</h2>
            <p className="text-3xl font-bold">{stats.cars}</p>
          </div>
          <div className="card bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <FaBlog className="text-3xl mb-3" />
            <h2 className="text-2xl font-semibold">Total Blogs</h2>
            <p className="text-3xl font-bold">{stats.blogs}</p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-r from-purple-200 to-purple-300 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <h2 className="text-2xl font-bold text-center mb-4">Car Booking Percentages</h2>
            {carBookingPercentages.length > 0 && (
              <div className="w-3/4 mx-auto">
                <Pie data={pieData} />
              </div>
            )}
          </div>
          <div className="card bg-gradient-to-r from-blue-200 to-blue-300 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
            <h2 className="text-2xl font-bold text-center mb-4">Rent Bookings in a Week</h2>
            {bookingData.labels.length > 0 && (
              <div className="w-full mx-auto">
                <Line data={bookingData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
