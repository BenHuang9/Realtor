import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from "swiper"
import { EffectFade, Autoplay, Navigation } from 'swiper/modules'
import { useNavigate } from 'react-router';

function Slider() {

    const [listings, setListings] = useState(null)

    SwiperCore.use([Autoplay, Navigation])
    const navigate = useNavigate()
    useEffect(()=>{
        async function fetchListing(){
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5))
        const querySnap = await getDocs(q)
        let listings = []
        querySnap.forEach((doc)=>{
            return listings.push({
            id: doc.id,
            data: doc.data()
            }) 
        })
        setListings(listings)
        // console.log(listings)

        }

        fetchListing()
    },[])

    // if( listings.length === 0){
    //     return <></>
    // }

    return (
        <>
        {listings &&
            <div>
                <Swiper slidesPerView={1} navigation effect='fade' modules={[EffectFade]} autoplay={{delay:3000}}>
                    {listings.map(({data, id})=> (
                        <SwiperSlide key={id} onClick={()=>navigate(`/category/${data.type}/${id}`)}>
                            <div className="relative w-full overflow-hidden cursor-pointer" >
                                <img src={data.imgUrls[0]} alt="" className='h-[50vh] w-full object-cover' />
                                <h2 className="text-[#f1faee] absolute top-3 left-1 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl">
                                    {data.name}
                                </h2>
                                <h2 className="text-[#f1faee] absolute bottom-3 left-1 font-medium max-w-[90%] bg-[#e63946] shadow-lg   opacity-90 p-2 rounded-tr-3xl">
                                $ {data.offer 
                                    ? data.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
                                    : data.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                {data.type === "rent" && " / Month"}
                                </h2>
                            </div>
                        </SwiperSlide>          
                    ))}
                </Swiper>
            
            </div>
          }
        </>
    )
}

export default Slider