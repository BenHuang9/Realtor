import { Outlet, Navigate } from "react-router-dom";
import {useAuthStatus} from "../hooks/useAuthStatus"
import Spinner from "./Spinner";

function PrivateRouter() {
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}

export default PrivateRouter