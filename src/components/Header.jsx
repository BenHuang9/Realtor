import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
function Header() {

    const auth = getAuth()
    const [checkSignIn, setCheckSignIn] = useState(false)


    useEffect( ()=>{
        onAuthStateChanged(auth,(user)=>{
            if(user){
                setCheckSignIn(true)
            }else{
                setCheckSignIn(false)
            }
            console.log(user)
        })
        
        
    })

    return (
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
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
                            <NavLink to={checkSignIn ? "/profile" : "/sign-in"} className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>{checkSignIn ? "Profile" : "Sign In"}</NavLink>
                        </li>
                    </ul>
                </div>
            </header>
        </div>
    )
}

export default Header