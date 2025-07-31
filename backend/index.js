const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

//MySQL Connection Set Up:
const db = mysql.createConnection({
	host: "localhost",
	user: "dbaUser",
	password: process.env.DB_PASSWORD,
	database: "dreamDB",
});

db.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL:", err);
		return;
	}
	console.log("Connected to MySQL database");
});

//Fetch users from users table:
app.get("/users", (req, res) => {
	const sql = "SELECT * FROM users";
	db.query(sql, (err, results) => {
		if (err) {
			console.error("Error fetching users:", err);
			res.status(500).send("Error fetching data");
			return;
		}
		res.json(results);
	});
});

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

app.listen(8000, () => {
	console.log("Server running on http://localhost:8000");
});

app.listen(3306, () => {
	console.log(`Database server running on port 3306`);
});
