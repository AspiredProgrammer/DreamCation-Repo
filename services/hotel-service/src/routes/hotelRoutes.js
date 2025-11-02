const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// GET /api/hotels?city=xxx&page=1&limit=10
router.get("/hotels", hotelController.getHotelsByCity);

module.exports = router;

