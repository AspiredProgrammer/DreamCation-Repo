require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: true, // Accept any origin
		methods: ["GET", "POST", "OPTIONS"],
		credentials: true,
	})
);

// Health check
app.get("/health", (req, res) => {
	res.json({
		ok: true,
		service: "user-service",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Routes
app.use("/user", userRoutes);

// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not on Vercel (local development)
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
	app.listen(PORT, () => {
		console.log(`👤 User Service running on ${process.env.USER_ENDPOINT || `http://localhost:${PORT}`}`);
		console.log(`📊 Health check: http://localhost:${PORT}/health`);
		console.log(`🔑 JWT Secret configured: ${!!process.env.JWT_SECRET}`);
	});
}

