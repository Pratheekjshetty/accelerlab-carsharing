import React from 'react'
import './App.css';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import User from './pages/User/User';
import Driver from './pages/Driver/Driver';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Booking from './pages/Booking/Booking';
import Cancel from './pages/Cancel/Cancel';
import Apply from './pages/Apply/Apply';
import Available from './pages/Available/Available';
import Settings from './pages/Settings/Settings'

function App() {
  const url ="http://localhost:4001"
  return (
    <div className="App">
      <ToastContainer/>
      <Navbar/>
      <div className='app-content'>
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Home url={url}/>}/>
          <Route path='/user' element={<User url={url}/>}/>
          <Route path='driver' element={<Driver url={url}/>}/>
          <Route path='/add' element={<Add url={url}/>}/>
          <Route path='/list' element={<List url={url} />}/>
          <Route path='/booking' element={<Booking url={url}/>}/>
          <Route path='/cancel' element={<Cancel url={url}/>}/>
          <Route path='/apply' element={<Apply url={url}/>}/>
          <Route path='/available' element={<Available url={url}/>}/>
          <Route path="/settings" element={<Settings url={url} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
