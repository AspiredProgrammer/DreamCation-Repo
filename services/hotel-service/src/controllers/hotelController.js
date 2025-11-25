require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const fetch = require("node-fetch");

exports.getHotelsByCity = async (req, res, next) => {
	try {
		const { city, page = 1, limit = 10, occupants = 2, checkIn, checkOut, nights } = req.query;

		if (!city || typeof city !== "string" || city.trim().length === 0) {
			return res.status(400).json({
				error: "City parameter is required",
				message: "Please provide a valid city name",
			});
		}

		// Validate required parameters
		if (!checkIn || !checkOut) {
			return res.status(400).json({
				error: "Date parameters are required",
				message: "Please provide check-in and check-out dates",
			});
		}

		// Parse and validate parameters
		const numOccupants = Math.max(1, Math.min(10, parseInt(occupants, 10) || 2));
		const cityName = city.trim();

		// Check for RapidAPI key
		if (!process.env.RAPIDAPI_KEY) {
			console.error("RapidAPI key is not configured");
			return res.status(500).json({
				error: "API configuration error",
				message: "RapidAPI key is not configured. Please add RAPIDAPI_KEY to your .env file",
			});
		}

		// TripAdvisor API - Search for location
		const searchLocationUrl = `https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchLocation?query=${encodeURIComponent(cityName)}`;

		const locationOptions = {
			method: 'GET',
			headers: {
				'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
				'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
			}
		};

		// Add timeout to fetch request
		const locationController = new AbortController();
		const locationTimeout = setTimeout(() => locationController.abort(), 10000);

		let locationRes, locationData;
		try {
			locationRes = await fetch(searchLocationUrl, {
				...locationOptions,
				signal: locationController.signal
			});
			clearTimeout(locationTimeout);
			locationData = await locationRes.json();
		} catch (error) {
			clearTimeout(locationTimeout);
			if (error.name === 'AbortError') {
				return res.status(504).json({
					error: "Request timeout",
					message: "Location search timed out. Please try again.",
				});
			}
			throw error;
		}

		if (!locationRes.ok) {
			console.error("TripAdvisor API Error:", locationData);
			if (locationData.message && locationData.message.includes("not subscribed")) {
				return res.status(500).json({
					error: "API subscription required",
					message: "Please subscribe to the TripAdvisor API on RapidAPI. Visit https://rapidapi.com/apidojo/api/tripadvisor16 to subscribe.",
					details: locationData.message,
				});
			}
			return res.status(500).json({
				error: "API error",
				message: locationData.message || "Failed to search for location. Please check your RapidAPI subscription.",
				details: locationData,
			});
		}

		// Extract location ID from response
		// Response format: { status: true, message: "Success", data: [{ geoId: 155019, title: "<b>Toronto</b>", ... }] }
		let locationId = null;
		if (locationData.status && locationData.data && Array.isArray(locationData.data) && locationData.data.length > 0) {
			// Get the first result (preferably a CITY result)
			const location = locationData.data.find(loc => loc.trackingItems === 'CITY') || locationData.data[0];
			locationId = location.geoId || location.locationId || location.id;

			console.log(`Found location: ${location.title || cityName}, geoId: ${locationId}`);
		} else if (locationData.data && Array.isArray(locationData.data) && locationData.data.length > 0) {
			// Fallback format
			const location = locationData.data[0];
			locationId = location.geoId || location.locationId || location.id;
		}

		if (!locationId) {
			console.error("Location data:", locationData);
			return res.status(404).json({
				error: "Location not found",
				message: `Could not find location for "${cityName}". Please check the spelling and try again.`,
				details: locationData,
			});
		}

		// Search for hotels using the location ID
		// TripAdvisor hotels search endpoint
		const searchHotelsUrl = `https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels?geoId=${locationId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${numOccupants}&pageNumber=${page}&sortPreference=popularity&currency=USD`;

		const hotelsOptions = {
			method: 'GET',
			headers: {
				'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
				'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
			}
		};

		// Add timeout to fetch request
		const hotelsController = new AbortController();
		const hotelsTimeout = setTimeout(() => hotelsController.abort(), 15000);

		let hotelsRes, hotelsData;
		try {
			hotelsRes = await fetch(searchHotelsUrl, {
				...hotelsOptions,
				signal: hotelsController.signal
			});
			clearTimeout(hotelsTimeout);
			hotelsData = await hotelsRes.json();
		} catch (error) {
			clearTimeout(hotelsTimeout);
			if (error.name === 'AbortError') {
				return res.status(504).json({
					error: "Request timeout",
					message: "Hotel search timed out. Please try again.",
				});
			}
			throw error;
		}

		if (!hotelsRes.ok) {
			console.error("TripAdvisor Hotels API Error:", hotelsData);
			return res.status(500).json({
				error: "Hotels API error",
				message: hotelsData.message || "Failed to search for hotels. Please try again later.",
				details: hotelsData,
			});
		}

		// Transform the response to match our expected format
		const hotels = [];

		// TripAdvisor API returns data as an array directly (based on test)
		// Response structure: [{ id, title, secondaryInfo, bubbleRating, priceForDisplay, ... }, ...]
		let properties = [];
		if (Array.isArray(hotelsData)) {
			properties = hotelsData;
		} else if (hotelsData.data && Array.isArray(hotelsData.data)) {
			properties = hotelsData.data;
		} else if (hotelsData.data?.data && Array.isArray(hotelsData.data.data)) {
			properties = hotelsData.data.data;
		}

		// Calculate nights
		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);
		const numNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;

		// Apply pagination early to avoid processing unnecessary hotels
		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;
		const paginatedProperties = properties.slice(startIndex, endIndex);

		// Process only the hotels we need for this page
		for (const property of paginatedProperties) {
			const hotel = property || {};

			// Extract price information from TripAdvisor format
			// IMPORTANT: The TripAdvisor API returns priceForDisplay as the TOTAL price for the entire stay (checkIn to checkOut)
			// priceForDisplay can be a string like "$835" or an object with { text: "$835" }
			let priceValue = null;
			const priceDisplay = hotel.priceForDisplay;

			if (priceDisplay) {
				if (typeof priceDisplay === 'string') {
					// Remove currency symbols and parse (e.g., "$835" -> 835)
					priceValue = parseFloat(priceDisplay.replace(/[^0-9.]/g, ''));
				} else if (priceDisplay.text) {
					// Object format: { text: "$835" }
					priceValue = parseFloat(priceDisplay.text.replace(/[^0-9.]/g, ''));
				}
			}

			// Calculate price per night (API returns total, so we divide by nights)
			const pricePerNight = priceValue && numNights > 0 ? (priceValue / numNights).toFixed(2) : null;

			// Log for debugging price inconsistencies
			if (priceValue && (priceValue < 50 || (numNights > 1 && priceValue < numNights * 20))) {
				console.warn(`Unusually low price detected for ${hotel.title || 'hotel'}: $${priceValue} for ${numNights} night(s). API might be returning incorrect pricing.`);
			}

			// Get rating from bubbleRating object
			const rating = hotel.bubbleRating?.rating ||
				hotel.rating ||
				null;

			// Get location/area from secondaryInfo
			const vicinity = hotel.secondaryInfo ||
				hotel.address?.locality ||
				cityName;

			// Get hotel name - remove HTML tags if present
			let hotelName = hotel.title || hotel.name || "Unknown Hotel";
			// Remove HTML tags like <b> tags
			hotelName = hotelName.replace(/<[^>]*>/g, '').trim();

			// Calculate price level from price per night or rating
			let priceLevel = null;
			if (pricePerNight) {
				const priceNum = parseFloat(pricePerNight);
				if (priceNum >= 350) priceLevel = 4;
				else if (priceNum >= 200) priceLevel = 3;
				else if (priceNum >= 100) priceLevel = 2;
				else priceLevel = 1;
			} else if (rating) {
				// Estimate from rating
				if (rating >= 4.5) priceLevel = 3;
				else if (rating >= 4.0) priceLevel = 2;
				else if (rating >= 3.5) priceLevel = 2;
				else priceLevel = 1;
			}

			// Get hotel ID
			const hotelId = hotel.id || null;

			// Get image from cardPhotos array
			let image = null;
			if (hotel.cardPhotos && Array.isArray(hotel.cardPhotos) && hotel.cardPhotos.length > 0) {
				// Use the first photo's URL template, replace width/height with actual values
				const photoUrl = hotel.cardPhotos[0].sizes?.urlTemplate;
				if (photoUrl) {
					image = photoUrl.replace('{width}', '400').replace('{height}', '300');
				}
			}

			// Get booking URL from commerceInfo
			const url = hotel.commerceInfo?.externalUrl ||
				(hotelId ? `https://www.tripadvisor.com/Hotel_Review-d${hotelId}` : null) ||
				null;

			hotels.push({
				name: hotelName,
				vicinity: vicinity,
				rating: rating,
				price: priceValue,
				pricePerNight: pricePerNight ? parseFloat(pricePerNight) : null,
				price_level: priceLevel,
				place_id: hotelId,
				url: url,
				image: image,
				occupants: numOccupants,
				nights: numNights,
				checkIn: checkIn,
				checkOut: checkOut,
				currency: "USD", // TripAdvisor API uses USD by default
			});
		}

		// Pagination info (already calculated above, reuse variables)
		const totalResults = hotelsData.pagination?.totalResults ||
			hotelsData.totalResults ||
			properties.length;
		const hasMore = endIndex < totalResults;

		res.json({
			hotels: hotels,
			pagination: {
				currentPage: pageNum,
				limit: limitNum,
				totalHotels: totalResults,
				hasMore: hasMore,
				showing: `${Math.min(pageNum * limitNum, totalResults)} of ${totalResults}`,
			},
		});
	} catch (error) {
		console.error("Error in /api/hotels:", error);

		// Return JSON error instead of letting Express return HTML
		return res.status(500).json({
			error: "Internal server error",
			message: error.message || "An unexpected error occurred while searching for hotels.",
			details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
};
