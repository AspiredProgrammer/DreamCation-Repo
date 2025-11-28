import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/MainStyles.css";
import { useItinerary } from "../contexts/ItineraryContext";
import { apiUrl } from "../config/api";

const HotelPage = () => {
	const { addToItinerary } = useItinerary();
	const [city, setCity] = useState("");
	const [occupants, setOccupants] = useState(2);
	const [checkIn, setCheckIn] = useState("");
	const [checkOut, setCheckOut] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [sortBy, setSortBy] = useState("priceLow"); // priceLow, priceHigh
	const [currentPage, setCurrentPage] = useState(1);
	const [allHotels, setAllHotels] = useState([]); // Store all hotels for client-side pagination
	const hotelsPerPage = 10;

	// Read URL parameters and set defaults - check URL params first, then defaults
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const queriedCity = searchParams.get("city");
		const queriedCheckIn = searchParams.get("checkIn");
		const queriedCheckOut = searchParams.get("checkOut");
		const queriedOccupants = searchParams.get("occupants");

		// Set city if provided in URL
		if (queriedCity) {
			setCity(queriedCity);
		}

		// Set dates from URL if provided, otherwise use defaults
		if (queriedCheckIn) {
			setCheckIn(queriedCheckIn);
		} else {
			// Set default check-in (today) only if not in URL
			const today = new Date();
			const formatDate = (date) => {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};
			if (!checkIn) {
				setCheckIn(formatDate(today));
			}
		}

		if (queriedCheckOut) {
			setCheckOut(queriedCheckOut);
		} else {
			// Set default check-out (tomorrow) only if not in URL
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			const formatDate = (date) => {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};
			if (!checkOut) {
				setCheckOut(formatDate(tomorrow));
			}
		}

		// Set occupants from URL if provided
		if (queriedOccupants) {
			const numOccupants = parseInt(queriedOccupants, 10);
			if (!isNaN(numOccupants) && numOccupants >= 1 && numOccupants <= 10) {
				setOccupants(numOccupants);
			}
		}

		// Auto-fetch hotels when city is passed via URL
		// Use dates from URL directly
		if (queriedCity && queriedCheckIn && queriedCheckOut) {
			setTimeout(() => {
				// Pass dates directly from URL params
				const datesToUse = {
					checkIn: queriedCheckIn,
					checkOut: queriedCheckOut,
					occupants: queriedOccupants ? parseInt(queriedOccupants, 10) : 2
				};
				fetchHotelsForCity(queriedCity, datesToUse);
			}, 300); // Wait for state updates to complete
		} else if (queriedCity) {
			// City provided but dates missing - wait a bit longer for default dates to be set
			setTimeout(() => {
				fetchHotelsForCity(queriedCity);
			}, 500);
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

	const fetchHotelsByCity = async () => {
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

		setLoading(true);
		setError("");
		setCurrentPage(1); // Reset to first page on new search

		try {
			const numOccupants = Math.max(1, Math.min(10, parseInt(occupants, 10) || 2));
			const cityName = city.trim();

			const params = new URLSearchParams({
				city: cityName,
				checkIn: checkIn,
				checkOut: checkOut,
				occupants: numOccupants.toString(),
			});

			const response = await fetch(apiUrl(`/api/hotels?${params.toString()}`));

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

			// Get all hotels from response
			const allHotelsData = Array.isArray(data.hotels)
				? data.hotels
				: Array.isArray(data)
					? data
					: [];

			// Store all hotels for client-side pagination and sorting
			setAllHotels(allHotelsData);

			if (allHotelsData.length === 0) {
				setError("No hotels found for this city");
			}
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Failed to fetch hotels. Please try again.");
			setAllHotels([]);
		} finally {
			setLoading(false);
			setHasSearched(true);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			fetchHotelsByCity();
		}
	};


	// Separate function for fetching hotels with a specific city
	const fetchHotelsForCity = async (cityName, overrideDates = null) => {
		if (!cityName.trim()) {
			setError("Please enter a city name");
			return;
		}

		// Use override dates if provided, otherwise use state
		const checkInToUse = overrideDates?.checkIn || checkIn;
		const checkOutToUse = overrideDates?.checkOut || checkOut;
		const occupantsToUse = overrideDates?.occupants || occupants;

		if (!checkInToUse || !checkOutToUse) {
			setError("Please select check-in and check-out dates");
			return;
		}

		setLoading(true);
		setError("");
		setCurrentPage(1); // Reset to first page on new search

		try {
			const numOccupants = Math.max(1, Math.min(10, parseInt(occupantsToUse, 10) || 2));

			const params = new URLSearchParams({
				city: cityName.trim(),
				checkIn: checkInToUse,
				checkOut: checkOutToUse,
				occupants: numOccupants.toString(),
			});

			const response = await fetch(apiUrl(`/api/hotels?${params.toString()}`));

			// Check if response is JSON before parsing
			const contentType = response.headers.get("content-type");
			let data;

			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				const text = await response.text();
				console.error("Non-JSON response:", text);
				throw new Error("Server returned an error. Please check the console for details.");
			}

			if (!response.ok) {
				if (data.error && data.message) {
					throw new Error(data.message);
				} else {
					throw new Error("Failed to fetch hotels. Please try again.");
				}
			}

			// Get all hotels from response
			const allHotelsData = Array.isArray(data.hotels)
				? data.hotels
				: Array.isArray(data)
					? data
					: [];

			setAllHotels(allHotelsData);
			if (allHotelsData.length === 0) {
				setError("No hotels found for this city");
			}
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Failed to fetch hotels. Please try again.");
			setAllHotels([]);
		} finally {
			setLoading(false);
			setHasSearched(true);
		}
	};

	// Get paginated and sorted hotels - memoized to recalculate when dependencies change
	const displayedHotels = useMemo(() => {
		if (!allHotels || allHotels.length === 0) {
			return [];
		}

		// Helper to get price as number, or Infinity if no price
		const getPrice = (hotel) => {
			const price = hotel.pricePerNight;
			// Only treat null, undefined, or invalid numbers as "no price"
			if (price === null || price === undefined) {
				return Infinity; // Hotels without prices go to the end
			}
			const numPrice = parseFloat(price);
			if (isNaN(numPrice) || numPrice < 0) {
				return Infinity; // Invalid or negative prices treated as no price
			}
			return numPrice;
		};

		// Sort hotels based on selected option
		const sorted = [...allHotels].sort((a, b) => {
			const priceA = getPrice(a);
			const priceB = getPrice(b);

			if (sortBy === "priceHigh") {
				// For high to low, reverse the order, but still put Infinity (no price) at end
				if (priceA === Infinity && priceB === Infinity) return 0;
				if (priceA === Infinity) return 1; // a goes to end
				if (priceB === Infinity) return -1; // b goes to end
				return priceB - priceA; // Normal descending order
			} else {
				// Default: priceLow - ascending order
				return priceA - priceB;
			}
		});

		// Paginate
		const startIndex = (currentPage - 1) * hotelsPerPage;
		const endIndex = startIndex + hotelsPerPage;
		return sorted.slice(startIndex, endIndex);
	}, [allHotels, sortBy, currentPage, hotelsPerPage]);

	const totalPages = Math.ceil(allHotels.length / hotelsPerPage);
	const hasMore = currentPage < totalPages;

	const handleLoadMore = () => {
		if (hasMore) {
			setCurrentPage(prev => prev + 1);
		}
	};


	return (
		<div className="homepage">
			<style>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
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
										disabled={loading}
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
										disabled={loading}
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
										disabled={loading}
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
													if (newCheckIn >= new Date(new Date().setHours(0, 0, 0, 0))) {
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
										disabled={loading}
										required
										autoComplete="off"
									/>
								</div>

								<button
									type="submit"
									className="search-button"
									disabled={loading}
									style={{
										position: "relative",
										opacity: loading ? 0.7 : 1,
										cursor: loading ? "not-allowed" : "pointer"
									}}
								>
									{loading && (
										<span style={{
											display: "inline-block",
											width: "16px",
											height: "16px",
											border: "2px solid rgba(255, 255, 255, 0.3)",
											borderTop: "2px solid white",
											borderRadius: "50%",
											animation: "spin 0.8s linear infinite",
											marginRight: "8px",
											verticalAlign: "middle"
										}}></span>
									)}
									{loading ? "Searching Hotels..." : "🔍 Search Hotels"}
								</button>

								{error && <p className="error-text">{error}</p>}
							</form>
						</div>

						<div className="results-column">

							{allHotels.length === 0 && !loading && hasSearched && (
								<p className="no-results">
									No hotels found for "{city}". Try searching for a different city.
								</p>
							)}

							{loading && (
								<div style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									padding: "60px 20px",
									backgroundColor: "rgba(255, 255, 255, 0.95)",
									borderRadius: "16px",
									marginBottom: "20px"
								}}>
									<div style={{
										width: "50px",
										height: "50px",
										border: "5px solid #f3f3f3",
										borderTop: "5px solid #667eea",
										borderRadius: "50%",
										animation: "spin 1s linear infinite",
										marginBottom: "20px"
									}}></div>
									<p style={{
										fontSize: "18px",
										fontWeight: "600",
										color: "#1a1a1a",
										margin: "0 0 8px 0"
									}}>
										Searching for hotels...
									</p>
									<p style={{
										fontSize: "14px",
										color: "#666",
										margin: "0"
									}}>
										This may take a few seconds
									</p>
								</div>
							)}

							{displayedHotels.map((hotel) => {
								// Always use backend's nights value - it's calculated from checkIn/checkOut dates
								const nights = hotel.nights || calculateNights();
								// Backend sends pricePerNight - multiply by nights to get total
								const pricePerNight = hotel.pricePerNight || null;
								// Calculate total price = pricePerNight * nights
								const totalPrice = pricePerNight && nights > 0
									? parseFloat((pricePerNight * nights).toFixed(2))
									: null;

								// Remove leading numbers and punctuation from hotel name
								// Handles cases like "1. Hotel Name" or "#1 Hotel Name" or "1 - Hotel Name"
								const cleanHotelName = hotel.name ? hotel.name.replace(/^[\d#\.\-\s]+/, '').trim() : hotel.name;

								return (
									<div
										key={hotel.place_id}
										style={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											borderRadius: "16px",
											padding: "20px",
											marginBottom: "20px",
											boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
											transition: "transform 0.2s ease, box-shadow 0.2s ease",
											display: "flex",
											flexDirection: "column",
											gap: "16px"
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-2px)";
											e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
										}}
									>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
											<div style={{ flex: 1 }}>
												<h3 style={{
													margin: "0 0 8px 0",
													fontSize: "20px",
													fontWeight: "700",
													color: "#1a1a1a",
													lineHeight: "1.3"
												}}>
													{cleanHotelName}
												</h3>
												<p style={{
													margin: "0 0 12px 0",
													color: "#666",
													fontSize: "14px"
												}}>
													📍 {hotel.vicinity}
												</p>
												<div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
													{hotel.rating && (
														<div style={{
															display: "inline-flex",
															alignItems: "center",
															gap: "4px",
															padding: "4px 12px",
															backgroundColor: "#fff3cd",
															borderRadius: "20px",
															fontSize: "13px",
															fontWeight: "600",
															color: "#856404"
														}}>
															⭐ {hotel.rating.toFixed(1)}
														</div>
													)}
													{hotel.price_level && (
														<div style={{
															display: "inline-flex",
															alignItems: "center",
															gap: "4px",
															padding: "4px 12px",
															backgroundColor: "#d4edda",
															borderRadius: "20px",
															fontSize: "13px",
															fontWeight: "600",
															color: "#155724"
														}}>
															{"💰".repeat(hotel.price_level)}
														</div>
													)}
												</div>
											</div>

											{/* Price Display - Prominently shown on the right */}
											<div style={{
												textAlign: "right",
												minWidth: "140px",
												padding: "16px 20px",
												backgroundColor: "#4CAF50",
												borderRadius: "12px",
												boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)"
											}}>
												{totalPrice ? (
													<>
														<div style={{ fontSize: "32px", fontWeight: "bold", color: "white", lineHeight: "1.2" }}>
															${totalPrice.toFixed(2)}
														</div>
														<div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.95)", marginTop: "6px", fontWeight: "500" }}>
															${pricePerNight ? pricePerNight.toFixed(2) : 'N/A'}/night
														</div>
														<div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.85)", marginTop: "4px" }}>
															{nights} night{nights !== 1 ? 's' : ''} • {occupants} guest{occupants !== 1 ? 's' : ''}
														</div>
													</>
												) : (
													<div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.8)", fontStyle: "italic" }}>
														Price not available
													</div>
												)}
											</div>
										</div>
										<div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
											{hotel.url && (() => {
												// Ensure the booking URL includes the correct dates
												let bookingUrl = hotel.url;
												// If URL is from TripAdvisor, update dates in the URL
												if (bookingUrl.includes('tripadvisor') && hotel.checkIn && hotel.checkOut) {
													try {
														// Parse dates to format needed for URL
														const checkInDate = new Date(hotel.checkIn);
														const checkOutDate = new Date(hotel.checkOut);
														const formatDateForUrl = (date) => {
															const year = date.getFullYear();
															const month = String(date.getMonth() + 1).padStart(2, '0');
															const day = String(date.getDate()).padStart(2, '0');
															return `${year}-${month}-${day}`;
														};

														// TripAdvisor URLs use specific date format in query params
														const urlObj = new URL(bookingUrl);
														// Update date parameters - TripAdvisor uses inDay, outDay, inMonth, outMonth, inYear, outYear
														urlObj.searchParams.set('inDay', String(checkInDate.getDate()));
														urlObj.searchParams.set('outDay', String(checkOutDate.getDate()));
														urlObj.searchParams.set('inMonth', String(checkInDate.getMonth() + 1));
														urlObj.searchParams.set('outMonth', String(checkOutDate.getMonth() + 1));
														urlObj.searchParams.set('inYear', String(checkInDate.getFullYear()));
														urlObj.searchParams.set('outYear', String(checkOutDate.getFullYear()));
														urlObj.searchParams.set('adults', occupants.toString());
														bookingUrl = urlObj.toString();
													} catch (e) {
														// If URL parsing fails, use original URL
														console.warn('Failed to update booking URL dates:', e);
													}
												}

												return (
													<a
														href={bookingUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															padding: "14px 28px",
															textDecoration: "none",
															borderRadius: "8px",
															fontSize: "15px",
															fontWeight: "600",
															backgroundColor: "#667eea",
															color: "white",
															display: "inline-flex",
															alignItems: "center",
															gap: "8px",
															transition: "all 0.2s ease",
															flex: "1",
															minWidth: "200px",
															justifyContent: "center",
															boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
														}}
														onMouseEnter={(e) => {
															e.target.style.backgroundColor = "#5568d3";
															e.target.style.transform = "translateY(-1px)";
															e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
														}}
														onMouseLeave={(e) => {
															e.target.style.backgroundColor = "#667eea";
															e.target.style.transform = "translateY(0)";
															e.target.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
														}}
													>
														🔗 View Hotel Site & Book
													</a>
												);
											})()}
											{!hotel.url && (
												<div style={{
													padding: "12px 24px",
													borderRadius: "6px",
													fontSize: "14px",
													backgroundColor: "rgba(255, 255, 255, 0.1)",
													color: "rgba(255, 255, 255, 0.6)",
													textAlign: "center",
													flex: "1",
													minWidth: "200px"
												}}>
													Booking link not available
												</div>
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
														price: totalPrice,
														pricePerNight: pricePerNight,
														checkIn: checkIn,
														checkOut: checkOut,
														occupants: occupants,
														nights: nights,
													},
												})}
												style={{
													flex: "1",
													minWidth: "150px",
													padding: "14px 28px",
													borderRadius: "8px",
													border: "none",
													backgroundColor: "#f59e0b",
													color: "white",
													fontSize: "15px",
													fontWeight: "600",
													cursor: "pointer",
													transition: "all 0.2s ease",
													boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)"
												}}
												onMouseEnter={(e) => {
													e.target.style.backgroundColor = "#d97706";
													e.target.style.transform = "translateY(-1px)";
													e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.4)";
												}}
												onMouseLeave={(e) => {
													e.target.style.backgroundColor = "#f59e0b";
													e.target.style.transform = "translateY(0)";
													e.target.style.boxShadow = "0 2px 8px rgba(245, 158, 11, 0.3)";
												}}
											>
												💾 Save to Itinerary
											</button>
										</div>
									</div>
								);
							})}

							{hasMore && !loading && (
								<button
									onClick={handleLoadMore}
									style={{
										marginTop: "20px",
										padding: "14px 32px",
										borderRadius: "8px",
										border: "none",
										backgroundColor: "#667eea",
										color: "white",
										fontSize: "16px",
										fontWeight: "600",
										cursor: "pointer",
										transition: "all 0.2s ease",
										boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
										width: "100%"
									}}
									onMouseEnter={(e) => {
										e.target.style.backgroundColor = "#5568d3";
										e.target.style.transform = "translateY(-1px)";
										e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
									}}
									onMouseLeave={(e) => {
										e.target.style.backgroundColor = "#667eea";
										e.target.style.transform = "translateY(0)";
										e.target.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
									}}
								>
									Load More Hotels ({allHotels.length - (currentPage * hotelsPerPage)} remaining)
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
