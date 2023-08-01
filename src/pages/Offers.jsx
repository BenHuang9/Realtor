import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

  useEffect(()=>{
    async function fetchListings(){

      try{
        const listingRef = collection(db, "listings")
        const q = query(listingRef, where("offer", "==", true), orderBy("timestamp", "desc"), limit(8))

        const querySnap = await getDocs(q)
        const listings = []
        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })

        setListings(listings)
        setLoading(false)
        console.log(listings)
      }catch(error){
        console.log(error)
        toast.error("Could not fetch listing")
      }
    }

    fetchListings()
  },[])

  async function onFetchMoreListings(){

    try{
      const listingRef = collection(db, "listings")
      const q = query(listingRef, where("offer", "==", true), orderBy("timestamp", "desc"), startAfter(lastFetchedListing), limit(4))

      const querySnap = await getDocs(q)
      const listings = []
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)
      querySnap.forEach((doc)=>{
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings((prevState) => [
        ...prevState,
        ...listings])
      setLoading(false)
      console.log(listings)
    }catch(error){
      console.log(error)
      toast.error("Could not fetch listing")
    }
  }
  return (
    <div className='max-w-6xl mx-auto px-3'>
      <h1 className='text-3xl text-center mt-6 font-bold mb-6'>Offer</h1>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
        <div>
          <ul className='sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {listings.map((listing)=>(
              <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
            ))}
          </ul>
          {lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button 
                onClick={onFetchMoreListings}
                className='bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-200 ease-in-out'>Load More</button>
            </div>
          )}
        </div>
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  )
}

export default Offers