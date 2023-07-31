import React, { useEffect, useState } from "react"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, uploadBytesResumable, getDownloadURL, ref as storRef  } from "firebase/storage";
import { } from "firebase/storage";
import { serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"
import { useNavigate, useParams } from 'react-router-dom';
import { usePlacesWidget } from "react-google-autocomplete";

function EditListing() {
    // if use google geolocation with bank card set to true
    const auth = getAuth()
    const navigate = useNavigate()
    const [geolocationEnabled, setGeolocationEnabled] =useState(true)
    const [loading, setLoading] =useState(false)
    const [listing, setListing] =useState(null)

    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: true,
        furnished: false,
        address: "",
        description: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        latitude: 0,
        longitude: 0,
        images: {},
        geolocation: {lat: 0, lng: 0}
    })

    // Code below is the same as formData.type, formData.name
    const {
        type, 
        name, 
        bedrooms, 
        bathrooms, 
        parking, 
        furnished, 
        address, 
        description, 
        offer, 
        regularPrice,
        discountedPrice,
        latitude,
        longitude,
        images,
        geolocation
    } = formData

    const params = useParams();

  useEffect(() => {
    // console.log(listing.userRef)
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You can't edit this listing");
      navigate("/");
    }
  }, [auth.currentUser.uid, listing, navigate]);

  useEffect(() => {
    // setLoading(true);
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing does not exist");
      }
    }
    fetchListing();
  }, [navigate, params.listingId]);


    const { ref } = usePlacesWidget({
        apiKey: process.env.REACT_APP_GEOCODE_API_KEY,
        onPlaceSelected: (place) => {
          console.log(place);
          console.log(place.formatted_address)
          geolocation.lat = place.geometry.location.lat()
          geolocation.lng = place.geometry.location.lng()
          setFormData((prevState) => ({
            ...prevState,
            address: place.formatted_address,
            geolocation,lat: place.geometry.location.lat(),
            geolocation,lng: place.geometry.location.lng(),
        }))
        },
        options: {
          types: ["address"],
          componentRestrictions: { country: "ca" },
          
        },
        
      });

      console.log(geolocation)

    function onChange(e){
        let boolean = null
        if(e.target.value === "true"){
            boolean = true
        }
        if(e.target.value === "false"){
            boolean = false
        }
        if(e.target.files){
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }
        if(!e.target.files){
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value  //explanation at 8:24 on Youtube
            }))
        }
    }

    console.log(images)

    async function onSubmit(e){
        e.preventDefault()
        setLoading(true)

        if(discountedPrice >= regularPrice){
            setLoading(false)
            toast.error("Discount price needs to be less than regular price.")
            return
        }

        //check if images are more than 6 not working
        if(images.length > 6){
            setLoading(false)
            toast.error("Only 6 images is allowed!")
            return
        }
        


        async function storeImage(image){
            return new Promise((resolve, reject) => {

                const storage = getStorage();
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = storRef(storage, filename)
                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                        }
                    }, 
                    (error) => {
                        // Handle unsuccessful uploads
                        reject(error)
                        console.log(error)
                    }, 
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                    );
           })
        }

        const imgUrls = await Promise.all(
            [...images]
                .map((image) => storeImage(image)))
                .catch((error) => {
                    setLoading(false)
                    toast.error("Images not uploaded")
                    console.log(error)
                    return
            }
        )

        const formDataCopy = {
            ...formData,
            imgUrls, //add additional info
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid
        }

        delete formDataCopy.images
        !formDataCopy.offer && delete formDataCopy.discountedPrice
        delete formDataCopy.latitude
        delete formDataCopy.longitude
        const docRef = doc(db, "listings", params.listingId)
        await updateDoc(docRef, formDataCopy)
        setLoading(false)
        toast.success("Listing is updated.")
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

    
    
    // if loading is true, trigger the spinner component
    if(loading){
        return <Spinner />
    }


    return (
        <main className="max-w-md px-2 mx-auto">
            <h1 className="text-3xl text-center mt-6 font-bold">Edit Listing</h1>
            <form onSubmit={onSubmit}>
                <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
                <div className="flex justify-between">
                    <button 
                        type="button" 
                        id="type" 
                        value="sell" 
                        onClick={onChange} 
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        Sell
                    </button>
                    <button 
                        type="button" 
                        id="type" 
                        value="rent" 
                        onClick={onChange} 
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${type === "sell" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        Rent
                    </button>
                </div>
                <p className="text-lg mt-6 font-semibold">Name</p>
                <input 
                    type="text" 
                    id="name" 
                    value={name}  
                    onChange={onChange} 
                    placeholder="name" 
                    maxLength="32" 
                    minLength="10" 
                    required 
                    className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <div className="flex space-x-6 justify-start">
                    <div>
                        <p className="text-lg font-semibold">Bedrooms</p>
                        <input 
                            type="number" 
                            id="bedrooms" 
                            value={bedrooms} 
                            onChange={onChange}
                            min="1"
                            max="50"
                            required
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                        />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">Bathrooms</p>
                        <input 
                            type="number" 
                            id="bathrooms" 
                            value={bathrooms} 
                            onChange={onChange}
                            min="1"
                            max="50"
                            required
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                        />
                    </div>
                </div>
                <p className="text-lg mt-6 font-semibold">Parking Spot</p>
                <div className="flex justify-between">
                    <button 
                        type="button" 
                        id="parking" 
                        value={true} 
                        onClick={onChange} 
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        Yes
                    </button>
                    <button 
                        type="button" 
                        id="parking" 
                        value={false}
                        onClick={onChange} 
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        No
                    </button>
                </div>
                <p className="text-lg mt-6 font-semibold">Furnished</p>
                <div className="flex justify-between">
                    <button 
                        type="button" 
                        id="furnished" 
                        value={true} 
                        onClick={onChange} 
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        Yes
                    </button>
                    <button 
                        type="button" 
                        id="furnished" 
                        value={false}
                        onClick={onChange} 
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        No
                    </button>
                </div>
                <p className="text-lg mt-6 font-semibold">Address</p>
                <input 
                    ref={ref} 
                    style={{ width: "90%" }} 
                    type="text" 
                    id="address" 
                    value={address}  
                    onChange={onChange}
                />

                {!geolocationEnabled && (
                    <div className="flex space-x-6 justify-start mb-6">
                        <div>
                            <p className="text-lg font-semibold">Latitude</p>
                            <input 
                                type="number" 
                                id="latitude" 
                                value={latitude} 
                                onChange={onChange} 
                                required
                                min="-90"
                                max="90"
                                className="w-full px-4 py-2 text-lg text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600"
                            />
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Longitude</p>
                            <input 
                                type="number" 
                                id="longitude" 
                                value={longitude} 
                                onChange={onChange} 
                                required
                                min="-180"
                                max="180"
                                className="w-full px-4 py-2 text-lg text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600"
                            />
                        </div>
                    </div>
                )}
                <p className="text-lg font-semibold">Description</p>
                <textarea 
                    type="text" 
                    id="description" 
                    value={description}  
                    onChange={onChange} 
                    placeholder="Description" 
                    required 
                    className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <p className="text-lg font-semibold">Offer</p>
                <div className="flex justify-between mb-6">
                    <button 
                        type="button" 
                        id="offer" 
                        value={true} 
                        onClick={onChange} 
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        Yes
                    </button>
                    <button 
                        type="button" 
                        id="offer" 
                        value={false}
                        onClick={onChange} 
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>
                        No
                    </button>
                </div>
                <div className="flex items-center mb-6">
                    <div>
                        <p className="text-lg font-semibold">Regular Price</p>
                        <div className="flex w-full justify-center items-center space-x-6">
                            <input 
                                type="number" 
                                id="regularPrice"
                                value={regularPrice}
                                onChange={onChange}
                                min="50"
                                max="40000000"
                                required
                                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                            />
                            {type === "rent" && (
                                <div>
                                    <p className="text-md w-full whitespace-nowrap">$/Month</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                { offer &&
                    <div className="flex items-center mb-6">
                        <div>
                            <p className="text-lg font-semibold">Discount Price</p>
                            <div className="flex w-full justify-center items-center space-x-6">
                                <input 
                                    type="number" 
                                    id="discountedPrice"
                                    value={discountedPrice}
                                    onChange={onChange}
                                    min="50"
                                    max="40000000"
                                    required={offer}
                                    className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                                />
                                {type === "rent" && (
                                    <div>
                                        <p className="text-md w-full whitespace-nowrap">$/Month</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                }
                <div className="mb-6">
                    <p className="text-lg font-semibold">Images</p>
                    <p className="text-gray-600 mb-2"> The first image will be the cover (max 6)</p>
                    <input 
                        type="file" 
                        id="images" 
                        onChange={onChange}
                        accept=".jpg, .png, .jpeg" 
                        multiple   
                        required
                        className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:bg-white focus:border-slate-600"
                    />
                </div>
                <button type="submit" className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-xl transition duration-200 ease-in-out">Edit Listing</button>
            </form>
        </main>
    )
}

export default EditListing