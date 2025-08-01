import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

// import "../Styles/HotelPage.css";
// TODO show 10 results then a button to show more
const HotelPage = () => {
	const [city, setCity] = useState("");
	const [hotels, setHotels] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchHotelsByCity = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`http://localhost:8000/api/hotels?city=${city}`
			);
			if (!response.ok) {
				throw new Error("City not found or server error");
			}

			const data = await response.json();
			setHotels(data || []);
		} catch (err) {
			console.error("Error:", err);
			setHotels([]);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			fetchHotelsByCity();
		}
	};
	// using use Effect, grab the city from the url and fetch hotel data with that data
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.href);
		console.log(searchParams);
		const queriedCity = searchParams.get("city");
		console.log(queriedCity);
		if (queriedCity !== "") {
			setCity(queriedCity);
			fetchHotelsByCity();
		}
	}, []);

	return (
		<div className="base">
			{/* <NavBar /> */}
			<div style={{ margin: "20px" }}>
				<Link
					to="/"
					style={{
						textDecoration: "none",
						color: "#667eea",
						fontWeight: "bold",
						fontSize: "16px",
					}}
				>
					← Back to Home
				</Link>
			</div>
			<section id="hotel" className="main-box">
				<div className="content">
					<div>
						<h1 className="main-title">Hotel Finder</h1>
						<input
							value={city}
							onChange={(e) => setCity(e.target.value)}
							placeholder="Enter city"
							style={{ padding: "8px", marginRight: "10px" }}
							onKeyDown={handleKeyDown}
						/>
						<button onClick={fetchHotelsByCity} style={{ padding: "8px 12px" }}>
							Search
						</button>

						{loading ? (
							<p>Loading...</p>
						) : (
							<ul style={{ listStyle: "none", padding: 0 }}>
								{hotels.map((hotel) => (
									<li
										key={hotel.place_id}
										style={{
											marginBottom: "15px",
											padding: "10px",
											border: "1px solid #ccc",
											borderRadius: "8px",
										}}
									>
										<strong>{hotel.name}</strong>
										<br />
										{hotel.vicinity}
										<br />
										{hotel.url && (
											<a
												href={hotel.url}
												target="_blank"
												rel="noopener noreferrer"
											>
												View on Google Maps
											</a>
										)}
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default HotelPage;
