require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		//http://localhost:3000
		origin: [process.env.FRONTEND_ENDPOINT], // Frontend only
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	})
);

// Health check
app.get("/health", (req, res) => {
	res.json({
		ok: true,
		service: "api-gateway",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		services: {
			user: process.env.USER_ENDPOINT,
			hotel: process.env.HOTEL_ENDPOINT,
			flight: process.env.FLIGHT_ENDPOINT,
			activity: process.env.ACTIVITY_ENDPOINT,
			car: process.env.CAR_ENDPOINT,
			itinerary: process.env.ITINERARY_ENDPOINT,
		},
	});
});

// Proxy middleware for each service
const userServiceProxy = createProxyMiddleware({
	target: process.env.USER_ENDPOINT, //|| "http://localhost:8001",
	changeOrigin: true,
	pathRewrite: { "^/api": "" }, // Remove /api from user routes
});

const hotelServiceProxy = createProxyMiddleware({
	target: process.env.HOTEL_ENDPOINT, // || "http://localhost:8002",
	changeOrigin: true,
	pathRewrite: function (path, req) { 
		// Express strips /api/hotels prefix, add it back
		return "/api/hotels" + path;
	},
});

const flightServiceProxy = createProxyMiddleware({
	target: process.env.FLIGHT_ENDPOINT, // || "http://localhost:8003",
	changeOrigin: true,
	pathRewrite: function (path, req) { 
		return "/api/flights" + path;
	},
});

const activityServiceProxy = createProxyMiddleware({
	target: process.env.ACTIVITY_ENDPOINT, // || "http://localhost:8004",
	changeOrigin: true,
	pathRewrite: function (path, req) { 
		// Express strips prefix, so path is already stripped
		// We need to detect which route was used
		const originalPath = req.originalUrl;
		if (originalPath.startsWith('/api/places')) {
			return "/api/places" + path;
		}
		return "/api/activities" + path;
	},
});

const carServiceProxy = createProxyMiddleware({
	target: process.env.CAR_ENDPOINT, // || "http://localhost:8005",
	changeOrigin: true,
	pathRewrite: function (path, req) { 
		return "/api/cars" + path;
	},
});

const itineraryServiceProxy = createProxyMiddleware({
	target: process.env.ITINERARY_ENDPOINT, // || "http://localhost:8006",
	changeOrigin: true,
	pathRewrite: function (path, req) { 
		return "/api/itinerary" + path;
	},
});

// Routes - User service
app.use("/user", userServiceProxy);

// Routes - API services
app.use("/api/hotels", hotelServiceProxy);
app.use("/api/flights", flightServiceProxy);
app.use("/api/activities", activityServiceProxy);
app.use("/api/places", activityServiceProxy);
app.use("/api/cars", carServiceProxy);
app.use("/api/itinerary", itineraryServiceProxy);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
	console.log(`🚪 API Gateway running on http://localhost:${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
	console.log(`📡 Routing requests to microservices...`);
});

module.exports = app;

