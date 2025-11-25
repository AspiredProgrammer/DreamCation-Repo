const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itineraryController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET /api/itinerary - Get user's itineraries
router.get("/itinerary", itineraryController.getItineraries);

// POST /api/itinerary - Add item to itinerary
router.post("/itinerary", itineraryController.addToItinerary);

// PUT /api/itinerary/:id - Update itinerary item
router.put("/itinerary/:id", itineraryController.updateItineraryItem);

// DELETE /api/itinerary/:id - Remove item from itinerary
router.delete("/itinerary/:id", itineraryController.removeFromItinerary);

// DELETE /api/itinerary - Clear all items
router.delete("/itinerary", itineraryController.clearItinerary);

module.exports = router;

//reminder - must protect all routes here from non logged-in users