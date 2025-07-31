// // Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// // Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage";
import HotelPage from "./Components/HotelPage";
import AccountPage from "./Components/AccountPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/hotels" element={<HotelPage />} />
				<Route path="/account" element={<AccountPage />} />
			</Routes>
		</Router>
	);
}

export default App;
