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
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: "rent",
        property: "condo",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: true,
        furnished: false,
        sqFeet: null,
        address: "",
        description: "",
        price: 0,
        images: [],
        geolocation: { lat: 0, lng: 0 },
        cityState: { city: "", state: "" }
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
        sqFeet,
        address,
        description,
        price,
        images,
        geolocation,
        cityState
    } = formData

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { ref } = usePlacesWidget({
        apiKey: process.env.REACT_APP_GEOCODE_API_KEY,
        onPlaceSelected: (place) => {
            console.log(place);
            console.log(place.formatted_address);
            console.log(place.address_components);
    
            // Find the 'locality' component within address_components
            const localityComponent = place.address_components.find(component =>
                component.types.includes('locality')
            );
    
            // Find the 'administrative_area_level_1' component within address_components
            const stateComponent = place.address_components.find(component =>
                component.types.includes('administrative_area_level_1')
            );
    
            setFormData((prevState) => ({
                ...prevState,
                address: place.formatted_address,
                geolocation: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                },
                cityState: {
                    city: localityComponent ? localityComponent.long_name : '',
                    state: stateComponent ? stateComponent.long_name : ''
                }
            }));
        },
        options: {
            types: ["address"],
            componentRestrictions: { country: "ca" },
        },
    });

    console.log(geolocation)
    console.log(cityState)

    function onChange(e) {
        const { id, value, files } = e.target;
        let newValue;

        switch (id) {
            case 'bedrooms':
            case 'bathrooms':
            case 'price':
            case 'sqFeet':
                newValue = parseInt(value, 10);
                break;
            default:
                newValue = value === 'true' ? true : value === 'false' ? false : value;
                break;
        }

        if (files) {
            const newImages = [...images, ...files];
            setFormData({
                ...formData,
                images: newImages,
            });
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [id]: newValue
            }));
        }
    }

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

    async function submitListing(e) {
        e.preventDefault()

        if (formData.images.length === 0) {
            toast.error('Please select at least one image.');
            return;
        }

        setLoading(true)

        //check if images are more than 6 not working
        if (images.length > 6) {
            setLoading(false)
            toast.error("Only 6 images is allowed!")
            return
        }



        async function storeImage(image) {
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
                            //no default
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
        const docRef = await addDoc(collection(db, "listings"), formDataCopy)
        setLoading(false)
        toast.success("Listing created.")
        // navigate(`/category/${formDataCopy.type}/${docRef.id}`)
        navigate(`/listing/${docRef.id}`)
    }

    // if loading is true, trigger the spinner component
    if (loading) {
        return <Spinner />
    }


    return (
        <section className="px-2 mx-auto">
            <div className="createList-Wrapper max-w-[1440px] mx-auto p-8">
                <h1 className="text-3xl mt-6 font-bold">Create a Listing</h1>
                <form>
                    <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            id="type"
                            value="sales"
                            onClick={onChange}
                            className={`mr-3 p-7 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out w-full ${type === "sales" ? "bg-[#856937] text-white" : "bg-white text-black"}`}>
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
                        {type === "sales" &&
                            <div>
                                <p className="text-lg font-semibold">House Size (ft<sup>2</sup>)</p>
                                <input
                                    type="number"
                                    id="sqFeet"
                                    value={sqFeet}
                                    onChange={onChange}
                                    className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 text-center"
                                />
                            </div>
                        }
                    </div>
                    <div className="parking">
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
                    </div>
                    <div className="furnished">
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
                    </div>
                    <div className="address">
                        <div className="mb-6">
                            <p className="text-lg mt-6 font-semibold">Address</p>
                            <input
                                ref={ref}
                                type="text"
                                id="address"
                                value={address}
                                onChange={onChange}
                                className="w-[50%] px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="description">
                        <p className="text-lg font-semibold">Description</p>
                        <textarea
                            type="text"
                            id="description"
                            value={description}
                            onChange={onChange}
                            placeholder="Description"
                            required
                            className="w-[50%] px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-200 ease-in-out focus:text-gray-700 focus:bg-white focus:border-[#856937] focus:ring-0 mb-6"
                        />
                    </div>
                    <div className="price">
                        <div className="flex items-center mb-6">
                            <div>
                                <p className="text-lg font-semibold">Price</p>
                                <div className="flex w-full justify-center items-center space-x-6">
                                    <input
                                        type="number"
                                        id="price"
                                        value={price}
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
                    </div>

                    <div className="mb-6 images">
                        <p className="text-lg font-semibold">Images</p>
                        <div className="py-2">
                            <label
                                htmlFor="images"
                                onDragOver={handleDragOver}
                                onDrop={(event) => handleDrop(event)}
                                onDragLeave={handleDragLeave}
                                className={`${dragging ? "border-black" : " "} flex flex-col justify-center items-center border border-dashed hover:border-black rounded h-[10rem] cursor-pointer text-xl `}>
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

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-6">
                            {formData.images.map((file, index) => (
                                <div key={index} className="uploadImg">
                                    <img src={URL.createObjectURL(file)} alt={`Uploaded ${index}`} className="h-full object-cover" />
                                    <button type="button" onClick={() => handleImageDelete(index)}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" onClick={submitListing} className="mb-6 w-full px-7 py-3 bg-[#BF974F] text-white font-medium text-sm uppercase rounded shadow-md hover:bg-[#856937] hover:shadow-lg  active:shadow-xl transition duration-200 ease-in-out">Create Listing</button>
                </form>
            </div>
        </section>
    )
}

export default CreateListing