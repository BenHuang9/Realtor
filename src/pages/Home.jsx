import React, { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { db } from '../firebase'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import HeroImg from '../asset/images/homeHero.jpg'
import { MdLocationOn } from "react-icons/md"

function Home() {
  const [offerListings, setOfferListings] = useState(null)


  useEffect(()=>{
    async function fetchListings(){

      //get the reference
      try{
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("offer", "==", true), orderBy("timestamp", "desc"), limit(4))
        const querySnap = await getDocs(q)
        const listings =[]
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setOfferListings(listings)
        // console.log(listings)
      }catch(error){
        console.log(error)
      }
    }
    fetchListings()
  },[])

  //show rent list
  const [rentListings, setRentListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){

      //get the reference
      try{
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("type", "==", "rent"), orderBy("timestamp", "desc"), limit(4))
        const querySnap = await getDocs(q)
        const listings =[]
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setRentListings(listings)
        // console.log(listings)
      }catch(error){
        console.log(error)
      }
    }
    fetchListings()
  },[])

  //show rent list
  const [sellListings, setSellListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){

      //get the reference
      try{
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("type", "==", "sell"), orderBy("timestamp", "desc"), limit(4))
        const querySnap = await getDocs(q)
        const listings =[]
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setSellListings(listings)
        // console.log(listings)
      }catch(error){
        console.log(error)
      }
    }
    fetchListings()
  },[])


  return (
    <>
    
      <div className="bg-[#131110]">
        <div className="lg:h-[80vh] flex flex-wrap-reverse justify-around items-center max-w-[1440px] mx-auto p-8 gap-4">
          <div className="text-white">
            <h1 className=" text-[2rem] leading-[2rem] lg:text-[3.8rem] lg:leading-[4rem] font-bold">Discover<br/> 
                Most Suitable<br/> 
                Property
            </h1>
            <p className="text-[#8c8b8b] text-xs md:text-sm py-7">Find a variety of properties that suit you very easily<br/>
              Forget all difficulties in finding a residence for you
            </p>
            <form className="flex items-center bg-white rounded justify-between px-2 py-1">
              <div className="flex items-center w-full">
                <MdLocationOn className="text-blue-800 text-2xl"/>
                <input type="search" className="text-black w-full border-none focus:ring-0"/>
              </div>
              <button className=" bg-blue-600 p-2 rounded bg-gradient-to-r from-[#4066ff] to-blue-500">Search</button>
            </form>
          </div>
          <div>
            <img src={HeroImg} alt="home hero image" className=" h-[450px] lg:w-[480px] lg:h-[560px] overflow-hidden rounded-t-[15rem] border-8 border-white/[.12]"/>
          </div>
        </div>
      </div>
      <div>
        {offerListings && offerListings.length > 0 && (
          <div className="max-w-6xl mx-auto pt-4 space-y-6">
            <div>
              <h2 className="px-3 text-2xl my-6 font-semibold">Recent Offer</h2>
              <NavLink to="/offers" className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"> 
                show more offer
              </NavLink>
              <ul className='sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {offerListings.map(listing => (
                  <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div>
        {rentListings && rentListings.length > 0 && (
          <div className="max-w-6xl mx-auto pt-4 space-y-6">
            <div>
              <h2 className="px-3 text-2xl my-6 font-semibold">Recent Rent</h2>
              <NavLink to="/category/rent" className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"> 
                show more for rent
              </NavLink>
              <ul className='sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {rentListings.map(listing => (
                  <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div>
        {sellListings && sellListings.length > 0 && (
          <div className="max-w-6xl mx-auto pt-4 space-y-6">
            <div>
              <h2 className="px-3 text-2xl my-6 font-semibold">Recent Sale</h2>
              <NavLink to="/category/sell" className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"> 
                show more for sale
              </NavLink>
              <ul className='sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {sellListings.map(listing => (
                  <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
   </>
  )
}

export default Home
