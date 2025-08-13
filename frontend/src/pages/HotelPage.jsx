import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/HotelPage.css";

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
				`http://localhost:8000/api/hotels?city=${encodeURIComponent(city.trim())}&page=${page}&limit=10`
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
			const hotels = Array.isArray(data.hotels) ? data.hotels : (Array.isArray(data) ? data : []);
			const paginationInfo = data.pagination || null;

			if (isFirstPage) {
				setHotels(hotels);
				setPagination(paginationInfo);
			} else {
				setHotels(prevHotels => [...prevHotels, ...hotels]);
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
				`http://localhost:8000/api/hotels?city=${encodeURIComponent(cityName.trim())}&page=1&limit=10`
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
			const hotels = Array.isArray(data.hotels) ? data.hotels : (Array.isArray(data) ? data : []);
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
		<div className="base">
			<NavBar />
			<div className="hotel-page">
				<div className="back-link">
					<Link to="/" className="back-button">
						← Back to Home
					</Link>
				</div>

				<h1>Hotel Finder</h1>
				<p className="subtitle">Discover the perfect place to stay in your destination</p>

				<div className="search-bar">
					<input
						value={city}
						onChange={(e) => setCity(e.target.value)}
						placeholder="Enter city name (e.g., New York, London, Tokyo)"
						onKeyDown={handleKeyDown}
						className="search-input"
					/>
					<button
						onClick={fetchHotelsByCity}
						className="search-button"
						disabled={loading}
					>
						{loading ? "Searching..." : "Search"}
					</button>
				</div>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				{loading && (
					<div className="loading">
						<div className="loading-spinner"></div>
						<p>Searching for hotels...</p>
					</div>
				)}

				{!loading && hotels.length > 0 && (
					<div className="results-section">
						<div className="results-header">
							<h2>Found {pagination?.totalHotels || hotels.length} hotels</h2>
							{pagination && pagination.showing && (
								<p className="pagination-info">
									Showing {pagination.showing}
								</p>
							)}
						</div>
						<ul className="hotel-list">
							{hotels.map((hotel) => (
								<li key={hotel.place_id} className="hotel-item">
									<div className="hotel-info">
										<h3 className="hotel-name">{hotel.name}</h3>
										<p className="hotel-location">{hotel.vicinity}</p>
										<div className="hotel-details">
											{hotel.rating && (
												<span className="hotel-rating">
													⭐ {hotel.rating.toFixed(1)}
												</span>
											)}
											{hotel.price_level && (
												<span className="hotel-price">
													{'💰'.repeat(hotel.price_level)}
												</span>
											)}
										</div>
									</div>
									<div className="hotel-actions">
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
								</li>
							))}
						</ul>

						{loadingMore && (
							<div className="loading-more">
								<div className="loading-spinner"></div>
								<p>Loading more hotels...</p>
							</div>
						)}

						{pagination && pagination.hasMore && !loadingMore && (
							<div className="load-more-section">
								<button
									onClick={handleLoadMore}
									className="load-more-button"
								>
									Show More Hotels
								</button>
							</div>
						)}
					</div>
				)}

				{!loading && !error && hotels.length === 0 && hasSearched && (
					<div className="no-results">
						<p>No hotels found for "{city}". Try searching for a different city.</p>
					</div>
				)}
			</div>
			<Footer />
		</div>
	);
};

export default HotelPage;
