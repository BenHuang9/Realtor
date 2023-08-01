import React, { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { db } from '../firebase'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'
import ListingItem from '../components/ListingItem'


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
    <div>
      <Slider />
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
                  <ListingItem key={listing.id} listing={listing.data}/>
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
                  <ListingItem key={listing.id} listing={listing.data}/>
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
                  <ListingItem key={listing.id} listing={listing.data}/>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
   
   </>
  )
}

export default Home
