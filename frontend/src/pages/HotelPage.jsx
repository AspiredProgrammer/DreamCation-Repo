import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/MainStyles.css";

const HotelPage = () => {
	const [city, setCity] = useState("");
	const [hotels, setHotels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [pagination, setPagination] = useState(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	const fetchHotelsByCity = async (page = 1) => {
		if (!city.trim()) {
			setError("Please enter a city name");
			return;
		}

		const isFirstPage = page === 1;
		if (isFirstPage) {
			setLoading(true);
			setHasSearched(true);
		} else {
			setLoadingMore(true);
		}
		setError("");

		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL
				}/api/hotels?city=${encodeURIComponent(
					city.trim()
				)}&page=${page}&limit=10`
			);

			const data = await response.json();

			if (!response.ok) {
				// Handle API error responses
				if (data.error && data.message) {
					throw new Error(data.message);
				} else {
					throw new Error("Failed to fetch hotels. Please try again.");
				}
			}

			// Handle both new pagination format and old format for backward compatibility
			const hotels = Array.isArray(data.hotels)
				? data.hotels
				: Array.isArray(data)
					? data
					: [];
			const paginationInfo = data.pagination || null;

			if (isFirstPage) {
				setHotels(hotels);
				setPagination(paginationInfo);
			} else {
				setHotels((prevHotels) => [...prevHotels, ...hotels]);
				setPagination(paginationInfo);
			}

			if (hotels.length === 0 && isFirstPage) {
				setError("No hotels found for this city");
			}
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Failed to fetch hotels. Please try again.");
			if (isFirstPage) {
				setHotels([]);
				setPagination(null);
			}
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			fetchHotelsByCity();
		}
	};

	// Fix URL parsing to use search params correctly
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const queriedCity = searchParams.get("city");
		if (queriedCity) {
			setCity(queriedCity);
			// Auto-fetch hotels when city is passed via URL
			setTimeout(() => {
				// Use the queriedCity directly instead of relying on state
				fetchHotelsForCity(queriedCity);
			}, 100);
		}
	}, []);

	// Separate function for fetching hotels with a specific city
	const fetchHotelsForCity = async (cityName) => {
		if (!cityName.trim()) {
			setError("Please enter a city name");
			return;
		}

		setLoading(true);
		setError("");
		setHasSearched(true);
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL
				}/api/hotels?city=${encodeURIComponent(
					cityName.trim()
				)}&page=1&limit=10`
			);

			const data = await response.json();

			if (!response.ok) {
				// Handle API error responses
				if (data.error && data.message) {
					throw new Error(data.message);
				} else {
					throw new Error("Failed to fetch hotels. Please try again.");
				}
			}

			// Handle both new pagination format and old format for backward compatibility
			const hotels = Array.isArray(data.hotels)
				? data.hotels
				: Array.isArray(data)
					? data
					: [];
			const paginationInfo = data.pagination || null;

			setHotels(hotels);
			setPagination(paginationInfo);
			if (hotels.length === 0) {
				setError("No hotels found for this city");
			}
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Failed to fetch hotels. Please try again.");
			setHotels([]);
			setPagination(null);
		} finally {
			setLoading(false);
		}
	};

	const handleLoadMore = () => {
		if (pagination && pagination.hasMore) {
			fetchHotelsByCity(pagination.currentPage + 1);
		}
	};

	return (
		<div className="homepage">
			<NavBar />
			<section className="main-box hotels-page">
				<div className="content">
					<h1 className="main-title">
						Find Your <span className="highlight">Perfect Hotel</span>
					</h1>
					<p className="subtitle">
						Discover the perfect place to stay in your destination.
					</p>

					<div className="flights-layout">
						<div className="search-column">
							<form className="search-form" onSubmit={(e) => { e.preventDefault(); fetchHotelsByCity(); }}>
								<h3>Search Hotels</h3>
								<div className="form-group">
									<label htmlFor="city">Destination City</label>
									<input
										type="text"
										id="city"
										value={city}
										onChange={(e) => setCity(e.target.value)}
										placeholder="e.g., New York, London, Tokyo"
										onKeyDown={handleKeyDown}
										required
									/>
								</div>

								<button type="submit" className="search-button" disabled={loading}>
									{loading ? "Searching..." : "🔍 Search Hotels"}
								</button>

								{error && <p className="error-text">{error}</p>}
							</form>
						</div>

						<div className="results-column">
							{hotels.length === 0 && !loading && hasSearched && (
								<p className="no-results">
									No hotels found for "{city}". Try searching for a different city.
								</p>
							)}

							{hotels.map((hotel) => (
								<div key={hotel.place_id} className="flight-card">
									<div className="flight-title">{hotel.name}</div>
									<p className="flight-meta">{hotel.vicinity}</p>
									<div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
										{hotel.rating && (
											<span className="hotel-rating">
												⭐ {hotel.rating.toFixed(1)}
											</span>
										)}
										{hotel.price_level && (
											<span className="hotel-price-level">
												{"💰".repeat(hotel.price_level)}
											</span>
										)}
									</div>
									{hotel.url && (
										<a
											href={hotel.url}
											target="_blank"
											rel="noopener noreferrer"
											className="hotel-link"
										>
											View on Google Maps
										</a>
									)}
								</div>
							))}

							{loadingMore && (
								<div className="loading-more">
									<div className="loading-spinner"></div>
									<p style={{ margin: "8px 0 0 0", color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
										Loading more hotels...
									</p>
								</div>
							)}

							{pagination && pagination.hasMore && !loadingMore && (
								<button
									onClick={handleLoadMore}
									className="search-button"
									style={{ marginTop: "12px" }}
								>
									Show More Hotels
								</button>
							)}
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default HotelPage;
