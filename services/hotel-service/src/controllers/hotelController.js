require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const fetch = require("node-fetch");

exports.getHotelsByCity = async (req, res, next) => {
	try {
		const { city, page = 1, limit = 10 } = req.query;

		if (!city || typeof city !== "string" || city.trim().length === 0) {
			return res.status(400).json({
				error: "City parameter is required",
				message: "Please provide a valid city name",
			});
		}

		if (!process.env.GOOGLE_API_KEY) {
			console.error("Google Maps API key is not configured");
			return res.status(500).json({
				error: "API configuration error",
				message: "Google Maps API key is not configured",
			});
		}

		const cityName = city.trim();

		// 1) Geocode
		const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			cityName
		)}&key=${process.env.GOOGLE_API_KEY}`;
		const geoRes = await fetch(geocodeUrl);
		const geoData = await geoRes.json();

		if (geoData.status !== "OK" || !geoData.results.length) {
			return res.status(404).json({
				error: "City not found",
				message: `Could not find location for "${cityName}". Please check the spelling and try again.`,
				status: geoData.status,
				details: geoData.error_message,
			});
		}

		const { lat, lng } = geoData.results[0].geometry.location;

		// 2) Nearby Places
		const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${process.env.GOOGLE_API_KEY}`;
		const placesRes = await fetch(placesUrl);
		const placesData = await placesRes.json();

		if (placesData.status !== "OK") {
			return res.status(500).json({
				error: "Places API error",
				message: "Failed to search for hotels. Please try again later.",
				status: placesData.status,
				details: placesData.error_message,
			});
		}

		if (!placesData.results || placesData.results.length === 0) {
			return res.json({
				hotels: [],
				pagination: {
					currentPage: parseInt(page, 10),
					limit: parseInt(limit, 10),
					totalHotels: 0,
					hasMore: false,
					showing: "0 of 0",
				},
			});
		}

		// 3) Pagination + details
		const pageNum = parseInt(page, 10);
		const limitNum = parseInt(limit, 10);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;
		const paginatedResults = placesData.results.slice(startIndex, endIndex);

		const hotelsWithUrls = await Promise.all(
			paginatedResults.map(async (place) => {
				try {
					const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,vicinity,url,rating,formatted_phone_number,website&key=${process.env.GOOGLE_API_KEY}`;
					const detailsRes = await fetch(detailsUrl);
					const detailsData = await detailsRes.json();
					return {
						name: detailsData.result?.name || place.name,
						vicinity: detailsData.result?.vicinity || place.vicinity,
						url: detailsData.result?.url || null,
						rating: detailsData.result?.rating ?? place.rating ?? null,
						place_id: place.place_id,
					};
				} catch (err) {
					console.error("Error in hotelsWithUrls:", err);
					return {
						name: place.name,
						vicinity: place.vicinity,
						url: null,
						rating: place.rating ?? null,
						place_id: place.place_id,
					};
				}
			})
		);

		res.json({
			hotels: hotelsWithUrls,
			pagination: {
				currentPage: pageNum,
				limit: limitNum,
				totalHotels: placesData.results.length,
				hasMore: endIndex < placesData.results.length,
				showing: `${Math.min(endIndex, placesData.results.length)} of ${
					placesData.results.length
				}`,
			},
		});
	} catch (error) {
		console.error("Error in /api/hotels:", error);
		next(error);
	}
};

