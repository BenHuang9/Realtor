import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner';
import { FaShareAlt, FaBed, FaBath, FaParking, FaChair, FaMapMarkerAlt } from "react-icons/fa"
import { LiaRulerCombinedSolid } from "react-icons/lia"
import { MdLocationOn, MdPrint } from "react-icons/md"
import { getAuth } from 'firebase/auth';
import ListingItem from '../components/ListingItem';
import OwlCarousel from 'react-owl-carousel';
import GoogleMapReact from 'google-map-react';
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import EmailTemplate from '../components/EmailTemplate'

function Listing() {

    const auth = getAuth()
    const params = useParams()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
    const [relatedListings, setRelatedListings] = useState(null)
    const [type, setType] = useState(null);

    useEffect(() => {
        async function fetchListing() {
            const docRef = doc(db, "listings", params.listingId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing(docSnap.data());
                setType(docSnap.data().type);
                setLoading(false);
            }
        }
        fetchListing();
    }, [params.listingId]);

    useEffect(() => {
        if (type === "sell") {
            async function fetchListings() {
                console.log('it is a sell listing')
                try {
                    // get reference
                    const listingsRef = collection(db, "listings");
                    // create the query
                    const q = query(
                        listingsRef,
                        where("type", "==", "sell"),
                        orderBy("timestamp", "desc"),
                        limit(6)
                    );
                    // execute the query
                    const querySnap = await getDocs(q);
                    const listings = [];
                    querySnap.forEach((doc) => {
                        return listings.push({
                            id: doc.id,
                            data: doc.data(),
                        });
                    });
                    setRelatedListings(listings);
                } catch (error) {
                    console.log(error);
                }
            }
            fetchListings()
        } else if (type === "rent") {
            async function fetchListings() {
                console.log('it is a rent listing')
                try {
                    // get reference
                    const listingsRef = collection(db, "listings");
                    // create the query
                    const q = query(
                        listingsRef,
                        where("type", "==", "rent"),
                        orderBy("timestamp", "desc"),
                        limit(6)
                    );
                    // execute the query
                    const querySnap = await getDocs(q);
                    const listings = [];
                    querySnap.forEach((doc) => {
                        return listings.push({
                            id: doc.id,
                            data: doc.data(),
                        });
                    });
                    setRelatedListings(listings);
                } catch (error) {
                    console.log(error);
                }
            }
            fetchListings()
        }
    }, [type])

    //Carousel options
    const options = {
        margin: 25,
        responsiveClass: true,

        dots: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            320: {
                items: 1,
            },
            550: {
                items: 2,
                nav: true,
            },
            768: {
                items: 3,
                nav: true,
            },
        },
    };

    const Marker = ({ text }) => (
        <div className="marker">
            <FaMapMarkerAlt className="text-2xl text-red-500" />
        </div>
    );

    const location = {
        lat: 49.1649021,
        lng: -123.1705467,
    };

    const defaultProps = {
        center: location,
        zoom: 15, // Adjust the zoom level as needed
    };

    if (loading) {
        return <Spinner />

    }
    return (
        <>
            <section className='relative bg-[#fcfbfd]'>
                <LightGallery
                    speed={500}
                    plugins={[lgThumbnail, lgZoom]}
                    mode="lg-fade"
                    elementClassNames="lightGallery grid grid-rows-2 grid-cols-3 lg:grid-cols-4 grid-flow-col h-[40vh] md:h-[50vh]"
                >
                    {listing.imgUrls.map((url, index) => {
                        return (
                            <a
                                className="gallery-item cursor-pointer"
                                href={listing.imgUrls[index]}
                                key={index}
                            >
                                <img
                                    className="img-responsive w-full object-cover h-full"
                                    src={listing.imgUrls[index]}
                                    alt='listing gallery'
                                />
                            </a>
                        )
                    })}
                </LightGallery>


                <div className=" max-w-[1440px] lg:flex lg:mx-auto p-8 gap-8 relative ">
                    <div className="propertyInfo w-full basis-9/12 lg:max-w-[75%]">
                        <div className="houseTitle sm:flex flex-wrap items-center justify-between mb-3">
                            <h1 className="mb-1 text-2xl sm:text-4xl sm:mb-0 font-bold ">
                                {listing.name}
                            </h1>
                            <div className="text-2xl">
                                $ {listing.offer
                                    ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                {listing.type === "rent" && " / Month"}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                            <p className="flex items-center text-sm">
                                <MdLocationOn className="text-green-700 mr-1 sm:text-xl" />
                                {listing.address}
                            </p>
                            <div className="flex gap-2">
                                <div
                                    className="bg-white cursor-pointer relative rounded-full py-2 px-3 flex justify-center items-center shadow-lg gap-2"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        setShareLinkCopied(true)
                                        setTimeout(() => {
                                            setShareLinkCopied(false)
                                        }, 2000)
                                    }}
                                >
                                    <FaShareAlt className="text-sm text-slate-500" />
                                    <p className="text-xs">Share</p>
                                    {shareLinkCopied &&
                                        <p className="absolute w-full text-xs text-center -top-3 -right-8 z-10 font-semibold border border-gray-400 bg-white rounded-md">Link Copied</p>
                                    }
                                </div>
                                <div
                                    className="bg-white cursor-pointer relative rounded-full py-2 px-3 flex justify-center items-center shadow-lg gap-2"
                                    onClick={() => {
                                        window.print();
                                    }}
                                >
                                    <MdPrint className=" text-slate-500" />
                                    <p className="text-xs">Print</p>
                                </div>
                            </div>

                        </div>
                        <div className="flex justify-start items-center space-x-4 w-[75%] mb-7">
                            <p className='bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md'>For {listing.type === "rent" ? "Rent" : "Sale"}</p>
                            {listing.offer &&
                                <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">${listing.regularPrice - listing.discountedPrice} discount</p>
                            }
                        </div>
                        <div className="propertyOverview rounded-lg shadow-lg p-7 mb-7 bg-white">
                            <h3 className="mb-5 font-semibold">Overview</h3>
                            <ul className="grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-5 justify-items-center">
                                <li>
                                    <p className="m-auto">Updated On:</p>
                                    {listing.timestamp &&
                                        new Date(listing.timestamp.toDate()).toLocaleString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                            day: "2-digit",
                                        })}
                                </li>
                                <li >
                                    <FaBed className="text-xl m-auto mb-1" />
                                    {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}
                                </li>
                                <li >
                                    <FaBath className="text-xl m-auto mb-1" />
                                    {listing.bathrooms > 1 ? `${listing.bedrooms} Bathrooms` : "1 Bathroom"}
                                </li>
                                <li >
                                    <FaParking className="text-xl m-auto mb-1" />
                                    {listing.parking ? "Park Avbl." : "No Parking"}
                                </li>
                                <li>
                                    <FaChair className="text-xl m-auto mb-1" />
                                    {listing.furnished ? "Park Avbl." : "No Furnished"}
                                </li>
                                <li>
                                    <LiaRulerCombinedSolid className="text-xl m-auto mb-1" />
                                    {listing.sqFeet} ft<sup>2</sup>
                                </li>
                            </ul>
                        </div>
                        <div className="propertyDescription rounded-lg shadow-lg p-7 mb-7 bg-white">
                            <h3 className="mb-5 font-semibold">Description</h3>
                            <p className="text-sm">{listing.description}</p>
                        </div>

                        <div className="propertyMap rounded-lg shadow-lg p-7 mb-7 bg-white">
                            <h3 className="mb-5 font-semibold">Location</h3>
                            <div className="w-full h-[350px] lg:h-[500px]">
                                <GoogleMapReact
                                    bootstrapURLKeys={{ key: process.env.REACT_APP_GEOCODE_API_KEY }}
                                    defaultCenter={defaultProps.center}
                                    defaultZoom={defaultProps.zoom}
                                    className="rounded-lg"
                                >
                                    {/* Add a marker for the specified location */}
                                    <Marker lat={location.lat} lng={location.lng} text="Your Location" />
                                </GoogleMapReact>
                            </div>
                        </div>


                        {relatedListings && relatedListings.length > 0 && (
                            <div className="similarListings mb-7">
                                <h3 className="mb-5 text-2xl font-bold">Similar Listings</h3>
                                {/* <ul className='grid grid-cols-2 gap-5 mt-6' >
                                    {relatedListings.map(listing => (
                                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                                    ))}
                                </ul> */}

                                <OwlCarousel
                                    className="owl-theme"
                                    {...options}>
                                    {relatedListings.map(listing => (
                                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                                    ))}
                                </OwlCarousel>

                            </div>
                        )}
                    </div>
                    <div className="contact basis-3/12 relative lg:max-w-[25%]">
                        {/* if the userRef is not the same as the user who create the listing and if contactLandlord is false, show the button */}
                        <div className="rounded-lg shadow-lg p-7 bg-white sticky top-[70px]">
                            <h3 className="mb-5 font-semibold">Request Info</h3>
                            <p>Contact Landlord</p>
                            {listing.userRef !== auth.currentUser?.uid && (
                                    <EmailTemplate
                                        userRef={listing.userRef}
                                        listing={listing} 
                                    />
                            )}
                        </div>
                    </div>
                </div>
            </section >
        </>
    )
}

export default Listing