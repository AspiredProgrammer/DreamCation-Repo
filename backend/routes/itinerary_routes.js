require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Itinerary = require("../models/itinerary");

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.jwt_secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// GET /api/itinerary - Get user's itinerary
router.get("/", authenticateToken, async (req, res) => {
    try {
        const itineraryItems = await Itinerary.findByUserId(req.user.id);
        const stats = await Itinerary.getItineraryStats(req.user.id);

        res.json({
            success: true,
            items: itineraryItems,
            stats: stats
        });
    } catch (error) {
        console.error("Error fetching itinerary:", error);
        res.status(500).json({ error: "Failed to fetch itinerary" });
    }
});

// POST /api/itinerary - Add item to itinerary
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { itemType, itemId, itemData, date, time, notes } = req.body;

        // Validate required fields
        if (!itemType || !itemId || !itemData) {
            return res.status(400).json({
                error: "itemType, itemId, and itemData are required"
            });
        }

        // Validate item type
        if (!['flight', 'hotel', 'attraction'].includes(itemType)) {
            return res.status(400).json({
                error: "itemType must be 'flight', 'hotel', or 'attraction'"
            });
        }

        // Check if item already exists in itinerary
        const existingItem = await Itinerary.checkItemExists(req.user.id, itemType, itemId);

        if (existingItem) {
            return res.status(400).json({
                error: "Item already exists in itinerary",
                item: existingItem
            });
        }

        // Create new itinerary item
        const itineraryItem = new Itinerary(
            req.user.id,
            itemType,
            itemId,
            itemData,
            date,
            time,
            notes
        );

        const itineraryId = await itineraryItem.save();
        const newItem = await Itinerary.findById(itineraryId);

        res.status(201).json({
            success: true,
            message: "Item added to itinerary",
            item: newItem
        });
    } catch (error) {
        console.error("Error adding to itinerary:", error);
        res.status(500).json({ error: "Failed to add item to itinerary" });
    }
});

// PUT /api/itinerary/:id - Update itinerary item
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, notes } = req.body;

        // Check if item exists and belongs to user
        const item = await Itinerary.findById(id);
        if (!item) {
            return res.status(404).json({ error: "Itinerary item not found" });
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Prepare updates
        const updates = {};
        if (date !== undefined) updates.date = date;
        if (time !== undefined) updates.time = time;
        if (notes !== undefined) updates.notes = notes;

        await Itinerary.updateItem(id, updates);
        const updatedItem = await Itinerary.findById(id);

        res.json({
            success: true,
            message: "Itinerary item updated",
            item: updatedItem
        });
    } catch (error) {
        console.error("Error updating itinerary item:", error);
        res.status(500).json({ error: "Failed to update itinerary item" });
    }
});

// DELETE /api/itinerary/:id - Remove item from itinerary
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if item exists and belongs to user
        const item = await Itinerary.findById(id);
        if (!item) {
            return res.status(404).json({ error: "Itinerary item not found" });
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await Itinerary.deleteById(id);
        res.json({ success: true, message: "Item removed from itinerary" });
    } catch (error) {
        console.error("Error removing from itinerary:", error);
        res.status(500).json({ error: "Failed to remove item from itinerary" });
    }
});

// DELETE /api/itinerary - Clear entire itinerary
router.delete("/", authenticateToken, async (req, res) => {
    try {
        await Itinerary.deleteByUserId(req.user.id);
        res.json({ success: true, message: "Itinerary cleared" });
    } catch (error) {
        console.error("Error clearing itinerary:", error);
        res.status(500).json({ error: "Failed to clear itinerary" });
    }
});

// GET /api/itinerary/stats - Get itinerary statistics
router.get("/stats", authenticateToken, async (req, res) => {
    try {
        const stats = await Itinerary.getItineraryStats(req.user.id);
        res.json({ success: true, stats });
    } catch (error) {
        console.error("Error fetching itinerary stats:", error);
        res.status(500).json({ error: "Failed to fetch itinerary statistics" });
    }
});

module.exports = router;
