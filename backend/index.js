const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());

// Middleware to log API requests
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({
		status: "OK",
		message: "DreamCation API is running",
		timestamp: new Date().toISOString(),
		apiKeyConfigured: !!process.env.API_KEY
	});
});

//-----------------------------------------------
app.get("/api/hotels", async (req, res, next) => {
	try {
		const { city, page = 1, limit = 10 } = req.query;

		// Validate input
		if (!city || typeof city !== 'string' || city.trim().length === 0) {
			return res.status(400).json({
				error: "City parameter is required",
				message: "Please provide a valid city name"
			});
		}

		// Check if API key is configured
		if (!process.env.API_KEY) {
			console.error("Google Maps API key is not configured");
			return res.status(500).json({
				error: "API configuration error",
				message: "Google Maps API key is not configured"
			});
		}

		const cityName = city.trim();
		console.log(`Searching for hotels in: ${cityName}`);

		// Step 1: Geocode the city to get coordinates
		const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${process.env.API_KEY}`;
		console.log("Geocoding URL:", geocodeUrl.replace(process.env.API_KEY, 'API_KEY_HIDDEN'));

		const geoRes = await fetch(geocodeUrl);
		const geoData = await geoRes.json();

		if (geoData.status !== 'OK' || !geoData.results.length) {
			console.log(`Geocoding failed for ${cityName}:`, geoData.status, geoData.error_message);
			return res.status(404).json({
				error: "City not found",
				message: `Could not find location for "${cityName}". Please check the spelling and try again.`,
				status: geoData.status,
				details: geoData.error_message
			});
		}

		const { lat, lng } = geoData.results[0].geometry.location;
		console.log(`Found coordinates for ${cityName}: ${lat}, ${lng}`);

		// Step 2: Search for nearby hotels
		const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${process.env.API_KEY}`;
		console.log("Places search URL:", placesUrl.replace(process.env.API_KEY, 'API_KEY_HIDDEN'));

		const placesRes = await fetch(placesUrl);
		const placesData = await placesRes.json();

		if (placesData.status !== 'OK') {
			console.log(`Places search failed for ${cityName}:`, placesData.status, placesData.error_message);
			return res.status(500).json({
				error: "Places API error",
				message: "Failed to search for hotels. Please try again later.",
				status: placesData.status,
				details: placesData.error_message
			});
		}

		if (!placesData.results || placesData.results.length === 0) {
			console.log(`No hotels found for ${cityName}`);
			return res.json({
				hotels: [],
				pagination: {
					currentPage: parseInt(page),
					limit: parseInt(limit),
					totalHotels: 0,
					hasMore: false,
					showing: "0 of 0"
				}
			});
		}

		console.log(`Found ${placesData.results.length} hotels for ${cityName}`);

		// Step 3: Fetch detailed information for each hotel with pagination
		const pageNum = parseInt(page);
		const limitNum = parseInt(limit);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;
		const paginatedResults = placesData.results.slice(startIndex, endIndex);

		console.log(`Showing page ${pageNum}: hotels ${startIndex + 1}-${Math.min(endIndex, placesData.results.length)} of ${placesData.results.length}`);

		const hotelsWithUrls = await Promise.all(
			paginatedResults.map(async (place, index) => {
				try {
					const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,vicinity,url,rating,formatted_phone_number,website&key=${process.env.API_KEY}`;
					const detailsRes = await fetch(detailsUrl);
					const detailsData = await detailsRes.json();

					if (detailsData.status === 'OK' && detailsData.result) {
						return {
							name: detailsData.result.name || place.name,
							vicinity: detailsData.result.vicinity || place.vicinity,
							url: detailsData.result.url,
							place_id: place.place_id,
							rating: place.rating,
							price_level: place.price_level,
							types: place.types,
							photos: place.photos ? place.photos.slice(0, 1) : []
						};
					} else {
						// Fallback to basic place data if details fail
						return {
							name: place.name,
							vicinity: place.vicinity,
							url: null,
							place_id: place.place_id,
							rating: place.rating,
							price_level: place.price_level,
							types: place.types,
							photos: place.photos ? place.photos.slice(0, 1) : []
						};
					}
				} catch (error) {
					console.error(`Error fetching details for hotel ${index}:`, error);
					// Return basic data if details fetch fails
					return {
						name: place.name,
						vicinity: place.vicinity,
						url: null,
						place_id: place.place_id,
						rating: place.rating,
						price_level: place.price_level,
						types: place.types,
						photos: place.photos ? place.photos.slice(0, 1) : []
					};
				}
			})
		);

		console.log(`Successfully processed ${hotelsWithUrls.length} hotels for ${cityName}`);

		// Return pagination info along with hotels
		const totalHotels = placesData.results.length;
		const hasMore = endIndex < totalHotels;

		res.json({
			hotels: hotelsWithUrls,
			pagination: {
				currentPage: pageNum,
				limit: limitNum,
				totalHotels: totalHotels,
				hasMore: hasMore,
				showing: `${startIndex + 1}-${Math.min(endIndex, totalHotels)} of ${totalHotels}`
			}
		});

	} catch (error) {
		console.error("Error in /api/hotels:", error);
		next(error);
	}
});

//-----------------------------------------------
// Global error handler
//-----------------------------------------------
app.use((error, req, res, next) => {
	console.error("Global error handler:", error);
	res.status(500).json({
		error: "Internal server error",
		message: "Something went wrong. Please try again later.",
		timestamp: new Date().toISOString()
	});
});

// 404 handler for undefined routes
app.use((req, res) => {
	res.status(404).json({
		error: "Route not found",
		message: `The route ${req.method} ${req.path} does not exist`,
		timestamp: new Date().toISOString()
	});
});

//-----------------------------------------------
//Listening:
//-----------------------------------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
	console.log(`🔑 API Key configured: ${!!process.env.API_KEY}`);
});
