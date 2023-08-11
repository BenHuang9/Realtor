import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { toast } from 'react-toastify'

const EmailTemplate = ({ userRef, listing }) => {
    const [landlord, setLandlord] = useState(null)
    // const [name, setName] = useState('');
    // const [email, setEmail] = useState('');
    // const [message, setMessage] = useState('');
    const [emailForm, setEmailForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    })

    const {
        name,
        email,
        phone,
        message,
    } = emailForm;

    useEffect(() => {
        async function getLandlord() {
            const docRef = doc(db, 'users', userRef)
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setLandlord(docSnap.data())
            } else {
                toast.error("Could not get landlord data")
            }
        }

        getLandlord()
    }, [userRef])

    function onChange(e) {
        setEmailForm((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }
    const handleSendClick = (e) => {
        const subject = encodeURIComponent(`I'm interested in your listing - ${listing.name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone Number: ${phone}\nMessage: ${message}`);
        const mailtoUrl = `mailto:${landlord.email}?subject=${subject}&body=${body}`;
        window.open(mailtoUrl, '_blank');
        setEmailForm({
            name: "",
            email: "",
            phone: "",
            message: "",
        })
    };

    console.log(emailForm)
    return (
        <>
            {landlord !== null &&
                <div className='flex flex-col w-full'>
                    <form>
                        <div className="mt-3 mb-6">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                id="name"
                                onChange={onChange}
                                className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                            />

                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                id="email"
                                onChange={onChange}
                                className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                            />

                            <input
                                type="tel"
                                placeholder="Your Phone Number"
                                value={phone}
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                id="phone"
                                onChange={onChange}
                                className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                            />

                            <textarea
                                placeholder={`I am interested in ${listing.name}`}
                                value={message}
                                id="message"
                                onChange={onChange}
                                className="w-full px-4 py-2 mb-4 text-xs text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                            />


                            <button type="button" onClick={handleSendClick} className="px-7 py-3 bg-blue-600 text-white rounded text-sm uppercase shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-l transition duration-200 ease-in-out w-full text-center mb-6">Send Email</button>
                        </div>
                    </form>
                </div>
            }
        </>
    );
};

export default EmailTemplate;