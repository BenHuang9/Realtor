import React from 'react'
import {FcGoogle} from 'react-icons/fc'
function OAuth() {
  return (
    <button className="flex items-center justify-center w-full bg-red-500 text-white px-7 py-3 rounded uppercase text-sm font-medium hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out">
        <FcGoogle className="text-2xl bg-white rounded-full mr-2"/>
        Continue with Google
    </button>
  )
}

export default OAuth