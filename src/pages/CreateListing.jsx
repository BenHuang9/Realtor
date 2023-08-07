import React, { useEffect, useState } from "react"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as storRef } from "firebase/storage";
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase'
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"
import { useNavigate } from 'react-router-dom';
import { usePlacesWidget } from "react-google-autocomplete";

function CreateListing() {
    // if use google geolocation with bank card set to true
    const auth = getAuth()
    const navigate = useNavigate()
    const [geolocationEnabled, setGeolocationEnabled] =useState(true)
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] =useState(false)
    const [formData, setFormData] = useState({
        type: "rent",
        property: "condo",
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
        images: [],
        geolocation: {lat: 0, lng: 0}
    })

    // Code below is the same as formData.type, formData.name
    const {
        type, 
        property,
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

    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

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
            const files = e.target.files;
            const newImages = [...images, ...files]; // Add the new files to the array
            setFormData({
                ...formData,
                images: newImages, // Update the images array in the formData state
            });
        }

        if(!e.target.files){
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value  //explanation at 8:24 on Youtube
            }))
        }
    }
    console.log(images)

    const handleImageDelete = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({
          ...formData,
          images: newImages,
        });
      };
    
      const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
      };

       const handleDrop = (event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            const newImages = [...formData.images, ...files];
            setFormData({
            ...formData,
            images: newImages,
            });
            setDragging(false);
        };

        const handleDragLeave = () => {
            setDragging(false);
          };

    async function onSubmit(e){
        e.preventDefault()
        if (formData.images.length === 0) {
            toast.error('Please select at least one image.');
            return;
        }
          
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
        const docRef = await addDoc(collection(db, "listings"), formDataCopy)
        setLoading(false)
        toast.success("Listing created.")
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

   

    
    // if loading is true, trigger the spinner component
    if(loading){
        return <Spinner />
    }


    return (
        <section className="px-2 mx-auto">
            <div className="createList-Wrapper max-w-[1440px] mx-auto p-8">
                <h1 className="text-3xl mt-6 font-bold">Create a Listing</h1>
                <form onSubmit={onSubmit}>
                    <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
                    <div className="flex justify-between">
                        <button 
                            type="button" 
                            id="type" 
                            value="sell" 
                            onClick={onChange} 
                            className={`mr-3 p-7 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${type === "sell" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
                            Sell
                        </button>
                        <button 
                            type="button" 
                            id="type" 
                            value="rent" 
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${type === "rent" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
                            Rent
                        </button>
                    </div>
                    <div>
                        <p className="text-lg mt-6 font-semibold">Property Type</p>
                        <div className="flex justify-between">
                        <button 
                            type="button" 
                            id="property" 
                            value="condo" 
                            onClick={onChange} 
                            className={`mr-3 p-7 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${property === "condo" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
                            Condo
                        </button>
                        <button 
                            type="button" 
                            id="property" 
                            value="house" 
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${property === "house" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
                            House
                        </button>
                        <button 
                            type="button" 
                            id="property" 
                            value="apartment" 
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${property === "apartment" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
                            Apartment
                        </button>
                    </div>
                    </div>
                    <div>
                        <p className="text-lg mt-6 font-semibold">Title</p>
                        <input 
                            type="text" 
                            id="name" 
                            value={name}  
                            onChange={onChange} 
                            placeholder="name" 
                            maxLength="32" 
                            minLength="10" 
                            required 
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 mb-6"
                        />
                    </div>
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
                                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 text-center"
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
                                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 text-center"
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
                            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!parking ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
                            Yes
                        </button>
                        <button 
                            type="button" 
                            id="parking" 
                            value={false}
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${parking ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
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
                            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!furnished ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
                            Yes
                        </button>
                        <button 
                            type="button" 
                            id="furnished" 
                            value={false}
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${furnished ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
                            No
                        </button>
                    </div>
                    <div className="mb-6">
                        <p className="text-lg mt-6 font-semibold">Address</p>
                        <input 
                            ref={ref} 
                            style={{ width: "90%" }} 
                            type="text" 
                            id="address" 
                            value={address}  
                            onChange={onChange}
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0"
                        />
                    </div>
                    

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
                        className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 mb-6"
                    />
                    <p className="text-lg font-semibold">Offer</p>
                    <div className="flex justify-between mb-6">
                        <button 
                            type="button" 
                            id="offer" 
                            value={true} 
                            onClick={onChange} 
                            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${!offer ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
                            Yes
                        </button>
                        <button 
                            type="button" 
                            id="offer" 
                            value={false}
                            onClick={onChange} 
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${offer ? "bg-white text-black" : "bg-[#856937] text-white"}`}>
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
                                    className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 text-center"
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
                                        className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 text-center"
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
                        <div className="py-2">
                            <label 
                                for="images" 
                                onDragOver={handleDragOver}
                                onDrop={(event) => handleDrop(event)}
                                onDragLeave={handleDragLeave}
                                className= {`${dragging ? "border-black" : " "} flex flex-col justify-center items-center border border-dashed hover:border-black rounded h-[10rem] cursor-pointer text-xl `}>
                                + 
                                Click or drag files to upload
                                <span className="text-gray-600 mt-2 text-sm">Maximum up to 6 images</span>
                                <input 
                                    type="file" 
                                    id="images" 
                                    onChange={onChange}
                                    accept=".jpg, .png, .jpeg" 
                                    multiple   
                                    className="hidden"
                                />
                            </label>
                        </div>
                        
                       <div className="grid lg:grid-cols-4 gap-5">
                            {formData.images.map((file, index) => (
                                <div
                                    key={index}
                                    className="uploadImg"
                                >
                                    <img src={URL.createObjectURL(file)} alt={`Uploaded ${index}`} className="h-full object-cover"/>
                                    <button onClick={() => handleImageDelete(index)}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="mb-6 w-full px-7 py-3 bg-[#BF974F] text-white font-medium text-sm uppercase rounded shadow-md hover:bg-[#856937] hover:shadow-lg  active:shadow-xl transition duration-200 ease-in-out">Create Listing</button>
                </form>
            </div>
        </section>
    )
}

export default CreateListing