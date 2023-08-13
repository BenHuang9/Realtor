import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './pages/Home'
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import CreateListing from "./pages/CreateListing";
import PrivateRouter from "./components/PrivateRouter";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import Category from "./pages/Category";
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import Search from "./pages/Search";

function App() {
  return (
   <>
    <main>
    <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<PrivateRouter />}>
            <Route path="/profile" element={<Profile />} />
          </Route> 
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/advance-search" element={<Search />} />
          <Route path="/listing/:listingId" element={<Listing />} />
          {/* <Route path="/category/:categoryName" element={<Category />}/> */}
          <Route path="/create-listing" element={<PrivateRouter />} >
            <Route path="/create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/edit-listing" element={<PrivateRouter />} >
            <Route path="/edit-listing/:listingId" element={<EditListing />} />
          </Route>
        </Routes>
    </Router>
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
    </main>
   </>
  )
}

export default App;

