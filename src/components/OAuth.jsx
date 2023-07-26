import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useNavigate } from "react-router";


function OAuth() {
  const navigate = useNavigate()

  async function onGoogleClick(){
    try{
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // check if the user is already register with google
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }

      navigate('/')
      
    }catch(error){
      toast.error("Could not authorize with Google!")
      // console.log(error)
    }
  }

  return (
    <button type="button" onClick={onGoogleClick} className="flex items-center justify-center w-full bg-red-500 text-white px-7 py-3 rounded uppercase text-sm font-medium hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out">
        <FcGoogle className="text-2xl bg-white rounded-full mr-2"/>
        Continue with Google
    </button>
  )
}

export default OAuth