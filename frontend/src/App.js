// // Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// import "./Styles/MainStyles.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ItineraryProvider } from "./contexts/ItineraryContext";
import HomePage from "./pages/HomePage";
import HotelPage from "./pages/HotelPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TransportationPage from "./pages/TransportationPage";
import AttractionsPage from "./pages/AttractionsPage";
import SupportPage from "./pages/SupportPage";
import ItineraryPage from "./pages/ItineraryPage";
import ErrorPage from "./pages/404_page";

function App() {
	return (
		<ItineraryProvider>
			<Router>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/hotels" element={<HotelPage />} />
					<Route path="/account" element={<AccountPage />} />{" "}
					{/*this page should be protected*/}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/transportation" element={<TransportationPage />} />
					<Route path="/attractions" element={<AttractionsPage />} />
					<Route path="/supportfaqs" element={<SupportPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/itinerary" element={<ItineraryPage />} />{" "}
					{/*this page should be protected*/}
					<Route path="/404" element={<ErrorPage />} />
				</Routes>
			</Router>
		</ItineraryProvider>
	);
}

export default App;
