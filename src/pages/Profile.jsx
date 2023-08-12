import { getAuth, updateProfile } from 'firebase/auth'
import { collection, doc, getDocs, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { toast } from 'react-toastify'
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'
import { Tab } from '@headlessui/react'
import { GiFamilyHouse } from "react-icons/gi"
import { MdManageAccounts } from "react-icons/md"
import { AiOutlinePlus } from "react-icons/ai"
function Profile() {

  const auth = getAuth()
  const navigate = useNavigate()
  const [changeDetail, setChangeDetail] = useState(false)
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  })

  // Code below is the same as formData.type, formData.email
  const { name, email } = formData

  function onChange(e) {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        // update display name in firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      // update name in the firestore database
      const docRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(docRef, {
        name: name,
      })

      toast.success("Profile is Updated.")
    } catch (error) {
      toast.error("Could not update the profile Detail")
    }
  }

  useEffect(() => {
    async function fetchUserListing() {

      const listingRef = collection(db, 'listings')
      //make a query to only show the collection listings where the userRef === current user id
      const q = query(
        listingRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy("timestamp", "desc")
      )

      const querySnap = await getDocs(q)
      let listings = []
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })
      setListings(listings)
      setLoading(false)
    }

    // when the page is loaded, then run this function
    fetchUserListing();
  }, [auth.currentUser.uid])

  async function onDelete(listingID) {
    if (window.confirm("Are you sure you want to delete this listing?")) {

      await deleteDoc(doc(db, "listings", listingID))
      // filter and keep every listing excepting the one with listingID
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingID
      )
      setListings(updatedListings)
      toast.success("Successfully deleted the listing")
    }
  }

  function onEdit(listingID) {

    navigate(`/edit-listing/${listingID}`)
  }

  return (
    <>
      <section className="profile">
        <div className="profile-Wrapper lg:flex max-w-[1440px] mx-auto p-8">
          <Tab.Group>
            <Tab.List className="profile-list flex basis-1/6 lg:flex-col text-xl mt-6">
              <Tab className="text-left flex items-center gap-2 mb-6 px-8 focus:ring-0">
                <GiFamilyHouse />
                <span className="hidden md:block">Listings</span>
              </Tab>

              <Tab className="text-left flex items-center gap-2 mb-6 px-8 focus:ring-0">
                <MdManageAccounts />
                <span className="hidden md:block">Account</span>
              </Tab>
            </Tab.List>

            <Tab.Panels className="basis-4/6 ml-auto mt-6 ">
              <Tab.Panel>
                <div className="max-w-6xl px-3 mx-auto">

                  <div className="border-b pb-5 flex justify-between">
                    <h2 className="text-4xl font-semibold flex items-center gap-2">
                      <GiFamilyHouse />
                      My Listings
                    </h2>

                  </div>
                  <ul className="grid md:grid-cols-2 mt-6 mb-6 gap-5">
                    <li className="mb-4 border-2 border-dashed text-gray-400 flex justify-center items-center hover:border-black hover:text-black transition duration-200 ease-in-out">
                      <button type="submit" className="w-full h-[100px] lg:h-full uppercase px-7 py-3 text-sm font-medium">

                        <NavLink to="/create-listing" className="w-full h-full flex justify-center items-center gap-2">
                          <AiOutlinePlus />
                          Sell or rent your home
                        </NavLink>
                      </button>
                    </li>
                    {!loading && listings.length > 0 && (
                      <>
                        {listings.map((listing) => (
                          <ListingItem
                            key={listing.id}
                            id={listing.id}
                            listing={listing.data}
                            onDelete={() => onDelete(listing.id)} //trigger a function get the listing id, and know which one to delete
                            onEdit={() => onEdit(listing.id)} //trigger a function get the listing id, and know which one to edit
                          />

                        ))}
                      </>
                    )}
                  </ul>

                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="max-w-6xl px-3 mx-auto">
                  <h2 className="text-4xl font-semibold flex items-center gap-2 border-b pb-5">
                    <MdManageAccounts />
                    Account
                  </h2>
                  <h3 className="text-2xl py-5">
                    Account Profile
                  </h3>
                  <form className="w-full md:w-[50%]">
                    <div className='border border-gray-300 rounded py-2 px-5 mb-6 border-s-4 border-s-[#D8C095]'>
                      <label>Name</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        disabled={!changeDetail}
                        onChange={onChange}
                        className="w-full text-xl p-0 text-gray-700 bg-white border-none focus:ring-0"
                      />
                    </div>

                    <div className='border border-gray-300 rounded py-2 px-5 mb-6 border-s-4 border-s-[#D8C095]'>
                      <label>Email</label>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        disabled={!changeDetail}
                        className="w-full text-xl p-0 text-gray-700 bg-white border-none focus:ring-0 "
                      />
                    </div>


                    <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6 text-center">
                      <span
                        onClick={() => {
                          changeDetail && onSubmit()
                          setChangeDetail(prevState => !prevState)
                        }}
                        className="w-full bg-[#BF974F] text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md transition duration-200 ease-in-out hover:shadow-lg cursor-pointer">
                        {changeDetail ? "Apply Change" : "Edit"}
                      </span>
                    </div>
                  </form>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </section>
    </>
  )
}

export default Profile