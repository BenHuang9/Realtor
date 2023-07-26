import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { NavLink } from 'react-router-dom';

function Header() {
    const location = useLocation();
    const navigation = useNavigate();
    function pathMathRoute(route){
        if (route === location.pathname){
            return true
        }
    }


  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <header className='flex justify-between items-center px-3 max-w-6xl mx-auto'>
            <div>
                <NavLink to='/'><img src="https://www.realtor.ca/images/logo.svg" alt="logo" className='cursor-pointer h-9' /></NavLink>
            </div>
            <div>
                <ul className='flex space-x-10'>
                    <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                        <NavLink to='/' className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>Home</NavLink>
                    </li>
                    <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                        <NavLink to='/offers' className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>Offer</NavLink>
                    </li>
                    <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                        <NavLink to='/sign-in' className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>Sign In</NavLink>
                    </li>
                </ul>
            </div>
        </header>
    </div>
  )
}

export default Header