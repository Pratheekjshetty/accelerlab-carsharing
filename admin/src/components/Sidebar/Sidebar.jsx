import React from 'react'
import './Sidebar.css'
import home_icon from '../../assets/home_icon.png'
import user_icon from '../../assets/user_icon.png'
import driver_icon from '../../assets/driver_icon.png'
import add_icon from '../../assets/add_icon.png'
import order_icon from '../../assets/order_icon.png'
import car_icon from '../../assets/car_icon.png'
import cancel_icon from '../../assets/cancel.png'
import apply_icon from '../../assets/apply.png'
import available_icon from '../../assets/event_available.png'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: home_icon, label: 'Home' },
  { to: '/user', icon: user_icon, label: 'Users' },
  { to: '/driver', icon: driver_icon, label: 'Drivers' },
  // { to: '/add', icon: add_icon, label: 'Add Cars' },
  { to: '/list', icon: order_icon, label: 'List Cars' },
  { to: '/booking', icon: car_icon, label: 'Bookings' },
  { to: '/available', icon: available_icon, label: 'Available' },
  { to: '/cancel', icon: cancel_icon, label: 'Cancelation' },
  { to: '/apply', icon: apply_icon, label: 'Application' },
]

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border border-gray-400 border-t-0 text-[max(1vw,1px)] bg-blue-200 shadow-md'>
      <div className="pt-6 pl-5 pr-3 flex flex-col gap-[10px]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-[12px] p-[10px_12px] rounded-[8px] cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md scale-[1.02]'
                  : 'bg-blue-50 text-gray-700 hover:bg-blue-300 hover:translate-x-[2px]'
              }`
            }>
            <img src={item.icon} alt="" className="w-[26px]" />
            <p className='hidden lg:block font-medium'>{item.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar