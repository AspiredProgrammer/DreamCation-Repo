// // Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// // Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Styles/MainStyles.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ItineraryProvider } from "./contexts/ItineraryContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import HotelPage from "./pages/HotelPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FlightsPage from "./pages/FlightsPage";
import AttractionsPage from "./pages/AttractionsPage";
import ItineraryPage from "./pages/ItineraryPage";

function App() {
	return (
		<ItineraryProvider>
			<Router>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/hotels" element={<HotelPage />} />
					<Route path="/account" element={<AccountPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/flights" element={<FlightsPage />} />
					<Route path="/attractions" element={<AttractionsPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/itinerary" element={<ItineraryPage />} />
				</Routes>
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
			</Router>
		</ItineraryProvider>
	);
}

export default App;
