import React, { useEffect, useState, useCallback } from 'react';
import upload_area from '../../assets/upload_area.png';
import axios from 'axios';
import './List.css';
import { FaTrash, FaEdit, FaTimes, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confirmation from '../../components/Confirmation/Confirmation';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const itemsPerPage = 8;
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addImage, setAddImage] = useState(false);

  const [addData, setAddData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Benz",
    location: "Manglore",
    color: "",
    model: "",
    seats: "",
  });

  const fetchList = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/car/listactive-car`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Error fetching the list");
    }
  }, [url]);

  // Remove car
  const removeCar = async () => {
    try {
      const response = await axios.put(`${url}/api/car/deactivate-car`, { id: selectedCar });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
        setShowModal(false);
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Error removing the car item");
    }
  };

  const handleDeleteClick = (carId) => {
    setSelectedCar(carId);
    setShowModal(true);
  };

  const editCar = (car) => {
    setData({
      name: car.name,
      description: car.description,
      price: car.price,
      category: car.category,
      location: car.location,
      color: car.color,
      seats: car.seats,
      model: car.model,
    });
    setImage(null);
    setCurrentEditId(car._id);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isEditMode ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isEditMode]);

  // Pagination calculations
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = list.slice(startIdx, endIdx);

  // Change page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Benz",
    location: "Manglore",
    color: "",
    seats: "",
    model: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  // Update car details
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("id", currentEditId);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("location", data.location);
    formData.append("color", data.color);
    formData.append("seats", data.seats);
    formData.append("model", data.model);
    if (image) {
      formData.append("image", image);
    }
    const response = await axios.put(`${url}/api/car/edit`, formData);
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "",
        location: "",
        color: "",
        seats: "",
        model: "",
      });
      setImage(false);
      setIsEditMode(false);
      setCurrentEditId(null);
      toast.success(response.data.message || "Car updated successfully");
      await fetchList();
    } else {
      toast.error(response.data.message || "Error while updating the car");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setCurrentEditId(null);
    setData({
      name: "",
      description: "",
      price: "",
      category: "Benz",
      location: "Manglore",
      color: "",
      seats: "",
      model: "",
    });
    setImage(false);
  };

  const handleAddCar = async (event) => {
    event.preventDefault();
    // Check image manually
    if (!addImage) {
      toast.error("Please upload a car image");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", addData.name);
      formData.append("description", addData.description);
      formData.append("price", Number(addData.price));
      formData.append("category", addData.category);
      formData.append("location", addData.location);
      formData.append("color", addData.color);
      formData.append("model", addData.model);
      formData.append("seats", addData.seats);
      formData.append("image", addImage);
      const response = await axios.post(`${url}/api/car/add`, formData);
      if (response.data.success) {
        toast.success(response.data.message || "Car added successfully");
        setAddData({
          name: "",
          description: "",
          price: "",
          category: "Benz",
          location: "Manglore",
          color: "",
          model: "",
          seats: "",
        });
        setAddImage(false);
        setIsAddMode(false);
        // Refresh car list
        await fetchList();
      } else {
        toast.error(response.data.message || "Error while adding the car");
      }
    } catch (error) {
      console.error("Add car error:", error);
      toast.error(
        error.response?.data?.message ||
        "Error while adding the car"
      );
    }
  };

  return (
    <div className='w-[85%] ml-10 mt-6 mr-2 text-[#6d6d6d] text-base'>
      {/* Cars List Page Header */}
      <div className="flex justify-between items-center mb-7 bg-blue-100 p-3 rounded">
        <h2 className="text-2xl font-bold text-black">
          All Car List
        </h2>
        <button
          type="button"
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium">
          <FaPlus />
          Add New
        </button>
      </div>

      {/* Car List Table */}
      <div className='list add flex-col'>
        <div className="list-table">
          {/* Column Titles */}
          <div style={{ gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 0.5fr 0.5fr' }} className="title grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm bg-[#123B66] text-white">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Location</b>
            <b>Price</b>
            <b className="col-span-2">Action</b>
          </div>
          {/* Cars Data */}
          {list.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-zinc-300 bg-[#DCEEFF] text-[#123B66] font-medium">
                No cars found.
            </div>
          ) : (currentItems.map((item, index) => (
            <div key={index} className="list-table-format grid justify-center items-center gap-2 px-3 py-4 border border-solid border-zinc-300 text-sm">
              {/* Image */}
              <img className='w-[50px]' src={`${url}/images/` + item.image} alt="" />
              {/* Name */}
              <p>{item.name}</p>
              {/* Category */}
              <p>{item.category}</p>
              {/* Location */}
              <p>{item.location}</p>
              {/* Price */}
              <p>Rs.{item.price}</p>
              <p onClick={() => handleDeleteClick(item._id)} className='cursor-pointer'><FaTrash /></p>
              <p onClick={() => editCar(item)} className='cursor-pointer'><FaEdit /></p>
            </div>
          )))}
        </div>
        {/* Pagination */}
        {list.length > itemsPerPage && (
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
              <h3 className="text-2xl font-bold text-black">Edit Car</h3>
              {/* Close Button */}
              <button type="button"
                onClick={handleCancel}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Edit Car Form */}
            <form className="flex flex-col gap-5" onSubmit={onSubmitHandler}>
              {/* Upload Image */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">Upload Image</p>
                <label htmlFor="image" className="cursor-pointer w-fit">
                  <img
                    className="w-32 h-24 object-contain border border-dashed border-gray-300"
                    src={image ? URL.createObjectURL(image) : upload_area}
                    alt="Upload"/>
                </label>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden/>
              </div>
              {/* Car Name */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car name</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  name="name"
                  placeholder="Type here"
                  required/>
              </div>
              {/* Description */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car description</p>
                <textarea
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black resize-none"
                  onChange={onChangeHandler}
                  value={data.description}
                  name="description"
                  rows="5"
                  placeholder="Write content here"
                  required
                ></textarea>
              </div>
              {/* Color + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {/* Color */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Color</p>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                    onChange={onChangeHandler}
                    value={data.color}
                    type="text"
                    name="color"
                    placeholder="White"
                    required/>
                </div>
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Car category</p>
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black bg-white"
                    onChange={onChangeHandler}
                    value={data.category}
                    name="category"
                    required>
                    <option value="Benz">Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Ford">Ford</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Subaro">Subaro</option>
                    <option value="Tesla">Tesla</option>
                  </select>
                </div>
              </div>
              {/* Price */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car price</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.price}
                  type="tel"
                  name="price"
                  placeholder="Rs.200"
                  required/>
              </div>
              {/* Seats + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {/* Seats */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Seats</p>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                    onChange={onChangeHandler}
                    value={data.seats}
                    type="tel"
                    name="seats"
                    placeholder="4"
                    required/>
                </div>
                {/* Location */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Car location</p>
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black bg-white"
                    onChange={onChangeHandler}
                    value={data.location}
                    name="location"
                    required>
                    <option value="Manglore">Manglore</option>
                    <option value="Puttur">Puttur</option>
                    <option value="Bantwal">Bantwal</option>
                  </select>
                </div>
              </div>
              {/* Model */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Model</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={onChangeHandler}
                  value={data.model}
                  type="text"
                  name="model"
                  placeholder="Type here"
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
              <h3 className="text-2xl font-bold text-black">Add New Car</h3>
              {/* Close Button */}
              <button type="button"
                onClick={() => setIsAddMode(false)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black text-xl">
                <FaTimes />
              </button>
            </div>
            {/* Add Car Form */}
            <form className="flex flex-col gap-5" onSubmit={handleAddCar}>
              {/* Upload Image */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">Upload Image</p>
                <label htmlFor="addImage" className="cursor-pointer w-fit">
                  <img
                    className="w-32 h-24 object-contain border border-dashed border-gray-300"
                    src={
                      addImage
                        ? URL.createObjectURL(addImage)
                        : upload_area
                    }
                    alt="Upload"/>
                </label>
                <input
                  onChange={(e) => setAddImage(e.target.files[0])}
                  type="file"
                  id="addImage"
                  hidden
                  required/>
              </div>
              {/* Car Name */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car name</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black"
                  onChange={(e) =>
                    setAddData({
                      ...addData,
                      name: e.target.value
                    })
                  }
                  value={addData.name}
                  type="text"
                  placeholder="Type here"
                  required/>
              </div>
              {/* Description */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car description</p>
                <textarea
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full outline-none focus:border-black resize-none"
                  onChange={(e) =>
                    setAddData({
                      ...addData,
                      description: e.target.value
                    })
                  }
                  value={addData.description}
                  rows="5"
                  placeholder="Write content here"
                  required
                ></textarea>
              </div>
              {/* Color + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Color</p>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full"
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        color: e.target.value
                      })
                    }
                    value={addData.color}
                    type="text"
                    placeholder="White"
                    required/>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Car category</p>
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full bg-white"
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        category: e.target.value
                      })
                    }
                    value={addData.category}
                    required>
                    <option value="Benz">Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Ford">Ford</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Subaro">Subaro</option>
                    <option value="Tesla">Tesla</option>
                  </select>
                </div>
              </div>
              {/* Price */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Car price</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full"
                  onChange={(e) =>
                    setAddData({
                      ...addData,
                      price: e.target.value
                    })
                  }
                  value={addData.price}
                  type="tel"
                  placeholder="Rs.200"
                  required/>
              </div>
              {/* Seats + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Seats</p>
                  <input
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full"
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        seats: e.target.value
                      })
                    }
                    value={addData.seats}
                    type="tel"
                    placeholder="4"
                    required/>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700">Car location</p>
                  <select
                    className="p-3 border border-gray-400 rounded-sm text-sm w-full bg-white"
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        location: e.target.value
                      })
                    }
                    value={addData.location}
                    required>
                    <option value="Manglore">Manglore</option>
                    <option value="Puttur">Puttur</option>
                    <option value="Bantwal">Bantwal</option>
                  </select>
                </div>
              </div>
              {/* Model */}
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium text-gray-700">Model</p>
                <input
                  className="p-3 border border-gray-400 rounded-sm text-sm w-full"
                  onChange={(e) =>
                    setAddData({
                      ...addData,
                      model: e.target.value
                    })
                  }
                  value={addData.model}
                  type="text"
                  placeholder="Type here"
                  required/>
              </div>
              {/* Buttons */}
              <div className="flex flex-row gap-3 w-full pt-2">
                <button
                  className="w-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-sm font-medium"
                  type="submit">
                  ADD CAR
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
        onConfirm={removeCar}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}

export default List;