import React from 'react'
import { NavLink } from 'react-router-dom'
import Moment from 'react-moment'
import { MdLocationOn, MdEdit } from "react-icons/md"
import { FaTrash, FaBed} from "react-icons/fa"
import {  LiaBathSolid, LiaRulerCombinedSolid } from "react-icons/lia"

function ListingItem({listing, id, onEdit, onDelete}) {
  return (
    <li className="bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-200 ease-in-out relative">
        <NavLink to={`/category/${listing.type}/${id}`} className="contents"> 
            <div className="w-full overflow-hidden">
                <img 
                    src={listing.imgUrls[0]} 
                    loading="lazy" 
                    className='h-[200px] w-full object-cover hover:scale-105 transition duration-200 ease-in'
                />
            </div>
           
            {/* <Moment fromNow className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
             {listing.timestamp?.toDate()}
            </Moment> */}
            <p className="absolute top-2 left-2 bg-[#BF974F]  text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
             For {listing.type}
            </p>
            <div className="w-full p-[20px]">
                <div className="flex items-center space-x-1">
                    <MdLocationOn className="text-green-600 text-xl"/>
                    <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate">{listing.address}</p>
                </div>
                <p className="font-semibold my-3 text-xl truncate">{listing.name}</p>
                <div className="flex items-center mt-[10px] gap-5">
                    <div className="flex items-center space-x-1">
                        <FaBed className="text-xl"/>
                        <p className="font-bold text-xs">{listing.bedrooms}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <LiaBathSolid className="text-xl"/>
                        <p className="font-bold text-xs">{listing.bedrooms}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <LiaRulerCombinedSolid className="text-xl"/>
                        <p className="font-bold text-xs">{listing.bedrooms}</p>
                    </div>
                </div>
                <p className="text-[#BF974F] text-xl mt-2 font-semibold">
                    $
                    {listing.offer 
                    ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    {listing.type === "rent" && " / Month"}
                </p>
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