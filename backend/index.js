// server.js
const express = require("express");
const fetch = require("node-fetch"); // If you're on Node >=18 you can use global fetch instead.
const cors = require("cors");
const connection = require("./database");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();

const router = express.Router();
const Amadeus = require("amadeus");
app.use(express.json());
app.use(passport.initialize());
const app = express();
app.use(cors());
app.use(express.json());

// --- Amadeus client ---
const amadeus = new Amadeus({
	clientId: process.env.AMA_KEY,
	clientSecret: process.env.AMA_SECRET,
	hostname: process.env.AMA_HOST === "production" ? "production" : "test",
});

// -----------------------------------------------
// Health
// -----------------------------------------------
app.get("/api/health", (req, res) => {
	res.json({
		ok: true,
		node: process.version,
		amadeusHost: amadeus.client.hostname,
		hasAmaKey: !!process.env.AMA_KEY,
		hasAmaSecret: !!process.env.AMA_SECRET,
		hasGoogleKey: !!process.env.API_KEY,
	});
});

// -----------------------------------------------
// Hotels (Google Places)
// -----------------------------------------------
app.get("/api/hotels", async (req, res, next) => {
	try {
		const { city, page = 1, limit = 10 } = req.query;

		if (!city || typeof city !== "string" || city.trim().length === 0) {
			return res.status(400).json({
				error: "City parameter is required",
				message: "Please provide a valid city name",
			});
		}

		if (!process.env.API_KEY) {
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
		)}&key=${process.env.API_KEY}`;
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
		const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${process.env.API_KEY}`;
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
					const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,vicinity,url,rating,formatted_phone_number,website&key=${process.env.API_KEY}`;
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
});

// -----------------------------------------------
// Activities (Amadeus: Tours & Activities)
// Supports: q (text), minPrice, maxPrice, category, page, pageSize
// -----------------------------------------------

// helpers
const clampInt = (v, { min = 1, max = 1_000_000, def = 1 } = {}) => {
	const n = Number.parseInt(v, 10);
	if (Number.isFinite(n)) return Math.min(max, Math.max(min, n));
	return def;
};

const priceNum = (p) => (p && p.amount ? Number(p.amount) : NaN);

const CATEGORY_KEYWORDS = {
	TOURS: [
		"tour",
		"guided",
		"walk",
		"walking",
		"excursion",
		"sightseeing",
		"guide",
	],
	RESTAURANT: [
		"restaurant",
		"food",
		"dining",
		"wine",
		"tasting",
		"culinary",
		"bistro",
	],
	MUSEUM: ["museum", "gallery", "exhibit", "exhibition", "art", "heritage"],
	NIGHTLIFE: [
		"nightlife",
		"club",
		"bar",
		"pub",
		"cabaret",
		"burlesque",
		"show",
	],
	SHOPPING: ["shopping", "market", "boutique", "mall", "fashion", "souvenir"],
	SIGHTS: [
		"tower",
		"landmark",
		"monument",
		"cathedral",
		"basilica",
		"palace",
		"castle",
		"bridge",
		"view",
		"panorama",
		"lookout",
	],
};

// ---------- Add this helper near the top of your file (after CATEGORY_KEYWORDS etc.) ----------
async function resolveCityGeo(
	{ city, countryCode },
	{ amadeus, googleApiKey }
) {
	// 1) Amadeus Cities API (best for city coordinates)
	try {
		// If input looks like a 3-letter IATA code, try iataCode first
		if (/^[A-Za-z]{3}$/.test(city)) {
			const iata = city.toUpperCase();
			const byIata = await amadeus.referenceData.locations.cities.get({
				iataCode: iata,
				"page[limit]": 1,
			});
			const byIataJson = JSON.parse(byIata.body);
			const c = (byIataJson.data || [])[0];
			if (c?.geoCode) return { name: c.name, geoCode: c.geoCode };
		}

		// Otherwise search by keyword (optionally with countryCode)
		const citiesResp = await amadeus.referenceData.locations.cities.get({
			keyword: city,
			...(countryCode ? { countryCode } : {}),
			"page[limit]": 5,
		});
		const citiesJson = JSON.parse(citiesResp.body);
		const match = (citiesJson.data || [])[0];
		if (match?.geoCode) return { name: match.name, geoCode: match.geoCode };
	} catch (e) {
		// swallow and try next strategy
	}

	// 2) Amadeus Locations (CITY and AIRPORT), grab the first with geoCode
	try {
		const locResp = await amadeus.referenceData.locations.get({
			subType: "CITY,AIRPORT",
			keyword: city,
			"page[limit]": 10,
		});
		const locJson = JSON.parse(locResp.body);
		const withGeo = (locJson.data || []).find((x) => x.geoCode);
		if (withGeo)
			return {
				name: withGeo.name || withGeo.iataCode || city,
				geoCode: withGeo.geoCode,
			};
	} catch (e) {
		// swallow and try next strategy
	}

	// 3) Optional: Google Geocoding fallback (only if API key is present)
	if (googleApiKey) {
		try {
			const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
				city
			)}${
				countryCode
					? `&components=country:${encodeURIComponent(countryCode)}`
					: ""
			}&key=${googleApiKey}`;

			const r = await fetch(url);
			const j = await r.json();
			const first = (j.results || [])[0];
			if (first?.geometry?.location) {
				return {
					name: first.formatted_address || city,
					geoCode: {
						latitude: first.geometry.location.lat,
						longitude: first.geometry.location.lng,
					},
				};
			}
		} catch (e) {
			// ignore
		}
	}

	// If all failed:
	return null;
}

