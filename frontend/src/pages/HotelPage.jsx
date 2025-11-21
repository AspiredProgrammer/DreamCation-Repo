import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/MainStyles.css";
import { useItinerary } from "../contexts/ItineraryContext";

const HotelPage = () => {
	const { addToItinerary } = useItinerary();
	const [city, setCity] = useState("");
	const [occupants, setOccupants] = useState(2);
	const [checkIn, setCheckIn] = useState("");
	const [checkOut, setCheckOut] = useState("");
	const [hotels, setHotels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [pagination, setPagination] = useState(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	// Set default dates (today and tomorrow)
	useEffect(() => {
		try {
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			const formatDate = (date) => {
				if (!date || isNaN(date.getTime())) {
					// Fallback if date is invalid
					const fallback = new Date();
					const year = fallback.getFullYear();
					const month = String(fallback.getMonth() + 1).padStart(2, '0');
					const day = String(fallback.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
				}
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};

			if (!checkIn) {
				setCheckIn(formatDate(today));
			}
			if (!checkOut) {
				setCheckOut(formatDate(tomorrow));
			}
		} catch (err) {
			console.error("Error setting default dates:", err);
			// Set fallback dates
			const today = new Date().toISOString().split('T')[0];
			const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
			if (!checkIn) setCheckIn(today);
			if (!checkOut) setCheckOut(tomorrow);
		}
	}, []);

	const calculateNights = () => {
		if (!checkIn || !checkOut) return 1;
		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);
		const diffTime = Math.abs(checkOutDate - checkInDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 1;
	};

	const fetchHotelsByCity = async (page = 1) => {
		if (!city.trim()) {
			setError("Please enter a city name");
			return;
		}

		if (!checkIn || !checkOut) {
			setError("Please select check-in and check-out dates");
			return;
		}

		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);
		if (checkOutDate <= checkInDate) {
			setError("Check-out date must be after check-in date");
			return;
		}

		if (occupants < 1 || occupants > 10) {
			setError("Number of occupants must be between 1 and 10");
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

		const nights = calculateNights();

		try {
			const response = await fetch(
				`/api/hotels?city=${encodeURIComponent(
					city.trim()
				)}&occupants=${occupants}&checkIn=${checkIn}&checkOut=${checkOut}&nights=${nights}&page=${page}&limit=10`
			);

			// Check if response is JSON before parsing
			const contentType = response.headers.get("content-type");
			let data;
			
			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				// Response is not JSON (likely HTML error page)
				const text = await response.text();
				console.error("Non-JSON response:", text);
				throw new Error("Server returned an error. Please check the console for details.");
			}

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

		if (!checkIn || !checkOut) {
			setError("Please select check-in and check-out dates");
			return;
		}

		const nights = calculateNights();

		setLoading(true);
		setError("");
		setHasSearched(true);
		try {
			const response = await fetch(
				`/api/hotels?city=${encodeURIComponent(
					cityName.trim()
				)}&occupants=${occupants}&checkIn=${checkIn}&checkOut=${checkOut}&nights=${nights}&page=1&limit=10`
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

								<div className="form-group">
									<label htmlFor="occupants">Number of Occupants</label>
									<input
										type="number"
										id="occupants"
										name="occupants"
										min="1"
										max="10"
										value={occupants || ''}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											if (!isNaN(value) && value >= 1 && value <= 10) {
												setOccupants(value);
											} else if (e.target.value === '') {
												setOccupants(1);
											}
										}}
										required
										autoComplete="off"
									/>
								</div>

								<div className="form-group">
									<label htmlFor="checkIn">Check-In Date</label>
									<input
										type="date"
										id="checkIn"
										name="checkIn"
										value={checkIn || ''}
										onChange={(e) => {
											const value = e.target.value || '';
											setCheckIn(value);
											// If check-in is after check-out, update check-out to day after check-in
											if (value && checkOut && value >= checkOut) {
												const newCheckOut = new Date(value);
												newCheckOut.setDate(newCheckOut.getDate() + 1);
												setCheckOut(newCheckOut.toISOString().split('T')[0]);
											}
										}}
										min={new Date().toISOString().split('T')[0]}
										required
										autoComplete="off"
									/>
								</div>

								<div className="form-group">
									<label htmlFor="checkOut">Check-Out Date</label>
									<input
										type="date"
										id="checkOut"
										name="checkOut"
										value={checkOut || ''}
										onChange={(e) => {
											const selectedDate = e.target.value || '';
											setCheckOut(selectedDate);
											// If check-out is before or equal to check-in, update check-in to day before check-out
											if (selectedDate && checkIn && selectedDate <= checkIn) {
												try {
													const newCheckIn = new Date(selectedDate);
													newCheckIn.setDate(newCheckIn.getDate() - 1);
													if (newCheckIn >= new Date(new Date().setHours(0,0,0,0))) {
														setCheckIn(newCheckIn.toISOString().split('T')[0]);
													}
												} catch (err) {
													console.error("Error updating check-in date:", err);
												}
											}
										}}
										min={checkIn ? (() => {
											try {
												const minDate = new Date(checkIn);
												minDate.setDate(minDate.getDate() + 1);
												return minDate.toISOString().split('T')[0];
											} catch (err) {
												return new Date().toISOString().split('T')[0];
											}
										})() : new Date().toISOString().split('T')[0]}
										required
										autoComplete="off"
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

						{hotels.map((hotel) => {
							const nights = hotel.nights || calculateNights();
							const pricePerNight = hotel.price ? (hotel.price / nights).toFixed(2) : null;
							
							return (
							<div key={hotel.place_id} className="flight-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
									<div style={{ flex: 1 }}>
										<div className="flight-title" style={{ marginBottom: "4px" }}>{hotel.name}</div>
										<p className="flight-meta" style={{ marginBottom: "8px" }}>{hotel.vicinity}</p>
										<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
											{hotel.rating && (
												<span className="hotel-rating" style={{ fontSize: "14px" }}>
													⭐ {hotel.rating.toFixed(1)}
												</span>
											)}
											{hotel.price_level && (
												<span className="hotel-price-level" style={{ fontSize: "14px" }}>
													{"💰".repeat(hotel.price_level)}
												</span>
											)}
										</div>
									</div>
									
									{/* Price Display - Prominently shown on the right */}
									<div style={{ 
										textAlign: "right", 
										minWidth: "120px",
										padding: "8px 12px",
										backgroundColor: "rgba(76, 175, 80, 0.1)",
										borderRadius: "8px",
										border: "1px solid rgba(76, 175, 80, 0.3)"
									}}>
										{hotel.price ? (
											<>
												<div style={{ fontSize: "28px", fontWeight: "bold", color: "#4CAF50", lineHeight: "1.2" }}>
													${hotel.price.toFixed(2)}
												</div>
												<div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", marginTop: "4px" }}>
													${pricePerNight}/night
												</div>
												<div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
													{nights} night{nights !== 1 ? 's' : ''} • {occupants} guest{occupants !== 1 ? 's' : ''}
												</div>
											</>
										) : (
											<div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
												Price not available
											</div>
										)}
									</div>
								</div>
								<div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
									{hotel.url && (
										<a
											href={hotel.url}
											target="_blank"
											rel="noopener noreferrer"
											className="hotel-link"
											style={{ 
												padding: "8px 16px",
												textDecoration: "none",
												borderRadius: "4px",
												fontSize: "14px"
											}}
										>
											View on Google Maps
										</a>
									)}
									<button
										onClick={() => addToItinerary({
											itemType: 'hotel',
											itemId: hotel.place_id,
											itemData: {
												name: hotel.name,
												vicinity: hotel.vicinity,
												rating: hotel.rating,
												placeId: hotel.place_id,
												url: hotel.url,
												price: hotel.price,
												pricePerNight: pricePerNight,
												checkIn: checkIn,
												checkOut: checkOut,
												occupants: occupants,
												nights: nights,
											},
										})}
										className="btn btn-primary"
										style={{ flex: "1", minWidth: "150px" }}
									>
										Save to Itinerary
									</button>
								</div>
							</div>
							);
						})}

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
