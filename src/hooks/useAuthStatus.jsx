import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        // if the user is authorized in firebase,we set loggedIn to true
        if (user) {
            setLoggedIn(true);
        }
        // change checking status to false if is log in
        setCheckingStatus(false);
    });
  }, []);
  // return the statement after checking
  return { loggedIn, checkingStatus };
}