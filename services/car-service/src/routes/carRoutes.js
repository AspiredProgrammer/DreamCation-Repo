const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

// GET /api/cars?origin=YYZ&dest=LAX&pickupDate=2024-06-01&returnDate=2024-06-05
router.get("/cars", carController.searchCars);

module.exports = router;

