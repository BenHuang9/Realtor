import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

function Search() {
    const homelocation = useLocation();
    const queryParams = new URLSearchParams(homelocation.search);
    const searchLocationParam = queryParams.get('location');
    const [searchResults, setSearchResults] = useState([]);
    const [filterOption, setFilterOption] = useState({
        location: searchLocationParam,
        bedrooms: null,
        priceRange: [0, 4000000],
        type: null,
    })

    const {
        location,
        bedrooms,
        priceRange,
        type,
    } = filterOption;

    // show result when home page search by location
    useEffect(() => {
        async function fetchListings() {
            try {
                const listingsRef = collection(db, "listings");
                let q = query(listingsRef);

                // Apply filters if criteria are set
                if (location) {
                    q = query(q, where("cityState.city", "==", location));
                } const querySnap = await getDocs(q);
                const listings = [];
                querySnap.forEach((doc) => {
                    listings.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });
                setSearchResults(listings);
            } catch (error) {
                console.log(error);
            }
        }
        fetchListings();
    }, [location]);

        // Update price range when type changes
        useEffect(() => {
            if (type === 'rent') {
                setFilterOption(prevState => ({
                    ...prevState,
                    priceRange: [0, 5000],
                }));
            } else if (type === 'sales') {
                setFilterOption(prevState => ({
                    ...prevState,
                    priceRange: [0, 4000000],
                }));
            }
        }, [type]);

    //apply filters when click search button
    const handleSearch = async () => {
        try {
            const listingsRef = collection(db, "listings");
            let q = query(listingsRef);

            if (location) {
                q = query(q, where("cityState.city", "==", location));
            }

            if (type) {
                q = query(q, where("type", "==", type));
            }

            const querySnap = await getDocs(q);
            const listings = [];

            querySnap.forEach((doc) => {
                const data = doc.data();
                const price = data.price;
                console.log(data.type)
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

            setSearchResults(listings);
        } catch (error) {
            console.log(error);
        }
    };


    function onChange(id, newValue) {
        setFilterOption(prevState => ({
            ...prevState,
            [id]: newValue
        }));
    }


    console.log(type)
    return (
        <>
            <div>
                {/* Filter UI Elements */}
                <div>
                    <label>Search Location</label>
                    <input type="text" id="location" value={location || ''} onChange={(e) => onChange('location', e.target.value)} />
                </div>
                <div>
                    <label>Min Bedrooms</label>
                    <input type="number" id="bedrooms" value={bedrooms || ''} onChange={(e) => onChange('bedrooms', e.target.value)} />
                </div>
                <div>
                    <label>Price Range</label>
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
                    <span>$ {priceRange[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - $ {priceRange[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                </div>
                <div>
                    <label htmlFor="type">Type:</label>
                    <select id="type" name="type" value={type || ''} onChange={e => onChange('type', e.target.value)}>
                        <option value="">All</option>
                        <option value="rent">Rent</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>
            </div>
            <button onClick={handleSearch}>Search</button>
            {searchResults && searchResults.length > 0 && (
                <div className="mx-auto pt-4 space-y-6">
                    <div>
                        <ul className='gap-3 gap-y-0 grid md:grid-cols-2 lg:grid-cols-3 mt-6' >
                            {searchResults.map(listing => (
                                <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

export default Search