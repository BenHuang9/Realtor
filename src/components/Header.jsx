import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
function Header() {

    const auth = getAuth()
    const [checkSignIn, setCheckSignIn] = useState(false)
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState("")
    const [randomColor, setRandomColor] = useState(" ")


    useEffect(() => {
        // Check if random color has been generated in localStorage


        onAuthStateChanged(auth, (user) => {
            const storedRandomColor = localStorage.getItem('randomColor');
            if (storedRandomColor) {
                setRandomColor(storedRandomColor);
            }

            if (user) {
                setCheckSignIn(true);
                setFirstName(auth.currentUser.displayName[0]);

                if (!storedRandomColor) {
                    // Generate a random color and store it in localStorage
                    const newRandomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                    setRandomColor(newRandomColor);
                    localStorage.setItem('randomColor', newRandomColor);
                }
            } else {
                setCheckSignIn(false);
                setFirstName('');
            }
        });
    }, [auth]);
    console.log(randomColor)
    async function onLogout() {
        await auth.signOut();
        navigate('/');
        localStorage.removeItem('randomColor');
    }


    return (
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
            <header className='flex justify-between items-center px-8 max-w-[1440px] mx-auto'>
                <div>
                    <NavLink to='/'><img src="https://www.realtor.ca/images/logo.svg" alt="logo" className='cursor-pointer h-9' /></NavLink>
                </div>
                <div className="flex items-center">
                    <ul className='flex gap-5'>
                        <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/' className={({ isActive }) => isActive ? "text-black" : ""}>Home</NavLink>
                        </li>
                        <li className="cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">
                            <NavLink to='/property-listing' className={({ isActive }) => isActive ? "text-black" : ""}>Find a property</NavLink>
                        </li>
                        <li className="relative cursor-pointer group py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ">
                            {/* <div className="group inline-block relative"> */}
                            <NavLink to={checkSignIn ? "/profile" : "/sign-in"}>
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
                    <div>

                    </div>
                </div>

            </header>
        </div>
    )
}

export default Header