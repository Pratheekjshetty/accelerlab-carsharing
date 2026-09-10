import React, { useEffect, useRef, useState, useContext }  from 'react';
import Header from '../../component/Header/Header';
import VehicleDisplay from '../../component/VehicalDisplay/VehicleDisplay';
import BrowseCar from '../../component/BrowseCars/BrowseCar';
import CarDisplay from '../../component/CarDisplay/CarDisplay';
import AppDownload from '../../component/AppDownload/AppDownlad';
import Apply from '../../component/Apply/Apply';
import { StoreContext } from '../../context/StoreContext';
const Home = () => {
  const { url } = useContext(StoreContext);
  const [category,setCategory] =useState("All");
  const [seats,setSeats]=useState("All");
  const [priceRange,setPriceRange]=useState("All");
  const [location,setLocation]=useState("All");

  const carDisplayRef = useRef(null);
  const vehicleDisplayRef = useRef(null);
  const homeDisplayRef =useRef(null);
  const applyDisplayRef =useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
    <div ref={homeDisplayRef}>
      <Header carDisplayRef={carDisplayRef}/>
    </div>
    <div ref={vehicleDisplayRef}>
      <VehicleDisplay category={category} setCategory={setCategory} carDisplayRef={carDisplayRef} url={url}/>
    </div>
    <div ref={carDisplayRef}>
        <CarDisplay category={category} setCategory={setCategory} seats={seats} setSeats={setSeats} priceRange={priceRange} setPriceRange={setPriceRange} location={location} setLocation={setLocation}/>
    </div>
    <BrowseCar carDisplayRef={carDisplayRef}/>
    <div ref={applyDisplayRef}>
      <Apply carDisplayRef={carDisplayRef}/>
    </div>
    <AppDownload/>
    </div>
  );
};

export default Home;
