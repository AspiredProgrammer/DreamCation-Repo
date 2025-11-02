require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const Amadeus = require("amadeus");

const amadeus = new Amadeus({
	clientId: process.env.AMA_KEY,
	clientSecret: process.env.AMA_SECRET,
	hostname: process.env.AMA_HOST === "production" ? "production" : "test",
});

exports.searchFlights = async (req, res) => {
	try {
		const { origin, dest, date, adults = "1", returnDate, currencyCode } = req.query;
		
		if (!origin || !dest || !date) {
			return res.status(400).json({ error: "origin, dest, and date are required" });
		}

		const params = {
			originLocationCode: origin.toUpperCase(),
			destinationLocationCode: dest.toUpperCase(),
			departureDate: date,
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
};

