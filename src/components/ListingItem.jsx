import React from 'react'
import { NavLink } from 'react-router-dom'
import Moment from 'react-moment'
import { MdLocationOn, MdEdit } from "react-icons/md"
import { FaTrash } from "react-icons/fa"

function ListingItem({listing, id, onEdit, onDelete}) {
  return (
    <li className="bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-200 ease-in-out m-[10px] relative">
        <NavLink to={`/category/${listing.type}/${id}`} className="contents"> 
            <img 
                src={listing.imgUrls[0]} 
                loading="lazy" 
                className='h-[170px] w-full object-cover hover:scale-105 transition duration-200 ease-in'
            />
            <Moment fromNow className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
             {listing.timestamp?.toDate()}
            </Moment>
            <div className="w-full p-[10px]">
                <div className="flex items-center space-x-1">
                    <MdLocationOn className="h-4 w-4 text-green-600"/>
                    <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate">{listing.address}</p>
                </div>
                <p className="font-semibold m-0 text-xl truncate">{listing.name}</p>
                <p className="text-[#457b9b] mt-2 font-semibold">
                    $
                    {listing.offer 
                    ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    {listing.type === "rent" && " / Month"}
                </p>
                <div className="flex items-center mt-[10px] space-x-3">
                    <div className="flex items-center space-x-1">
                        <p className="font-bold text-xs">{listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}</p>
                    </div>
                    <div>
                        <p className="font-bold text-xs">{listing.bathrooms > 1 ? `${listing.bedrooms} Bathrooms` : "1 Bathroom"}</p>
                    </div>
                </div>
            </div>
        </NavLink>
        {onDelete && (
            <FaTrash 
            onClick={()=>onDelete(listing.id)}
            className="absolute bottom-2 right-2 z-10 h-[14px] cursor-pointer text-red-500"/> 
        )}
          {onEdit && (
            <MdEdit 
            onClick={()=>onEdit(listing.id)}
            className="absolute bottom-2 right-7 z-10 h-4 cursor-pointer"/>
            
        )}
    </li>
  )
}

export default ListingItem