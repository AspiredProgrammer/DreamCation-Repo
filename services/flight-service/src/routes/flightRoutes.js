const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flightController");

// GET /api/flights?origin=YYZ&dest=LAX&date=2024-06-01&adults=1
router.get("/flights", flightController.searchFlights);

module.exports = router;

