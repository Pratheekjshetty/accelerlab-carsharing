import React, { useContext,useState, useEffect  } from 'react'
import logo from '../../assets/logo.png'
import profile_icon from '../../assets/profile_icon.png'
import booking_icon from '../../assets/booking_icon.png'
import logout_icon from '../../assets/logout_icon.png'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({setShowLogin}) => {
const{token,setToken}=useContext(StoreContext);
const navigate = useNavigate(); 
const location = useLocation();
const [userImage, setUserImage] = useState(null);

useEffect(() => {
  const storedImage = localStorage.getItem('userImage');
  if (storedImage) {
    setUserImage(`http://localhost:4001/${storedImage}`); // Set userImage state to the stored image path
  }else {
    setUserImage(profile_icon); // Set default profile icon if no image path found
  }
}, [token]);

const handleImageError = () => {
  setUserImage(null); // Set userImage state to null on image load error
};

const logout = () =>{
    localStorage.removeItem("token");
    localStorage.removeItem("userImage");
    setToken("");
    setUserImage(null); // Clear userImage state on logout
    navigate("/");
}
const isActive = (path) => location.pathname === path ? 'text-blue-900' : '';
return (
  <div className="Navbar bg-blue-300">
    <nav className='flex flex-col'>
      <div className="w-full flex justify-between items-center px-6 lg:px-12 py-4 font-bold h-24">
        {/* Logo */}
        <div className="cursor-pointer flex-shrink-0">
            <Link to="/">
                <img
                    src={logo}
                    className="w-[160px] lg:w-[180px]"
                    alt="logo"
                />
            </Link>
        </div>
        {/* Navigation */}
        <ul className="hidden lg:flex flex-row items-center space-x-2">
            <li className={`cursor-pointer px-4 py-3 hover:text-blue-900 ${isActive('/')}`}>
                <Link to="/">Home</Link>
            </li>
            <li className={`cursor-pointer px-4 py-3 hover:text-blue-900 ${isActive('/about')}`}>
                <Link to="/about">About</Link>
            </li>
            {/* Contact only when logged in */}
            {token && (
                <li className={`cursor-pointer px-4 py-3 hover:text-blue-900 ${isActive('/contact')}`}>
                    <Link to="/contact">Contact</Link>
                </li>
            )}
            <li className={`cursor-pointer px-4 py-3 hover:text-blue-900 relative group ${isActive('/blogs')}`}>
                <Link to="/blogs">
                    Blogs
                    <FaChevronDown className="inline ml-1 text-xs" />
                </Link>
                <ul className="absolute hidden group-hover:block bg-white text-blue-900 mt-2 rounded-md shadow-lg right-0 min-w-[120px] z-50">
                    <li className="p-2 hover:bg-blue-200 hover:rounded-md cursor-pointer">
                        <Link to="/add-blog">Add Blog</Link>
                    </li>
                </ul>
            </li>
            <li className={`cursor-pointer px-4 py-3 hover:text-blue-900 ${isActive('/ratings')}`}>
                <Link to="/ratings">Review & Rating</Link>
            </li>
        </ul>
        {/* Sign In / Profile */}
        <div className="flex items-center ml-4">
            {!token ? (
                <button className="bg-white text-blue-900 rounded-full px-5 py-3 cursor-pointer transition duration-500 hover:bg-blue-700 hover:text-white"
                    onClick={() => setShowLogin(true)}>
                    Sign In
                </button>
            ) : (
                <div className="relative group">
                    {userImage ? (
                        <img src={userImage} alt="Profile Icon" className="w-[50px] h-[50px] object-cover rounded-full cursor-pointer"
                            onError={handleImageError}/>
                    ) : (
                        <img src={profile_icon} alt="Profile Icon" className="w-[50px] h-[50px] object-cover rounded-full cursor-pointer"/>
                    )}
                    <ul className="absolute hidden right-0 z-[50] group-hover:flex flex-col gap-3 bg-orange-200 px-8 py-3 border border-blue-400 rounded-md outline outline-2 outline-white list-none">
                        <li className="flex items-center gap-2 cursor-pointer hover:text-orange-400"
                            onClick={() => navigate('/get-profile')}>
                            <img className="w-6" src={profile_icon} alt="" />
                            <p className="font-normal">Profile</p>
                        </li>
                        <hr />
                        <li className="flex items-center gap-2 cursor-pointer hover:text-orange-400"
                            onClick={() => navigate('/mybooking')}>
                            <img className="w-6" src={booking_icon} alt="" />
                            <p className="font-normal">Booking</p>
                        </li>
                        <hr />
                        <li className="flex items-center gap-2 cursor-pointer hover:text-orange-400"
                            onClick={logout}>
                            <img className="w-6" src={logout_icon} alt="" />
                            <p className="font-normal">Logout</p>
                        </li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </nav>
  </div>
);
}
export default Navbar
