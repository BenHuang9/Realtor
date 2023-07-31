import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'
import Spinner from '../components/Spinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from "swiper"
import { EffectFade, Autoplay, Navigation, Pagination } from 'swiper/modules'
import "swiper/css/bundle"

function Listing() {

    const params = useParams()
    const [listing, setListing] = useState(null)  
    const [loading, setLoading] = useState(true)  

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
    </>
  )
}

export default Listing