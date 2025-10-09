// // Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// // Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Styles/MainStyles.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HotelPage from "./pages/HotelPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FlightsPage from "./pages/FlightsPage";
import AttractionsPage from "./pages/AttractionsPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/hotels" element={<HotelPage />} />
				<Route path="/account" element={<AccountPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/flights" element={<FlightsPage />} />
				<Route path="/attractions" element={<AttractionsPage />} />
				<Route path="/register" element={<RegisterPage />} />
			</Routes>
		</Router>
	);
}

export default App;
