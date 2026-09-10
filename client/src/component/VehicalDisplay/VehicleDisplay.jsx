import React, { useState, useEffect, useCallback } from 'react';
import './VehicalDisplay.css'
import axios from 'axios';

const VehicleDisplay = ({category,setCategory,carDisplayRef,url}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [carCategories, setCarCategories] = useState([]);
  const fetchCarCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/settings/list`);
      if (response.data.success) {
        setCarCategories(
          response.data.category || []
        );
      } else {
        console.error(response.data.message || 'Failed to fetch car categories');
      }
    } catch (error) {
      console.error('Error fetching car categories:', error);
    }
  }, [url]);
  useEffect(() => {
    fetchCarCategories();
  }, [fetchCarCategories]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const prevSlide = () => {
    if (carCategories.length === 0) return;
    const index = currentIndex === 0 ? carCategories.length - 1 : currentIndex - 1;
    setCurrentIndex(index);
  };
  const nextSlide = () => {
    if (carCategories.length === 0) return;
    const index = currentIndex === carCategories.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(index);
  };
  const scrollToCarDisplay = () => {
    if (carDisplayRef && carDisplayRef.current) {
      carDisplayRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const getVisibleImages = () => {
    if (carCategories.length === 0) {
      return [];
    }
    let visibleImagesCount;
    if (windowWidth >= 1024) {
      visibleImagesCount = 3;
    } else if (windowWidth >= 768) {
      visibleImagesCount = 2;
    } else {
      visibleImagesCount = 1;
    }
    return Array.from({
        length: Math.min(
          visibleImagesCount,
          carCategories.length
        )
      },
      (_, i) =>
        carCategories[
          (currentIndex + i) %
          carCategories.length
        ]
    );
  };

  useEffect(() => {
    if (carCategories.length > 0 && currentIndex >= carCategories.length) {
      setCurrentIndex(0);
    }
  }, [carCategories, currentIndex]);

  return (
    <div className='flex justify-center text-center flex-col'>
      <h1 className='m-8 font-bold text-4xl'>Endless Options</h1>
      <p>With our extensive range of cars, finding a ride anytime, anywhere has never been easier.</p><br />
      <center><button onClick={scrollToCarDisplay} className='bg-indigo-600 text-white p-2 rounded-lg text-md w-44 transform transition-transform duration-300 hover:scale-105'>Explore Cars</button></center>
      <div id="controls-carousel" className="relative w-full" data-carousel="static"><br />
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg" style={{ height: '50vh' }}>
          <h2 className="absolute top-0 mt-4 ml-4 mr-4 font-bold text-xl">Top Cars near you</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {getVisibleImages().map((item) => (
              <div key={item._id} onClick={()=>setCategory(prev=>prev===item.name?"All":item.name)}
                className='transition-opacity duration-700 ease-in-out opacity-100 m-4 cursor-pointer'
                style={{ width: '20rem', height: '12.5rem' }}>
                <div className="car_menu">
                  <img className={category===item.name?"active":""}src={item.image? `${url}/images/${item.image}`: '/placeholder.png'} alt={item.name} />
                </div>
                <p className='font-bold'>{item.name}</p>
              </div>
            ))}
          </div>
          {carCategories.length > 1 && (
            <button type="button" className="absolute left-4 z-30 flex items-center justify-center p-2 bg-indigo-600 text-white rounded-full cursor-pointer group focus:outline-none" onClick={prevSlide}>
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span className="sr-only">
                Previous
              </span>
            </button>
          )}
          {carCategories.length > 1 && (
            <button type="button" className="absolute right-4 z-30 flex items-center justify-center p-2 bg-indigo-600 text-white rounded-full cursor-pointer group focus:outline-none" onClick={nextSlide}>
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span className="sr-only">
                Next
              </span>
            </button>
          )}
        </div>
        <hr className='my-2.5 mx-2 h-0.5 bg-gray-300 border-none'/>
      </div>
    </div>
  );
}

export default VehicleDisplay;



