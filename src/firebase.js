// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxTx1uka5nbFzgl3wwUDMblPQeWfSOoBI",
  authDomain: "realtor-react-97800.firebaseapp.com",
  projectId: "realtor-react-97800",
  storageBucket: "realtor-react-97800.appspot.com",
  messagingSenderId: "947034171147",
  appId: "1:947034171147:web:ef6c6bbdf0e1e13137240e"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()