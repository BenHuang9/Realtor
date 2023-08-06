import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
function Header() {

    const auth = getAuth()
    const [checkSignIn, setCheckSignIn] = useState(false)
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState(' ')

    useEffect( ()=>{
        onAuthStateChanged(auth,(user)=>{
            if(user){
                setCheckSignIn(true)
                // let firstName  =  auth.currentUser.displayName.split(' ')[0]
                setFirstName(auth.currentUser.displayName.split(' ')[0])
            }else{
                setCheckSignIn(false)
                setFirstName('')
            }
        })
 
    },[])

    async function onLogout(){
        await auth.signOut()
        navigate('/')
       
    }

 
    return (
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
            <header className='flex justify-between items-center px-3 max-w-[1440px] mx-auto'>
                <div>
                    <NavLink to='/'><img src="https://www.realtor.ca/images/logo.svg" alt="logo" className='cursor-pointer h-9' /></NavLink>
                </div>
                <div>
                    <ul className='flex gap-5'>
                        <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/' className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>Home</NavLink>
                        </li>
                        <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/offers' className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>Offer</NavLink>
                        </li>
                        <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ">
                            <NavLink to={checkSignIn ? "/profile" : "/sign-in"} className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>{checkSignIn ? `Hello! ${firstName}` : "Sign In" }</NavLink>
                        </li>
                        <li className="cursor-pointer my-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            {checkSignIn &&
                                <p 
                                    onClick={onLogout}
                                    className={({ isActive }) => isActive ? "text-black border-b-[3px] py-3 border-b-red-500" : ""}>
                                    Sign Out
                                </p>
                            }
                        </li>
                    </ul>
                </div>
            </header>
        </div>
    )
}

export default Header