require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const express = require("express");
const cors = require("cors");
const hotelRoutes = require("./routes/hotelRoutes");

const app = express();
const PORT = process.env.PORT || 8002;

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
		methods: ["GET", "POST", "OPTIONS"],
		credentials: true,
	})
);

// Health check
app.get("/health", (req, res) => {
	res.json({
		ok: true,
		service: "hotel-service",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Routes
app.use("/api", hotelRoutes);

// Start server
app.listen(PORT, () => {
	console.log(`🏨 Hotel Service running on ${process.env.HOTEL_ENDPOINT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
	console.log(`🔑 Google API Key configured: ${!!process.env.GOOGLE_API_KEY}`);
});

module.exports = app;

