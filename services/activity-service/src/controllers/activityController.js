require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const fetch = require("node-fetch");
const Amadeus = require("amadeus");

const amadeus = new Amadeus({
	clientId: process.env.AMA_KEY,
	clientSecret: process.env.AMA_SECRET,
	hostname: process.env.AMA_HOST === "production" ? "production" : "test",
});

// Helper function to resolve city geolocation
async function resolveCityGeo({ city, countryCode }, { amadeus, googleApiKey }) {
	// Try Amadeus first
	try {
		const resp = await amadeus.referenceData.locations.cities.get({
			keyword: city,
			...(countryCode ? { countryCode } : {}),
			"page[limit]": 3,
		});
		const json = JSON.parse(resp.body);
		const match = (json.data || [])[0];
		if (match?.geoCode) return { name: match.name, geoCode: match.geoCode };
	} catch (_) {}

	// Fallback: Google Geocoding
	if (googleApiKey) {
		try {
			const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
				city
			)}&key=${googleApiKey}`;
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
		} catch (_) {}
	}
	return null;
}

exports.getEventsByCity = async (req, res) => {
	try {
		const city = (req.query.city || "").trim();
		const category = (req.query.category || "").trim();
		const q = (req.query.q || "").trim();
		const onlyFree = req.query.onlyFree === "true";
		const eventDate = req.query.eventDate || null;
		const pageSize = Number(req.query.pageSize) || 50;

		if (!city) return res.status(400).json({ error: "Missing city" });
		if (!process.env.PREDICTHQ_TOKEN)
			return res.status(500).json({ error: "Missing PredictHQ token" });

		const geo = await resolveCityGeo(
			{ city },
			{ amadeus, googleApiKey: process.env.GOOGLE_API_KEY }
		);
		if (!geo)
			return res.status(404).json({ error: `City "${city}" not found via Geocoding` });

		const { latitude, longitude } = geo.geoCode;

		const baseUrl = new URL("https://api.predicthq.com/v1/events/");
		baseUrl.searchParams.set("within", `10km@${latitude},${longitude}`);
		baseUrl.searchParams.set("limit", String(pageSize));
		baseUrl.searchParams.set("sort", "start");

		if (category) baseUrl.searchParams.set("category", category);
		if (q) baseUrl.searchParams.set("q", q);
		if (onlyFree) baseUrl.searchParams.set("price", "free");
		if (eventDate) {
			baseUrl.searchParams.set("start.gte", `${eventDate}T00:00:00Z`);
			baseUrl.searchParams.set("start.lte", `${eventDate}T23:59:59Z`);
		}

		const res2 = await fetch(baseUrl.href, {
			headers: { Authorization: `Bearer ${process.env.PREDICTHQ_TOKEN}` },
		});

		if (!res2.ok) throw new Error(await res2.text());
		const data = await res2.json();

		const formatted = (data.results || []).map((e) => {
			let url =
				e.url ||
				(e.entities?.[0]?.url ?? null) ||
				`https://www.google.com/search?q=${encodeURIComponent(
					e.title + " " + (e.location?.[0] || city)
				)}`;

			return {
				id: e.id,
				name: e.title,
				location: e.entities?.[0]?.name || city,
				startTime: e.start,
				endTime: e.end,
				category: e.category,
				url,
				image: e.images?.[0]?.url || null,
				shortDescription: e.description || "No description available.",
			};
		});

		res.json({
			data: formatted,
			meta: {
				total: data.count,
				city,
				geo,
				source: "PredictHQ",
			},
		});
	} catch (err) {
		console.error("[/api/activities/by-city] ERROR:", err);
		res.status(500).json({ error: "PredictHQ API failed", details: err.message });
	}
};

exports.getPlacesByCity = async (req, res) => {
	try {
		const { city, type = "restaurant", page = 1, limit = 20 } = req.query;

		if (!city) return res.status(400).json({ error: "City is required" });
		if (!process.env.GOOGLE_API_KEY) {
			return res.status(500).json({ error: "Missing Google API Key" });
		}

		// Geocode city
		const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			city
		)}&key=${process.env.GOOGLE_API_KEY}`;
		const geoRes = await fetch(geoUrl);
		const geoData = await geoRes.json();

		if (geoData.status !== "OK" || !geoData.results.length) {
			return res.status(404).json({ error: `City "${city}" not found` });
		}

		const { lat, lng } = geoData.results[0].geometry.location;

		// Nearby search
		const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${process.env.GOOGLE_API_KEY}`;
		const placesRes = await fetch(placesUrl);
		const placesData = await placesRes.json();

		if (placesData.status !== "OK") {
			return res.status(500).json({
				error: "Google Places API failed",
				details: placesData.error_message || placesData.status,
			});
		}

		const formatted = await Promise.all(
			(placesData.results || []).map(async (p) => {
				let website = null;

				try {
					const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=website,url&key=${process.env.GOOGLE_API_KEY}`;
					const detailsRes = await fetch(detailsUrl);
					const detailsData = await detailsRes.json();
					website = detailsData.result?.website || detailsData.result?.url || null;
				} catch (_) {}

				return {
					id: p.place_id,
					name: p.name,
					address: p.vicinity || city,
					rating: p.rating || null,
					photo: p.photos
						? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}`
						: null,
					officialUrl: website,
					mapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
					shortDescription: p.types ? p.types.join(", ") : "No details available",
				};
			})
		);

		res.json({ data: formatted });
	} catch (err) {
		console.error("Error in /api/places/by-city:", err);
		res.status(500).json({ error: "Google Places API failed", details: err.message });
	}
};

