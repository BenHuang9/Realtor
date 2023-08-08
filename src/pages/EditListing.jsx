import React, { useEffect, useState } from "react"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, uploadBytesResumable, getDownloadURL, ref as storRef, deleteObject } from "firebase/storage";
import { } from "firebase/storage";
import { serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"
import { useNavigate, useParams } from 'react-router-dom';
import { usePlacesWidget } from "react-google-autocomplete";

function EditListing() {
    // if use google geolocation with bank card set to true

    const auth = getAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
    const [images, setImages] = useState([])
    const [dragging, setDragging] = useState(false);
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
        imgUrls: [],
        geolocation: { lat: 0, lng: 0 }
    });

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
        imgUrls,
        geolocation
    } = formData;

    const params = useParams();
    useEffect(() => {
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error("You can't edit this listing");
            navigate("/");
        }
    }, [auth.currentUser.uid, listing, navigate]);

    useEffect(() => {
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
            geolocation.lat = place.geometry.location.lat();
            geolocation.lng = place.geometry.location.lng();
            setFormData((prevState) => ({
                ...prevState,
                address: place.formatted_address,
                geolocation: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
            }));
        },
        options: {
            types: ["address"],
            componentRestrictions: { country: "ca" }
        }
    });

    function onChange(e) {
        let boolean = null;
        if (e.target.value === "true") {
            boolean = true;
        }
        if (e.target.value === "false") {
            boolean = false;
        }

        if (e.target.files) {
            const files = e.target.files;
            const newImages = [...images, ...files]; // Combine new files with existing images
            setImages(newImages) // Update the images array in the formData state
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }));
        }
    }

    console.log(images)


    const handleLocalImageDelete = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    }

    const handleStoreImageDelete = async (index) =>{
        const imageUrlToDelete = imgUrls[index];

        try {
            // Delete the image from Firebase storage
            const storage = getStorage();
            const storageRef = storRef(storage, imageUrlToDelete);
            await deleteObject(storageRef);

            // Remove the image URL from the imgUrls array
            const newImgUrls = [...imgUrls];
            newImgUrls.splice(index, 1);

            // Update the state
            setFormData((prevState) => ({
                ...prevState,
                imgUrls: newImgUrls
            }));

            const docRef = doc(db, "listings", params.listingId);
            await updateDoc(docRef, { imgUrls: newImgUrls });
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Error deleting image");
        }
    };

    console.log(imgUrls)

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        const newImages = [...images, ...files]; // Combine new files with existing images
        setImages(newImages) // Update the images array in the formData state
        setDragging(false);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };


    async function submitListing(e) {
        e.preventDefault();
        setLoading(true);

        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error("Discount price needs to be less than regular price.");
            return;
        }

        async function storeImage(image) {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
                const storageRef = storRef(storage, filename);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
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
                        reject(error);
                        console.log(error);
                    },
                    () => {
                        // Handle successful uploads on complete
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            });
        }

        try {
            const imgUrlsToAdd = await Promise.all(images.map((image) => storeImage(image)));

            const formDataCopy = {
                ...formData,
                imgUrls: [...imgUrls, ...imgUrlsToAdd],
                timestamp: serverTimestamp(),
                userRef: auth.currentUser.uid
            };

            delete formDataCopy.images;
            if (!formDataCopy.offer) {
                delete formDataCopy.discountedPrice;
            }

            const docRef = doc(db, "listings", params.listingId);
            await updateDoc(docRef, formDataCopy);

            toast.success("Listing is updated.");
            navigate(`/category/${formDataCopy.type}/${docRef.id}`);
        } catch (error) {
            console.error("Error submitting listing:", error);
            toast.error("Error updating listing");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Spinner />;
    }


    return (
        <section className="px-2 mx-auto">
            <div className="createList-Wrapper max-w-[1440px] mx-auto p-8">
                <h1 className="text-3xl mt-6 font-bold">Edit Listing</h1>
                <form>
                    <h3 className="text-lg mt-6 font-semibold">Sell / Rent</h3>
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
                        <h3 className="text-lg mt-6 font-semibold">Title</h3>
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
                            <h3 className="text-lg font-semibold">Bedrooms</h3>
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
                            <h3 className="text-lg font-semibold">Bathrooms</h3>
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
                    <div className="parking">
                        <h3 className="text-lg mt-6 font-semibold">Parking Spot</h3>
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
                        <h3 className="text-lg mt-6 font-semibold">Furnished</h3>
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
                            <h3 className="text-lg mt-6 font-semibold">Address</h3>
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
                        <h3 className="text-lg font-semibold">Description</h3>
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
                    <div className="offer">
                        <h3 className="text-lg font-semibold">Offer</h3>
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
                    </div>
                    <div className="price">
                        <div className="flex items-center mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Regular Price</h3>
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
                                            <h3 className="text-md w-full whitespace-nowrap">$/Month</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {offer &&
                            <div className="flex items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Discount Price</h3>
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
                                                <h3 className="text-md w-full whitespace-nowrap">$/Month</h3>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                    <div className="mb-6 images">
                        <h3 className="text-lg font-semibold">Images</h3>
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

                        <div className="grid lg:grid-cols-4 gap-5 pb-6">

                            {imgUrls.map((imageUrl, index) => (
                                <div key={index} className="uploadImg">
                                    <img src={imageUrl} alt={`Uploaded ${index}`} className="h-full object-cover" />
                                    <button type="button" onClick={() => handleStoreImageDelete(index)}>Delete</button>
                                </div>
                            ))}

                            {/* Map and display images from the images array */}
                            {images.map((image, index) => (
                                <div key={index} className="uploadImg">
                                    <img src={URL.createObjectURL(image)} alt={`Uploaded ${index}`} className="h-full object-cover" />
                                    <button type="button" onClick={() => handleLocalImageDelete(index)}>Delete</button>
                                </div>
                            ))}

                        </div>
                    </div>
                    <button type="submit" onClick={submitListing} className="mb-6 w-full px-7 py-3 bg-[#BF974F] text-white font-medium text-sm uppercase rounded shadow-md hover:bg-[#856937] hover:shadow-lg  active:shadow-xl transition duration-200 ease-in-out">Update Listing</button>
                </form>
            </div>
        </section>
    )
}

export default EditListing