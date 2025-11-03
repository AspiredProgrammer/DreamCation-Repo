const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

// GET /api/activities/by-city?city=xxx&category=xxx
router.get("/activities/by-city", activityController.getEventsByCity);

// GET /api/places/by-city?city=xxx&type=restaurant
router.get("/places/by-city", activityController.getPlacesByCity);

module.exports = router;

