const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const Amadeus = require("amadeus"); 

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());   

const amadeus = new Amadeus({
	clientId: process.env.AMA_KEY,
	clientSecret: process.env.AMA_SECRET,
	hostname: process.env.AMA_HOST === "production" ? "production" : "test",
  });

//-----------------------------------------------
/*
 firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNum VARCHAR(15) NOT NULL

*/
// app.post("/register", (req, res) => {});
//-----------------------------------------------
app.get("/api/hotels", async (req, res, next) => {
	try {
		const { city } = req.query;

		const geoRes = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.API_KEY}`
		);
		const geoData = await geoRes.json();

		if (!geoData.results.length) {
			return res.status(404).json({ message: "City not found" });
		}

		const { lat, lng } = geoData.results[0].geometry.location;

		const placesRes = await fetch(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${process.env.API_KEY}`
		);
		const placesData = await placesRes.json();

		// Fetch place details (with URL) for each result
		const hotelsWithUrls = await Promise.all(
			placesData.results.map(async (place) => {
				const detailsRes = await fetch(
					`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,vicinity,url&key=${process.env.API_KEY}`
				);
				const detailsData = await detailsRes.json();

				return {
					name: detailsData.result.name,
					vicinity: detailsData.result.vicinity,
					url: detailsData.result.url,
					place_id: place.place_id,
				};
			})
		);
		res.json(hotelsWithUrls);
	} catch (error) {
		next(error);
	}
});

// -----------------------------------------------
// Flights: GET /api/flights?origin=YYZ&dest=LAX&date=2025-09-10&adults=1
app.get("/api/flights", async (req, res) => {
	try {
	  const { origin, dest, date, adults = "1", returnDate, currencyCode } = req.query;
	  if (!origin || !dest || !date) {
		return res.status(400).json({ error: "origin, dest, and date are required" });
	  }
  
	  const params = {
		originLocationCode: origin.toUpperCase(),
		destinationLocationCode: dest.toUpperCase(),
		departureDate: date,            // YYYY-MM-DD
		adults: String(adults),
		max: 20,
		...(returnDate ? { returnDate } : {}),
		...(currencyCode ? { currencyCode } : {}),
	  };
  
	  const response = await amadeus.shopping.flightOffersSearch.get(params);
	  res.json(JSON.parse(response.body)); // Amadeus SDK returns JSON string in body
	} catch (err) {
	  console.error("Amadeus error:", err?.response?.result || err.message);
	  res.status(500).json({ error: "Amadeus search failed", details: err?.response?.result || err.message });
	}
  });
  // -----------------------------------------------
  
//-----------------------------------------------
//Listening:
//-----------------------------------------------
app.listen(8000, () => {
	console.log("Server running on http://localhost:8000");
});
