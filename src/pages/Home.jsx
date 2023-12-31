import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { NavLink } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import HeroImg from '../asset/images/homeHero.jpg'
import OurGoal from '../asset/images/ourGoal.jpg'
import { MdLocationOn } from "react-icons/md"
import BuyHouse from "../asset/images/buyHouse.svg"
import SellHouse from "../asset/images/sellHouse.svg"
import RentHouse from "../asset/images/rentHouse.svg"
import CountUp from 'react-countup'
import { useNavigate } from 'react-router-dom';
import { usePlacesWidget } from "react-google-autocomplete";
import { toast } from 'react-toastify'
function Home() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [location, setLocation] = useState({
    name: "",
    searchName: "",
    lat: "",
    lng: "",
  });


  const navigate = useNavigate();
  const handleSearch = () => {
    if (location.searchName.trim() !== '') {
      // Store location data in localStorage
      localStorage.setItem('searchLocation', JSON.stringify(location));

      // Navigate to search result page
      navigate('/advance-search');
    } else {
      toast.error("Please enter a city")
    }
  };

  const handleFindHomeClick = () => {
    // Navigate to the search page with a predefined filter
    localStorage.setItem('type', 'sales');
    navigate(`/advance-search`);
  };

  const handleFindRentClick = () => {
    // Navigate to the search page with a predefined filter for rentals
    localStorage.setItem('type', 'rent');
    navigate(`/advance-search`);
  };

  //show rent list
  const [recentListings, setRecentListings] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      //get the reference
      try {
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, orderBy("timestamp", "desc"), limit(6))
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setRecentListings(listings)
        // console.log(listings)
      } catch (error) {
        console.log(error)
      }
    }
    fetchListings()
  }, [])

  const { ref } = usePlacesWidget({
    apiKey: process.env.REACT_APP_GEOCODE_API_KEY,
    onPlaceSelected: (place) => {
      // console.log(place);
      // console.log(place.geometry.location.lat(),
      // place.geometry.location.lng())
      setLocation({
        name: place.address_components[0].long_name,
        searchName: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      })
    },
    options: {
      types: ["locality"],
      componentRestrictions: { country: "ca" },
    },
  });

  return (
    <>

      <section className="bg-[#131110] homeBanner">
        <div className="lg:h-[80vh] md:flex flex-row-reverse md:justify-around items-center max-w-[1440px] mx-auto p-8 gap-4">
          <div>
            <img src={HeroImg} alt="home hero banner" className=" h-[300px] w-[300px] lg:w-[480px] lg:h-[560px] overflow-hidden rounded-t-[15rem] border-8 mb-3 border-white/[.12]" data-aos="fade-left" data-aos-duration="2000" />
          </div>
          <div className="text-white">
            <h1 className=" text-[2rem] leading-[2rem] md:text-[2.5rem] md:leading-[3rem] lg:text-[3.8rem] lg:leading-[4rem] font-bold">
              Discover<br />
              Most Suitable<br />
              Property
            </h1>
            <p className="text-[#8c8b8b] text-xs md:text-sm py-7">Find a variety of properties that suit you very easily<br />
              Forget all difficulties in finding a residence for you
            </p>
            <form className="flex items-center bg-white rounded justify-between px-2 py-1">
              <div className="flex items-center w-full">
                <MdLocationOn className="text-blue-800 text-2xl" />
                <input
                  type="search"
                  value={location.searchName}
                  ref={ref}
                  placeholder="Search by City"
                  onChange={(e) => setLocation(prevLocation => ({ ...prevLocation, searchName: e.target.value }))}
                  className="text-black w-full border-none focus:ring-0" />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className=" bg-blue-600 p-2 rounded bg-gradient-to-r from-[#4066ff] to-blue-500"
              >
                Search
              </button>
            </form>
          </div>

        </div>
      </section>


      <section className="py-10 service">
        <div className="max-w-[1440px] mx-auto p-5 overflow-hidden">
          <div>
            <span className="text-[#BF974F] font-semibold uppercase block mb-3">Our Service</span>
            <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.5rem] lg:leading-[3.8rem] font-bold mb-6">We Make Process Simple</h2>
            <p className="lg:w-[50%]">Whether you’re buying or selling, we’ll make the process simple. We are committed to providing our clients with a high level of service and information, while providing you with an exceptional experience.</p>
          </div>
          <div className='grid lg:grid-cols-3 gap-5 mt-10'>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-duration="1000">
              <img className="w-[64px]" src={BuyHouse} alt='buy service' />
              <h3 className="text-[1.75rem] text-[#BF974F] font-semibold mb-2">Buy a property</h3>
              <p>We can find a property for the price range that fits your needs. We will help you to find the most suitable bank, prepare loan application organize an approval process and finally close on the property.</p>
              <div>
                <button
                  onClick={handleFindHomeClick}
                  className="text-black mt-10 border-2 py-5 px-8 block border-black bg-white hover:bg-[#BF974F] hover:text-white hover:border-[#BF974F] transition duration-200 ease-in-out">
                  Find a home
                </button>
              </div>
            </div>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
              <img className="w-[64px]" src={SellHouse} alt="sell service" />
              <h3 className="text-[1.75rem] text-[#BF974F] font-semibold mb-2">Sell a property</h3>
              <p>We will take care of all paperwork, advertising, and organizing of open houses, showings and negotiations. Our experienced brokers will make sure that you get the highest price possible for your property.</p>
              <div>
                <button className="text-black mt-10 border-2 border-black bg-white hover:bg-[#BF974F] hover:text-white hover:border-[#BF974F] transition duration-200 ease-in-out">
                  <NavLink to="/profile" className="py-5 px-8 block">List your property</NavLink>
                </button>
              </div>
            </div>
            <div className='border-2 border-black rounded-lg px-4 py-8 flex flex-col justify-between' data-aos="fade-up" data-aos-duration="1000" data-aos-delay="150">
              <img className="w-[64px]" src={RentHouse} alt="rent service" />
              <h3 className="text-[1.75rem] text-[#BF974F] font-semibold mb-2">Rent a property</h3>
              <p>Find your new apartment or house in a safe and fast way. We will take care of the paperwork. You focus on your move to a new city. We are a boutique real estate firm with a distinct focus on customer service.</p>
              <div>
                <button
                  onClick={handleFindRentClick}
                  className="text-black mt-10 py-5 px-8 block border-2 border-black bg-white hover:bg-[#BF974F] hover:text-white hover:border-[#BF974F] transition duration-200 ease-in-out">
                  Find a rent
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='listing py-10 bg-[#F6F4F0]'>
        <div className="max-w-[1440px] mx-auto p-5">
          <div>
            <span className="text-[#BF974F] font-semibold uppercase block mb-3">Recent Properties</span>
            <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.5rem] lg:leading-[3.8rem] font-bold mb-6">Explore the latest<br /> properties available</h2>
          </div>
          <div>
            {recentListings && recentListings.length > 0 && (
              <div className=" mx-auto">

                <ul className='gap-3 gap-y-0 grid md:grid-cols-2 lg:grid-cols-3 mt-6' >
                  {recentListings.map(listing => (
                    <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                  ))}
                </ul>
                <button className="block mx-auto m-5">
                  <NavLink to="/advance-search" className="text-black mt-10 p-3 block border-2 border-black hover:bg-[#BF974F] hover:text-white hover:border-[#BF974F] transition duration-200 ease-in-out">
                    Show More Listings
                  </NavLink>
                </button>

              </div>
            )}
          </div>
        </div>
      </section>

      <section className='ourGoal py-10'>
        <div className="flex flex-wrap-reverse justify-start lg:justify-between items-center max-w-[1440px] mx-auto p-5 gap-4">
          <div className="lg:w-[50%]">
            <span className="text-[#BF974F] font-semibold uppercase block mb-3">Our Goal</span>
            <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.5rem] lg:leading-[3.8rem] font-bold mb-6">
              Helping You Discover Your Ideal House With Us
            </h2>
            <p className="lg:w-[90%]">
              We promise that we provide high-quality listings, and help you discover the perfect place to call home
              {/* List your property for free on Zillow open up a world of possibilities to connect with potential renters/buyer who are eagerly searching for a place like yours. */}
            </p>
            <div className="py-2">
              <CountUp start={0} end={10000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef }) => (
                  <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-[#BF974F]">number</h2>
                )}
              </CountUp>
              <p className=" text-xl">Number Of Sold Listings</p>
            </div>
            <div className="py-2">
              <CountUp start={0} end={10000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef }) => (
                  <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-[#BF974F]">number</h2>
                )}
              </CountUp>
              <p className=" text-xl">Clients We've Served</p>
            </div>
            <div className="py-2">
              <CountUp start={0} end={15000} enableScrollSpy={true} scrollSpyOnce={true}>
                {({ countUpRef }) => (
                  <h2 ref={countUpRef} className=" text-[3rem] font-semibold text-[#BF974F]">number</h2>
                )}
              </CountUp>
              <p className=" text-xl">Number Of Active Listings</p>
            </div>
          </div>
          <div>
            <img src={OurGoal} alt="our goal" className="h-[560px]" />
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
