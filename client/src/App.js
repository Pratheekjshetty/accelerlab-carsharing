import React, { useState } from 'react';
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from './component/NavBar/Navbar'
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Blogs from './pages/Blogs/Blogs';
import Ratings from './pages/Ratings/Ratings';
import Contact from './pages/Contact/Contact'
import Login from './component/Login/Login'
import Verify from './pages/Verify/Verify';
import GetProfile from './component/GetProfile/GetProfile';
import MyBooking from './component/MyBooking/MyBooking';
import CarDisplay from './component/CarDisplay/CarDisplay';
import Booking from './pages/Booking/Booking';
import Rent from './pages/Rent/Rent';
import Footer from './component/Footer/Footer';
import ApplyDriver from './pages/ApplyDriver/ApplyDriver';
import Driver from './pages/Driver/Driver';
import CancelBooking from './pages/CancelBooking/CancelBooking';
import AddEdit from './component/Blogs/AddEdit/AddEdit';
import Blog from './component/Blogs/Blog/Blog';
import AddRating from './component/Ratings/AddRating/AddRating'
import EditRating from './component/Ratings/EditRating/EditRating';
import Rating from './component/Ratings/Rating/Rating'
import NoPage from './pages/NoPage/NoPage';

function App() { 
  const url ="http://localhost:4001"
  const[showLogin,setShowLogin] = useState(false);

  return (   
    <>
    <ToastContainer />
    {showLogin?<Login setShowLogin={setShowLogin}/>:null} 
    <div>
    <Navbar setShowLogin={setShowLogin} /> 
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/blogs' element={<Blogs/>}/>
          <Route path='/ratings' element={<Ratings/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/get-profile' element={<GetProfile url={url}/>}/>
          <Route path='/verify'element={<Verify/>}/>
          <Route path='/mybooking' element={<MyBooking/>}/>
          <Route path='/booking' element={<Booking/>}/>
          <Route path='/rent' element={<Rent/>}/>
          <Route path='/car-display' element={<CarDisplay />} />
          <Route path='/apply-driver' element={<ApplyDriver/>}/>
          <Route path='/driver' element={<Driver/>}/>
          <Route path='/cancel-booking' element={<CancelBooking/>}/>
          <Route path='/add-blog' element={<AddEdit />}/>
          <Route path='/edit-blog/:id' element={<AddEdit/>}/>
          <Route path='/blog/:id' element={<Blog/>}/>
          <Route path='/add-rating/:id' element={<AddRating/>}/>
          <Route path='/edit-rating/:id' element={<EditRating/>}/>
          <Route path='/ratings/:carId' element={<Rating/>}/>
          <Route path="*" element={<NoPage/>}/>
        </Routes>  
      <Footer/> 
    </div>
    </> 
  );
}
export default App;

