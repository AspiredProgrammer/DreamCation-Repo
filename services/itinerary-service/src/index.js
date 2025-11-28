require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const express = require("express");
const cors = require("cors");
const itineraryRoutes = require("./routes/itineraryRoutes");

const app = express();
const PORT = process.env.PORT || 8006;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: [
			process.env.FRONTEND_ENDPOINT, // Production frontend
			process.env.API_GATEWAY_ENDPOINT, // API Gateway (requests come through gateway)
			"http://localhost:3000", // Development frontend
			"http://localhost:3001", // Development API Gateway
		].filter(Boolean), // Remove undefined values
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	})
);

// Health check
app.get("/health", (req, res) => {
	res.json({
		ok: true,
		service: "itinerary-service",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Routes
app.use("/api", itineraryRoutes);

// Start server
app.listen(PORT, () => {
	console.log(`📅 Itinerary Service running on ${process.env.ITINERARY_ENDPOINT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
	console.log(`🔑 JWT Secret configured: ${!!process.env.JWT_SECRET}`);
});

module.exports = app;

