const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

require("dotenv").config();

app.use(cors());

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
//-----------------------------------------------
//Listening:
//-----------------------------------------------
app.listen(8000, () => {
	console.log("Server running on http://localhost:8000");
});
