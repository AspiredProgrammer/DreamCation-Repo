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
		// , "http://localhost:3001"
		origin: [process.env.FRONTEND_ENDPOINT],
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

// Start server
app.listen(PORT, () => {
	console.log(`👤 User Service running on ${process.env.USER_ENDPOINT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
	console.log(`🔑 JWT Secret configured: ${!!process.env.JWT_SECRET}`);
});

module.exports = app;

