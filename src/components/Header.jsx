import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { MdManageAccounts } from 'react-icons/md'
import { AiTwotoneHome } from 'react-icons/ai'
import { FaSearch } from 'react-icons/fa'

function Header() {

    const auth = getAuth()
    const [checkSignIn, setCheckSignIn] = useState(false)
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState("")
    const [randomColor, setRandomColor] = useState(" ")


    useEffect(() => {
        const storedRandomColor = localStorage.getItem('randomColor');
        if (storedRandomColor) {
            setRandomColor(storedRandomColor);
        } else {
            // Generate a random color and store it in localStorage
            const newRandomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            setRandomColor(newRandomColor);
            localStorage.setItem('randomColor', newRandomColor);
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCheckSignIn(true);
                setFirstName(auth.currentUser.displayName[0]);
            } else {
                setCheckSignIn(false);
                setFirstName('');
            }
        });
    }, [auth]);

    console.log(randomColor);

    async function onLogout() {
        await auth.signOut();
        navigate('/');
        localStorage.removeItem('randomColor');
    }


    return (
        <div className=" bg-white border-t border-gray-200 fixed -bottom-1 w-full border-b shadow-sm md:sticky md:top-0 z-40 ">
            <header className='md:flex md:justify-between items-center sm:px-8 max-w-[1440px] mx-auto'>
                <div className="hidden md:block">
                    <NavLink to='/'><img src="https://www.realtor.ca/images/logo.svg" alt="logo" className='cursor-pointer h-9' /></NavLink>
                </div>
                <div className="menu">
                    <ul className='flex justify-around items-center gap-4'>
                        <li className="cursor-pointer px-8 py-4 md:p-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/' className={({ isActive }) => isActive ? "text-black" : ""} >
                                <AiTwotoneHome className="md:hidden text-2xl"/>
                                <p className="hidden md:block">Home</p>
                            </NavLink>
                        </li>
                        <li className="cursor-pointer p-8 py-4 md:p-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/property-listing' className={({ isActive }) => isActive ? "text-black" : ""}>
                                <FaSearch className="md:hidden text-2xl"/>
                                <p className="hidden md:block">Find a property</p>
                            </NavLink>
                        </li>
                        <li className="relative cursor-pointer group p-8 py-4 md:p-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ">
                            {/* <div className="group inline-block relative"> */}
                            <NavLink to={checkSignIn ? "/profile" : "/sign-in"} className={({ isActive }) => isActive ? "text-black" : ""}>
                                <MdManageAccounts className="md:hidden text-2xl"/>
                                
                                <p className="hidden md:block">
                                {checkSignIn ?
                                    <span
                                        style={{ backgroundColor: randomColor }}
                                        className="py-1 px-2 rounded-full text-white cursor-pointer"
                                    >
                                        {firstName}
                                    </span>
                                    :
                                    "Sign In"
                                }
                                </p>
                            </NavLink>

                            {checkSignIn && (
                                <div className="accountOption hidden group-hover:block absolute mt-2 py-3 px-2 w-52 bg-white border rounded shadow-md">
                                    <NavLink to="/profile" className="block py-1 px-2 hover:text-black w-full">Create New Listing</NavLink>
                                    <h3 className="cursor-pointer py-1 px-2 hover:text-black w-full" onClick={onLogout}>Sign Out</h3>
                                </div>
                            )}
                            {/* </div> */}
                        </li>
                    </ul>
                </div>

            </header>
        </div>
    )
}

export default Header