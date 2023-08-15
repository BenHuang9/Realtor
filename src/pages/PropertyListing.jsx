import React, { useEffect, useState } from 'react';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore";
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaBed } from "react-icons/fa"
import { LiaBathSolid, LiaRulerCombinedSolid } from "react-icons/lia"
import ReactDOMServer from 'react-dom/server';
import { usePlacesWidget } from "react-google-autocomplete";
import { MdLocationOn } from "react-icons/md"
import { NavLink } from 'react-router-dom';
import Spinner from '../components/Spinner';

function PropertyListing() {
    // Retrieve location data from localStorage
    const [loading, setLoading] = useState(true)
    const [listingLocations, setListingLocations] = useState([]);
    const [placesWidgetRef, setPlacesWidgetRef] = useState({});
    const [zoom, setZoom] = useState(5);
    const [filterOption, setFilterOption] = useState({
        searchName: "",
        location: "",
        bedrooms: null,
        priceRange: [0, 4000000],
        type: null,
        lat: 49.09996035,
        lng: -116.516697,
        property: "",
    })
  
    const {
        searchName,
        location,
        bedrooms,
        priceRange,
        type,
        lat,
        lng,
        property,
    } = filterOption;
  
    const customMarkerIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: ReactDOMServer.renderToString(
            <FaMapMarkerAlt className="text-2xl text-red-500" />
        ),
  
    });
  
    function onChange(id, newValue) {
        setFilterOption(prevState => ({
            ...prevState,
            [id]: newValue
        }));
    }
  
    // show result when home page search by location, find a home button, and find a rent button
    useEffect(() => {
        async function fetchListings() {
            //get the reference
            try {
              const listingsRef = collection(db, "listings")
              const q = query(listingsRef, orderBy("timestamp", "desc"))
              const querySnap = await getDocs(q)
              const listings = []
              querySnap.forEach((doc) => {
                return listings.push({
                  id: doc.id,
                  data: doc.data(),
                })
              })
              setListingLocations(listings)
              setLoading(false);
            } catch (error) {
              console.log(error)
            }
          }
          fetchListings()
    }, []);
  
    console.log(listingLocations)
    useEffect(() => {
        // Update price range when type changes
        if (type === 'rent') {
            setFilterOption(prevState => ({
                ...prevState,
                priceRange: [0, 5000],
            }));
        } else if (type === 'sales' || type === "") {
            setFilterOption(prevState => ({
                ...prevState,
                priceRange: [0, 4000000],
            }));
        }
    }, [type]);
  
    useEffect(() => {
        if (!searchName && listingLocations.length > 0) {
            // Use the first value in the listingLocations object's lat and lng
            setFilterOption(prevState => ({
                ...prevState,
                lat: listingLocations[0].data.geolocation.lat,
                lng: listingLocations[0].data.geolocation.lng,
            }));
        }
    }, [searchName, listingLocations]);
  
    //apply filters when click search button
    const handleSearch = async () => {
        try {
  
            if (Object.keys(placesWidgetRef).length !== 0) {
                // console.log(placesWidgetRef)
                setFilterOption(prevState => ({
                    ...prevState,
                    lat: placesWidgetRef.geometry.location.lat(),
                    lng: placesWidgetRef.geometry.location.lng(),
                }))
            }
  
            const listingsRef = collection(db, "listings");
            let q = query(listingsRef);
  
  
  
            if (location) {
                q = query(q, where("cityState.city", "==", location));
            }
  
            if (type) {
                q = query(q, where("type", "==", type));
            }
  
            if (property) {
                q = query(q, where("property", "==", property));
            }
  
            const querySnap = await getDocs(q);
            const listings = [];
  
            querySnap.forEach((doc) => {
                const data = doc.data();
                const price = data.price;
                if (
                    (!bedrooms || data.bedrooms >= parseInt(bedrooms)) &&
                    (price >= priceRange[0] && price <= priceRange[1])
                ) {
                    listings.push({
                        id: doc.id,
                        data,
                    });
                }
            });
  
            setListingLocations(listings);
        } catch (error) {
            console.log(error);
        }
    };
  
    const handleReset = () => {
        setFilterOption({
            searchName: "",
            location: "",
            bedrooms: null,
            priceRange: [0, 4000000],
            type: null,
            lat: 49.09996035,
            lng: -116.516697,
            property: "",
        });
  
        setListingLocations([])
        setZoom(5)
    };
  
    console.log(listingLocations)
    useEffect(() => {
        // Update the zoom level based on the presence of listingLocations
        setZoom(listingLocations.length >= 0 ? 12 : 5);
    }, [listingLocations]);
  
    const { ref } = usePlacesWidget({
        apiKey: process.env.REACT_APP_GEOCODE_API_KEY,
        onPlaceSelected: (place) => {
            // Save the ref for later use
            setFilterOption(prevState => ({
                ...prevState,
                location: place.address_components[0].long_name,
                searchName: place.formatted_address
            }))
  
            setPlacesWidgetRef(place)
  
        },
        options: {
            types: ["locality"],
            componentRestrictions: { country: "ca" },
        },
    });

    // if (loading) {
    //     return <Spinner />
    // }

    return (
        <>
            <div className="searchResult flex h-full relative">
                <div className='hidden md:block mapResult w-full flex-1 h-full sticky top-[47px] left-0'>
                    {listingLocations && (
                        <MapContainer
                            key={`${lat}-${lng}`}
                            center={[lat, lng]}
                            zoom={zoom}
                            style={{ height: 'calc(100vh - 47px)', width: '100%', zIndex: 5 }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {listingLocations.map((listing) => (
                                <Marker
                                    key={listing.id}
                                    position={[listing.data.geolocation.lat, listing.data.geolocation.lng]}
                                    icon={customMarkerIcon}
                                >
                                    <Popup>
                                        <NavLink to={`/listing/${listing.id}`} className="contents text-black">
                                            <div className="propertyInfo flex gap-3">
                                                <img src={listing.data.imgUrls[1]} alt="property" className=" w-32" />
                                                <div className="flex flex-col justify-between">
                                                    <p className="pb-1">For {listing.data.type}</p>
                                                    <p className=" text-base">
                                                        $ {listing.data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                        {listing.data.type === "rent" && " / Month"}
                                                    </p>
                                                    <p>{listing.data.property.toUpperCase()}</p>
                                                    <div className="detail flex pt-2 gap-4">
                                                        <div>
                                                            <FaBed />
                                                            <p >{listing.data.bedrooms}</p>
                                                        </div>
                                                        <div>
                                                            <LiaBathSolid />
                                                            <p>{listing.data.bathrooms}</p>
                                                        </div>
                                                        <div>
                                                            {listing.data.sqFeet &&
                                                                <>
                                                                    < LiaRulerCombinedSolid />
                                                                    <p>{listing.data.sqFeet}</p>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
  
                                                </div>
                                            </div>
                                        </NavLink>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>
                <div className="result flex-1 p-5 pb-16 flex flex-col bg-[#fcfbfd]">
                    <div className="filterOptions bg-white py-5 md:py-10 px-5 shadow-lg rounded-xl">
                        <div className="flex items-center w-full border rounded-xl justify-between px-2 py-1">
                            <MdLocationOn className="text-[#856937] text-2xl" />
                            <input
                                type="text"
                                id="searchName"
                                ref={ref}
                                value={searchName || ''}
                                placeholder='Enter A City'
                                onChange={
                                    (e) => onChange('searchName', e.target.value)
                                }
                                className="text-black w-full border-none focus:ring-0"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-5">
                            <div className='w-full md:w-auto'>
                                <label htmlFor="bedrooms" className="pl-1 pb-1 block">Bedrooms</label>
                                <select
                                    id="bedrooms"
                                    name="bedrooms"
                                    value={bedrooms || ''}
                                    onChange={e => onChange('bedrooms', e.target.value)}
                                    className="w-full border rounded-xl focus:ring-0"
                                >
                                    <option value="">Select Bedrooms</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8+</option>
                                </select>
                            </div>
                            <div className='w-full md:w-auto'>
                                <label htmlFor="property" className="pl-1 pb-1 block">Property</label>
                                <select
                                    id="property"
                                    name="property"
                                    value={property || ''}
                                    onChange={e => onChange('property', e.target.value)}
                                    className="w-full border rounded-xl focus:ring-0"
                                >
                                    <option value="">Select Property Type</option>
                                    <option value="townhouse">Townhouse</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                </select>
                            </div>
                            <div className='w-full md:w-auto'>
                                <label htmlFor="type" className="pl-1 pb-1 block">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={type || ''}
                                    onChange={e => onChange('type', e.target.value)}
                                    className="w-full border rounded-xl focus:ring-0"
                                >
                                    <option value="">Select Type</option>
                                    <option value="rent">Rent</option>
                                    <option value="sales">Sales</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-5">
                            <label>
                                Price Range
                                <span> $ {priceRange[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - $ {priceRange[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                            </label>
                            {type === 'rent' ? (
                                <Slider
                                    range
                                    min={0}
                                    max={5000}
                                    step={1}
                                    id="priceRange"
                                    value={priceRange}
                                    onChange={newValue => onChange('priceRange', newValue)}
                                />
                            ) : (
                                <Slider
                                    range
                                    min={0}
                                    max={4000000}
                                    step={1}
                                    id="priceRange"
                                    value={priceRange}
                                    onChange={newValue => onChange('priceRange', newValue)}
                                />
                            )}
  
                        </div>
                        <div>
                            <button
                                onClick={handleSearch}
                                className="w-full bg-[#856937] p-2 rounded-xl text-white mt-5"
                            >
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                className="w-full bg-[#856937] p-2 rounded-xl text-white mt-5"
                            >
                                Reset
                            </button>
                        </div>
  
                    </div>
  
                    {listingLocations && listingLocations.length > 0 ? (
                        <div className="pt-4">
                            <h3 className="my-5 text-xl font-semibold">Result: {listingLocations.length} {listingLocations.length === 1 ? "listing" : "listings"}</h3>
                            <ul className='gap-3 gap-y-0 grid md:grid-cols-2' >
                                {listingLocations.map(listing => (
                                    <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                                ))}
                            </ul>
                        </div>
                    ) :
                        <p className="pt-4">There is no result for the search</p>
                    }
                </div>
            </div>
        </>
    );
}

export default PropertyListing