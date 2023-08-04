import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import HeroImg from '../asset/images/homeHero.jpg'
import OurGoal from '../asset/images/ourGoal.jpg'
import { MdLocationOn } from "react-icons/md"
import CountUp from 'react-countup'
import { BsFillHouseAddFill } from 'react-icons/bs'

function Home() {

  //show rent list
  const [recentListings, setRecentListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){
      //get the reference
      try{
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, orderBy("timestamp", "desc"), limit(8))
        const querySnap = await getDocs(q)
        const listings =[]
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setRecentListings(listings)
        // console.log(listings)
      }catch(error){
        console.log(error)
      }
    }
    fetchListings()
  },[])


  return (
    <>
    
    <div className="bg-[#131110] homeBanner">
        <div className="lg:h-[80vh] flex flex-wrap-reverse justify-around items-center max-w-[1440px] mx-auto p-8 gap-4">
          <div className="text-white">
            <h1 className=" text-[2rem] leading-[2rem] lg:text-[3.8rem] lg:leading-[4rem] font-bold">
                Discover<br/> 
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
            <img src={HeroImg} alt="home hero image" className=" h-[450px] lg:w-[480px] lg:h-[560px] overflow-hidden rounded-t-[15rem] border-8 border-white/[.12]" data-aos="fade-left" data-aos-duration="2500" />
          </div>
        </div>
      </div>

      <div className='ourGoal py-10'>
        <div className="flex flex-wrap-reverse justify-start lg:justify-around items-center max-w-[1440px] mx-auto p-8 gap-4">
          <div className="lg:w-[50%]">
            <h2 className="text-[3rem] lg:text-[3.5rem] leading-[4rem] font-bold mb-6">
              Helping You Discover Your Ideal House With Us
            </h2>
            <p className="lg:w-[90%]">
              We promise that we provide high-quality listings, and help you discover the perfect place to call home
              {/* List your property for free on Zillow open up a world of possibilities to connect with potential renters/buyer who are eagerly searching for a place like yours. */}
              </p>
            <div className="py-2">
              <CountUp start={0} end={8000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef}) => (
                    <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-green-800"/>
                )}
              </CountUp>
              <p className=" text-xl">Customer satisfaction with our service</p>
            </div>
            <div className="py-2">
            <CountUp start={0} end={10000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef}) => (
                    <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-green-800"/>
                )}
              </CountUp>
              <p className=" text-xl">The number of successful house deals</p>
            </div>
            <div className="py-2">
            <CountUp start={0} end={15000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef}) => (
                    <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-green-800"/>
                )}
              </CountUp>
              <p className=" text-xl">The best properties are listing</p>
            </div>
          </div>
          <div>
            <img src={OurGoal} alt="our goal image" className="h-[560px]"/>
          </div>
        </div>
      </div>

      <div className='Listing py-10 bg-[#F6F4F0]'>
        <div className="max-w-[1440px] mx-auto p-8">
          <div className="text-center">
            <h2 className="text-[3rem] lg:text-[3.5rem] leading-[4rem] font-bold mb-6">Explore Recent Listed</h2>
            <p>Take a deep dive and browse homes for sale/rent, original neighborhood photos and local insights to find what is right for you.</p>
          </div>
          <div>
            {recentListings && recentListings.length > 0 && (
              <div className=" mx-auto pt-4 space-y-6">
                <div>
                  <NavLink to="/category/sell" className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"> 
                    show more for sale
                  </NavLink>
                  <ul className='sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                    {recentListings.map(listing => (
                      <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="bg-green-600 p-8">
        <div className="max-w-[1440px] mx-auto p-8">
          <div className="md:text-center text-white">
            <h2 className="text-[1.75rem] leading-8 lg:text-[2rem] lg:leading-[4rem] font-bold mb-6">Embark on a rewarding journey as a landlord with unparalleled ease.</h2>
            <p>
              Create your rental lease using our online lease builder.
              Let you list your property where millions of renters search each month.
            </p>
            
            <button className="text-black mt-10 border border-green-600 rounded bg-white hover:bg-green-800 hover:text-white">
              <NavLink to="/sign-in" className="py-5 px-8 block">List Your Property</NavLink>
            </button>
          </div>
        </div>
      </div> */}

      <div className="py-10">
        <div className="max-w-[1440px] mx-auto p-8">
          <div className="text-center max-w-[800px] m-auto">
            <h2 className="text-[3rem] lg:text-[3.5rem] leading-[4rem] font-bold mb-6">We Make Process Simple</h2>
            <p>Whether you’re buying or selling, we’ll make the process simple. We are committed to providing our clients with a high level of service and information, while providing you with an exceptional experience.</p>
          </div>
          <div className='grid grid-cols-3 gap-5 mt-10'>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-offset="800">
              <BsFillHouseAddFill className=" text-[4rem] mb-5"/>
              <h3 className="text-[1.75rem] font-semibold mb-2">Buy a property</h3>
              <p>We can find a property for the price range that fits your needs. We will help you to find the most suitable bank, prepare loan application organize an approval process and finally close on the property.</p>
              <div>
                <button className="text-black mt-10 border border-green-600 rounded bg-white hover:bg-green-800 hover:text-white">
                  <NavLink to="/sign-in" className="py-5 px-8 block">Find a home</NavLink>
                </button>
              </div>
            </div>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-offset="800" data-aos-delay="50">
              <BsFillHouseAddFill className=" text-[4rem] mb-5"/>
              <h3 className="text-[1.75rem] font-semibold mb-2">Sell a property</h3>
              <p>We will take care of all paperwork, advertising, and organizing of open houses, showings and negotiations. Our experienced brokers will make sure that you get the highest price possible for your property.</p>
              <div>
                <button className="text-black mt-10 border border-green-600 rounded bg-white hover:bg-green-800 hover:text-white">
                  <NavLink to="/sign-in" className="py-5 px-8 block">List your property</NavLink>
                </button>
              </div>
            </div>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-offset="800" data-aos-delay="100">
              <BsFillHouseAddFill className=" text-[4rem] mb-5"/>
              <h3 className="text-[1.75rem] font-semibold mb-2">Rent a property</h3>
              <p>Find your new apartment or house in a safe and fast way. We will take care of the paperwork. You focus on your move to a new city. We are a boutique real estate firm with a distinct focus on customer service.</p>
              <div>
                <button className="text-black mt-10 border border-green-600 rounded bg-white hover:bg-green-800 hover:text-white">
                  <NavLink to="/sign-in" className="py-5 px-8 block">Find a rent</NavLink>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
   </>
  )
}

export default Home
