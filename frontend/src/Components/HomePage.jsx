import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/HomePage.css";
import logo from "../assets/dreamcation-logo.png";

const HomePage = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [selectedDestination, setSelectedDestination] = useState("");
	const [checkInDate, setCheckInDate] = useState("");
	const [checkOutDate, setCheckOutDate] = useState("");
	const [guests, setGuests] = useState(2);
	const navigate = useNavigate();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (selectedDestination && checkInDate && checkOutDate) {
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
			{/* Navigation */}
			<nav className="navbar">
				<div className="nav-container">
					<div className="nav-logo">
						<img src={logo} width={60} height={40} alt="logo" />
						<h2>DreamCation</h2>
					</div>
					<div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
						<Link to="/" className="nav-link">
							Home
						</Link>
						<a href="#destinations" className="nav-link">
							Destinations
						</a>
						<Link to="/hotels" className="nav-link">
							Hotels
						</Link>
						<a href="#about" className="nav-link">
							About
						</a>
						<a href="#contact" className="nav-link">
							Contact
						</a>
					</div>
					<div className="nav-toggle" onClick={toggleMenu}>
						<span className="bar"></span>
						<span className="bar"></span>
						<span className="bar"></span>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section id="home" className="hero">
				<div className="hero-content">
					<div className="hero-text">
						<h1 className="hero-title">
							Discover Your Perfect
							<span className="highlight"> Dream Destination</span>
						</h1>
						<p className="hero-subtitle">
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

						{/* <div className="hero-buttons">
              <button className="btn btn-primary">Explore Destinations</button>
              <Link to="/hotels" className="btn btn-secondary">
                Find Hotels
              </Link>
            </div> */}
					</div>
					{/* <div className="hero-image">
            <div className="hero-card">
              <div className="card-image"></div>
              <div className="card-content">
                <h3>Popular Destination</h3>
                <p>Bali, Indonesia</p>
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-text">4.8/5</span>
                </div>
              </div>
            </div>
          </div> */}
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

			{/* Destinations Preview */}
			<section id="destinations" className="destinations">
				<div className="container">
					<h2 className="section-title">Popular Destinations</h2>
					<div className="destinations-grid">
						{/* <div className="destination-card">
              <div className="destination-image bali"></div>
              <div className="destination-content">
                <h3>Bali, Indonesia</h3>
                <p>Paradise island with stunning beaches and rich culture</p>
                <div className="destination-meta">
                  <span className="price">From $899</span>
                  <span className="duration">7 nights</span>
                </div>
              </div>
            </div> */}
						{/* <div className="destination-card">
              <div className="destination-image santorini"></div>
              <div className="destination-content">
                <h3>Santorini, Greece</h3>
                <p>Breathtaking sunsets and white-washed architecture</p>
                <div className="destination-meta">
                  <span className="price">From $1,299</span>
                  <span className="duration">5 nights</span>
                </div>
              </div>
            </div> */}
						{/* <div className="destination-card">
              <div className="destination-image maldives"></div>
              <div className="destination-content">
                <h3>Maldives</h3>
                <p>Crystal clear waters and overwater bungalows</p>
                <div className="destination-meta">
                  <span className="price">From $2,199</span>
                  <span className="duration">6 nights</span>
                </div>
              </div>
            </div> */}
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

			{/* Footer */}
			<footer className="footer">
				<div className="container">
					<div className="footer-content">
						<div className="footer-section">
							<h3>DreamCation</h3>
							<p>
								Making your travel dreams come true, one destination at a time.
							</p>
						</div>
						<div className="footer-section">
							<h4>Quick Links</h4>
							<ul>
								<li>
									<Link to="/">Home</Link>
								</li>
								<li>
									<a href="#destinations">Destinations</a>
								</li>
								<li>
									<Link to="/hotels">Hotels</Link>
								</li>
								<li>
									<a href="#about">About</a>
								</li>
							</ul>
						</div>
						<div className="footer-section">
							<h4>Support</h4>
							<ul>
								<li>
									<a href="#contact">Contact Us</a>
								</li>
								<li>
									<a href="#help">Help Center</a>
								</li>
								<li>
									<a href="#faq">FAQ</a>
								</li>
								<li>
									<a href="#terms">Terms & Conditions</a>
								</li>
							</ul>
						</div>
						<div className="footer-section">
							<h4>Follow Us</h4>
							<div className="social-links">
								<a href="#" className="social-link">
									📘
								</a>
								<a href="#" className="social-link">
									📷
								</a>
								<a href="#" className="social-link">
									🐦
								</a>
								<a href="#" className="social-link">
									📺
								</a>
							</div>
						</div>
					</div>
					<div className="footer-bottom">
						<p>&copy; 2024 DreamCation. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
