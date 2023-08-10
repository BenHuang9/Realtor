import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { toast } from 'react-toastify'

function Contact({ userRef, listing }) {
    const [landlord, setLandloard] = useState(null)
    const [message, setMessage] = useState("")

    useEffect(() => {
        async function getLandlord() {
            const docRef = doc(db, 'users', userRef)
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setLandloard(docSnap.data())
            } else {
                toast.error("Could not get landlord data")
            }
        }

        getLandlord()
    }, [userRef])

    function onChange(e) {
        setMessage(e.target.value)
    }

    return (
        <>
            {landlord !== null &&
                <div className='flex flex-col w-full'>
                    {/* <p>Contact {landlord.name} for the {listing.name.toLowerCase()}</p> */}
                    <div className="mt-3 mb-6">
                        <input
                            type="text"
                            placeholder="Your Name"
                            name=""
                            id=""
                            className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                        />
                        <input
                            type="text"
                            placeholder="Your Email"
                            name=""
                            id=""
                            className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                        />
                        <input
                            type="text"
                            placeholder="Your Phone"
                            name=""
                            id=""
                            className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                        />

                        <textarea
                            name="message"
                            id="message"
                            value={message}
                            onChange={onChange}
                            placeholder={`I am interested in ${listing.name}`}
                            rows="3"
                            className="w-full px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                        >
                        </textarea>
                    </div>
                    <a href={`mailto:${landlord.email}?Subject=${listing.name}&body=${message}`}>
                        <button type="button" className="px-7 py-3 bg-blue-600 text-white rounded text-sm uppercase shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-l transition duration-200 ease-in-out w-full text-center mb-6">Send Request</button>
                    </a>
                </div>
            }
        </>
    )
}

export default Contact