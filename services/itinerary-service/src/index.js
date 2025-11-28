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
		origin: true, // Accept any origin
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

// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not on Vercel (local development)
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
	app.listen(PORT, () => {
		console.log(`📅 Itinerary Service running on ${process.env.ITINERARY_ENDPOINT || `http://localhost:${PORT}`}`);
		console.log(`📊 Health check: http://localhost:${PORT}/health`);
		console.log(`🔑 JWT Secret configured: ${!!process.env.JWT_SECRET}`);
	});
}

