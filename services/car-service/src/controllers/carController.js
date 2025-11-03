require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const Amadeus = require("amadeus");

const amadeus = new Amadeus({
	clientId: process.env.AMA_KEY,
	clientSecret: process.env.AMA_SECRET,
	hostname: process.env.AMA_HOST === "production" ? "production" : "test",
});

exports.searchCars = async (req, res) => {
	const { origin, dest, pickupDate, returnDate, driversAge } = req.query;

	try {
		const response = await amadeus.shopping.vehicleOffers.get({
			pickupLocationCode: origin,
			dropOffLocationCode: dest || origin,
			pickupDate,
			returnDate,
			driversAge: driversAge || 25,
		});

		res.json(response.data);
	} catch (err) {
		console.error("Car rental error →", err);
		res.status(500).json({ error: "Car search failed" });
	}
};

