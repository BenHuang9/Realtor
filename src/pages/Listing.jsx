import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'
import Spinner from '../components/Spinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from "swiper"
import { EffectFade, Autoplay, Navigation } from 'swiper/modules'
import "swiper/css/bundle"
import { FaShare, FaBed, FaBath, FaParking, FaChair } from "react-icons/fa"
import { MdLocationOn } from "react-icons/md"

function Listing() {

    const params = useParams()
    const [listing, setListing] = useState(null)  
    const [loading, setLoading] = useState(true)  
    const [shareLinkCopied,setShareLinkCopied] = useState(false)

    SwiperCore.use([Autoplay, Navigation])

    useEffect(()=>{
        async function fetchListing(){
            const docRef = doc(db, "listings", params.listingId)
            const docSnap = await getDoc(docRef)
            if(docSnap.exists()){
                setListing(docSnap.data())
                setLoading(false)
            }
        }
        fetchListing()
        
    },[ params.listingId])


    if(loading){
        return <Spinner />
    }

  return (
    <>
    <main className='relative'>
        <Swiper slidesPerView={1} navigation effect='fade' modules={[EffectFade]} autoplay={{delay:3000}} >
            {listing.imgUrls.map((url,index)=>(
                <SwiperSlide key={index}>
                    <div 
                        className="w-full overflow-hidden" >
                            <img src={listing.imgUrls[index]} alt="" className='h-[500px] w-full object-cover' />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
        <div className="fixed top-[5%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center" onClick={()=>{
            navigator.clipboard.writeText(window.location.href)
            setShareLinkCopied(true)
            setTimeout(()=>{
                setShareLinkCopied(false)
            }, 2000)
        }}>
            <FaShare className="text-lg text-slate-500"/>
        </div>

        {shareLinkCopied && <p className="fixed top-[9%] right-[3%] z-10 font-semibold border-2 border-gray-400 bg-white rounded-md">Link Copied</p>}
        <div className="m-4 bg-white flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg">
            <div className=" w-full h-[200px] lg:h-[400px]">
                <p className="text-2xl font-bold mb-3">
                    {listing.name} - $ {listing.offer 
                    ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    {listing.type === "rent" && " / Month"}
                </p>
                <p className="flex items-center mt-6 mb-3 font-semibold">
                    <MdLocationOn className="text-green-700 mr-1 text-2xl"/>
                    {listing.address}
                </p>
                <div className="flex justify-start items-center space-x-4 w-[75%]">
                    <p className='bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md'>For {listing.type === "rent" ? "Rent" : "Sale"}</p>
                    {listing.offer && 
                        <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">${listing.regularPrice - listing.discountedPrice} discount</p>
                    }
                </div>
                <p className="mt-3 mb-3">
                    <span className="font-semibold">Description - </span>
                    {listing.description}
                </p>
                <ul className="flex items-center space-x-5 text-sm font-semibold whitespace-nowrap">
                    <li className="flex items-center whitespace-nowrap">
                        <FaBed className="mr-1"/>
                        {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}
                    </li>
                    <li className="flex items-center whitespace-nowrap">
                        <FaBath className="mr-1"/>
                        {listing.bathrooms > 1 ? `${listing.bedrooms} Bathrooms` : "1 Bathroom"}
                    </li>
                    <li className="flex items-center whitespace-nowrap">
                        <FaParking className="mr-1"/>
                        {listing.parking ? "Park Avbl." : "No Parking"}
                    </li>
                    <li className="flex items-center whitespace-nowrap">
                        <FaChair className="mr-1"/>
                        {listing.furnished ? "Park Avbl." : "No Furnished"}
                    </li>
                </ul>
                
            </div>
            <div className="bg-blue-300 w-full h-[200px] lg:h-[400px] z-10 overflow-x-hidden"></div>
        </div>
    </main>
    </>
  )
}

export default Listing