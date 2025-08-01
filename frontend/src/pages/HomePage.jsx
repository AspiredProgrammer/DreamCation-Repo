import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../Styles/HomePage.css";
import "../Styles/MainStyles.css";

import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

const HomePage = () => {
	const [selectedDestination, setSelectedDestination] = useState("");
	const [checkInDate, setCheckInDate] = useState("");
	const [checkOutDate, setCheckOutDate] = useState("");
	const [guests, setGuests] = useState(2);
	const navigate = useNavigate();

	const handleSearch = (e) => {
		e.preventDefault();
		if (selectedDestination && checkInDate && checkOutDate) {
			//note, add bootstrap to replace default alerts with nice ones
			alert(
				`Searching for ${guests} guests in ${selectedDestination} from ${checkInDate} to ${checkOutDate}`
			);
			// Navigate to hotel page with search parameters
			navigate("/hotels");
		} else {
			alert("Please fill in all required fields");
		}
	};

	const destinations = [
		{ value: "", label: "Select Destination" },
		{ value: "bali", label: "Bali, Indonesia" },
		{ value: "santorini", label: "Santorini, Greece" },
		{ value: "maldives", label: "Maldives" },
		{ value: "paris", label: "Paris, France" },
		{ value: "tokyo", label: "Tokyo, Japan" },
		{ value: "new-york", label: "New York, USA" },
		{ value: "london", label: "London, UK" },
		{ value: "dubai", label: "Dubai, UAE" },
		{ value: "singapore", label: "Singapore" },
		{ value: "bangkok", label: "Bangkok, Thailand" },
		{ value: "sydney", label: "Sydney, Australia" },
	];

	return (
		<div className="homepage">
			<NavBar />

			{/* Hero Section */}
			<section id="home" className="main-box">
				<div className="content">
					<div>
						<h1 className="main-title">
							Discover Your Perfect
							<span className="highlight"> Dream Destination</span>
						</h1>
						<p className="subtitle">
							Explore breathtaking locations, find amazing hotels, and plan your
							next adventure with DreamCation
						</p>

						{/* Search Form */}
						<form className="search-form" onSubmit={handleSearch}>
							<h3>Plan Your Dream Vacation</h3>
							<div className="form-grid">
								<div className="form-group">
									<label htmlFor="destination">Destination</label>
									<select
										id="destination"
										value={selectedDestination}
										onChange={(e) => setSelectedDestination(e.target.value)}
										required
									>
										{destinations.map((dest) => (
											<option key={dest.value} value={dest.value}>
												{dest.label}
											</option>
										))}
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="checkIn">Check-in Date</label>
									<input
										type="date"
										id="checkIn"
										value={checkInDate}
										onChange={(e) => setCheckInDate(e.target.value)}
										min={new Date().toISOString().split("T")[0]}
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="checkOut">Check-out Date</label>
									<input
										type="date"
										id="checkOut"
										value={checkOutDate}
										onChange={(e) => setCheckOutDate(e.target.value)}
										min={checkInDate || new Date().toISOString().split("T")[0]}
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="guests">Guests</label>
									<select
										id="guests"
										value={guests}
										onChange={(e) => setGuests(parseInt(e.target.value))}
									>
										<option value={1}>1 Guest</option>
										<option value={2}>2 Guests</option>
										<option value={3}>3 Guests</option>
										<option value={4}>4 Guests</option>
										<option value={5}>5 Guests</option>
										<option value={6}>6+ Guests</option>
									</select>
								</div>
							</div>

							<button type="submit" className="search-button">
								🔍 Search Hotels
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="features">
				<div className="container">
					<h2 className="section-title">Why Choose DreamCation?</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">🏨</div>
							<h3>Premium Hotels</h3>
							<p>
								Discover handpicked luxury accommodations with world-class
								amenities and exceptional service.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">✈️</div>
							<h3>Easy Booking</h3>
							<p>
								Simple and secure booking process with instant confirmation and
								flexible cancellation options.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">🗺️</div>
							<h3>Curated Destinations</h3>
							<p>
								Explore carefully selected destinations with insider tips and
								local recommendations.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">💎</div>
							<h3>Exclusive Deals</h3>
							<p>
								Access to special deals and exclusive packages not available
								elsewhere.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta">
				<div className="container">
					<div className="cta-content">
						<h2>Ready to Start Your Journey?</h2>
						<p>
							Join thousands of travelers who trust DreamCation for their
							perfect vacation
						</p>
						<button className="btn btn-primary">Start Planning Now</button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default HomePage;
