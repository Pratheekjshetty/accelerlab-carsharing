import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import facebook_icon from '../../assets/facebook_icon.png'
import twitter_icon from '../../assets/twitter_icon.png'
import linkedin_icon from '../../assets/linkedin_icon.png'

const Footer = () => {
  const navigate =useNavigate()
  return (
    <div className='text-white bg-customGray flex flex-col items-center gap-5 py-5 pt-20 mt-0' id='footer'>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2fr-1fr-1fr gap-20 px-8 xs:px-16 sm:px-32">
        <div className="flex flex-col items-start gap-5">
            <img className='rounded-full border border-none bg-white w-16'src={logo} alt="" width={100}/>
            <p className='text-sm '>Welcome to Voyager, where we bring the best car rental experience right to your fingertips. Discover a wide range of vehicles and enjoy convenient booking 
                with every rental. Renting a car from your favorite local providers has never been easier. Our mission is to make car rentals quick, easy, and enjoyable.</p>
            <div className='flex flex-row'>
            <a href="https://www.facebook.com/voyagerapp" target="_blank" rel="noopener noreferrer">
              <img className="w-10 mr-4" src={facebook_icon} alt="Facebook" />
            </a>
            <a href="https://twitter.com/voyagerapp" target="_blank" rel="noopener noreferrer">
              <img className="w-10 mr-4" src={twitter_icon} alt="Twitter" />
            </a>
            <a href="https://www.linkedin.com/voyagerapp" target="_blank" rel="noopener noreferrer">
              <img className="w-10 mr-4" src={linkedin_icon} alt="LinkedIn" />
            </a>
            </div>
        </div>
        <div className="flex flex-col items-start gap-5">
            <h2 className="text-2xl font-bold">Company</h2>
            <ul>
                <li className='list-none mb-2.5 curser-pointer' onClick={() => navigate('/')}>Home</li>
                <li className='list-none mb-2.5 curser-pointer' onClick={() => navigate('/about')}>About</li>
                <li className='list-none mb-2.5 curser-pointer' onClick={() => navigate('/blogs')}>Blogs</li>
                <li className='list-none mb-2.5 curser-pointer' onClick={() => navigate('/ratings')}>Reviews & Ratings</li>
            </ul>
            <h2 className="text-2xl font-bold">Legal</h2>
            <ul>
                <li className='list-none mb-2.5 curser-pointer'>Privacy Policy</li>
                <li className='list-none mb-2.5 curser-pointer'>Terms of Service</li>
                <li className='list-none mb-2.5 curser-pointer'>Refund Policy</li>
            </ul>
        </div>
        <div className="flex flex-col items-start gap-5">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <ul>
                <li className='list-none mb-2.5 curser-pointer' onClick={() => navigate('/contact')}>Contact</li>
                <li className='list-none mb-2.5 curser-pointer'>Phone: +9876543210</li>
                <li className='list-none mb-2.5 curser-pointer'>Email: voyagerapp@gmail.com</li>
                <li className='list-none mb-2.5 curser-pointer'>Github: github.com/voyagerapp</li>
            </ul>
            <h2 className="text-2xl font-bold">Follow Us</h2>
            <ul>
                <li className='list-none mb-2.5 curser-pointer'>Facebook: facebook.com/voyagerapp</li>
                <li className='list-none mb-2.5 curser-pointer'>Instagram: instagram.com/voyagerapp</li>
                <li className='list-none mb-2.5 curser-pointer'>Twitter:twitter.com/voyagerapp</li>
            </ul>
        </div>
        </div>
        <hr className="w-full h-0.5 my-5 bg-gray-400 border-none"/>
        <p className='text-center'> © Copright {new Date().getFullYear()} Voyager.com - All Right Reserved.</p>
    </div>
  )
}
export default Footer