function matchesCategory(activity, cat) {
	if (!cat) return true;
	const key = String(cat).toUpperCase();
	const needles = CATEGORY_KEYWORDS[key];
	if (!needles) return true;

	const hayA = (activity.categories || []).join(" ").toLowerCase();
	const hayB = (activity.type || "").toString().toLowerCase();
	const hayC = (activity.name || "").toLowerCase();
	const hayD = (activity.shortDescription || "").toLowerCase();
	const hay = `${hayA} ${hayB} ${hayC} ${hayD}`;
	return needles.some((w) => hay.includes(w));
}

// GET /api/activities/by-city
// city=Paris&radius=5&q=eiffel&minPrice=10&maxPrice=100&category=RESTAURANT&page=1&pageSize=4
app.get("/api/activities/by-city", async (req, res) => {
	try {
		const city = (req.query.city || "").trim();
		if (!city) return res.status(400).json({ error: "city is required" });

		const countryCode = (req.query.countryCode || "").trim().toUpperCase(); // optional hint, e.g., CA
		const radius = clampInt(req.query.radius, { min: 1, max: 50, def: 5 }); // km
		const q = (req.query.q || "").trim().toLowerCase();
		const minPrice =
			req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
		const maxPrice =
			req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;
		const category = (req.query.category || "").trim().toUpperCase();

		// Pagination
		const page = clampInt(req.query.page, { min: 1, max: 10_000, def: 1 });
		const pageSize = clampInt(req.query.pageSize, { min: 1, max: 50, def: 4 }); // default 4/page

		// --- NEW robust resolver ---
		const resolved = await resolveCityGeo(
			{ city, countryCode },
			{ amadeus, googleApiKey: process.env.API_KEY }
		);
		if (!resolved || !resolved.geoCode) {
			return res
				.status(404)
				.json({ error: `No coordinates found for "${city}"` });
		}
		const { latitude, longitude } = resolved.geoCode;

		// 2) Fetch activities near coords
		const actResp = await amadeus.shopping.activities.get({
			latitude,
			longitude,
			radius,
		});
		const actJson = JSON.parse(actResp.body);
		let list = Array.isArray(actJson.data) ? actJson.data : [];

		// 3) Filters (text, price, category)
		if (q) {
			list = list.filter(
				(a) =>
					(a.name && a.name.toLowerCase().includes(q)) ||
					(a.shortDescription && a.shortDescription.toLowerCase().includes(q))
			);
		}
		if (minPrice != null && !Number.isNaN(minPrice)) {
			list = list.filter(
				(a) => !Number.isNaN(priceNum(a.price)) && priceNum(a.price) >= minPrice
			);
		}
		if (maxPrice != null && !Number.isNaN(maxPrice)) {
			list = list.filter(
				(a) => !Number.isNaN(priceNum(a.price)) && priceNum(a.price) <= maxPrice
			);
		}
		if (category) {
			list = list.filter((a) => matchesCategory(a, category));
		}

		// 4) Pagination
		const total = list.length;
		const totalPages = Math.max(1, Math.ceil(total / pageSize));
		const currentPage = Math.min(page, totalPages);
		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		const pageItems = list.slice(start, end);

		return res.json({
			data: pageItems,
			meta: {
				city: resolved.name,
				geoCode: resolved.geoCode,
				total,
				page: currentPage,
				pageSize,
				totalPages,
				hasPrev: currentPage > 1,
				hasNext: currentPage < totalPages,
			},
		});
	} catch (err) {
		const details = err?.response?.result || err.message;
		console.error("[/api/activities/by-city] ERROR:", details);
		return res
			.status(500)
			.json({ error: "Activities by-city failed", details });
	}
});

// -----------------------------------------------
// Flights (Amadeus Flight Offers Search)
// -----------------------------------------------
app.get("/api/flights", async (req, res) => {
	try {
		const {
			origin,
			dest,
			date,
			adults = "1",
			returnDate,
			currencyCode,
		} = req.query;
		if (!origin || !dest || !date) {
			return res
				.status(400)
				.json({ error: "origin, dest, and date are required" });
		}

		const params = {
			originLocationCode: origin.toUpperCase(),
			destinationLocationCode: dest.toUpperCase(),
			departureDate: date, // YYYY-MM-DD
			adults: String(adults),
			max: 20,
			...(returnDate ? { returnDate } : {}),
			...(currencyCode ? { currencyCode } : {}),
		};

		const response = await amadeus.shopping.flightOffersSearch.get(params);
		res.json(JSON.parse(response.body));
	} catch (err) {
		console.error("Amadeus error:", err?.response?.result || err.message);
		res.status(500).json({
			error: "Amadeus search failed",
			details: err?.response?.result || err.message,
		});
	}
});

// -----------------------------------------------
// Start server
// -----------------------------------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
	console.log(`🔑 Google API Key configured: ${!!process.env.API_KEY}`);
});
