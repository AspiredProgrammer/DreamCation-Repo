const connectQuery = require("../config/db");

exports.getItineraries = async (req, res) => {
	try {
		const connection = await connectQuery();
		const userId = req.user.id;

		const [rows] = await connection.execute(
			"SELECT * FROM itinerary_items WHERE user_id = ? ORDER BY created_at DESC",
			[userId]
		);

		res.json({ items: rows });
	} catch (err) {
		console.error("Error fetching itineraries:", err);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.addToItinerary = async (req, res) => {
	try {
		const connection = await connectQuery();
		const userId = req.user.id;
		const { itemType, itemId, itemData, date, time, notes } = req.body;

		const id = `${itemType}-${itemId || Date.now()}`;

		await connection.execute(
			"INSERT INTO itinerary_items (user_id, item_id, item_type, item_data, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[userId, id, itemType, JSON.stringify(itemData || {}), date, time, notes || ""]
		);

		res.status(201).json({ id, msg: "Item added to itinerary" });
	} catch (err) {
		console.error("Error adding to itinerary:", err);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.updateItineraryItem = async (req, res) => {
	try {
		const connection = await connectQuery();
		const userId = req.user.id;
		const { id } = req.params;
		const { date, time, notes, itemData } = req.body;

		await connection.execute(
			"UPDATE itinerary_items SET date = ?, time = ?, notes = ?, item_data = ? WHERE item_id = ? AND user_id = ?",
			[date, time, notes, JSON.stringify(itemData || {}), id, userId]
		);

		res.json({ msg: "Item updated successfully" });
	} catch (err) {
		console.error("Error updating itinerary:", err);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.removeFromItinerary = async (req, res) => {
	try {
		const connection = await connectQuery();
		const userId = req.user.id;
		const { id } = req.params;

		await connection.execute("DELETE FROM itinerary_items WHERE item_id = ? AND user_id = ?", [
			id,
			userId,
		]);

		res.json({ msg: "Item removed from itinerary" });
	} catch (err) {
		console.error("Error removing from itinerary:", err);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.clearItinerary = async (req, res) => {
	try {
		const connection = await connectQuery();
		const userId = req.user.id;

		await connection.execute("DELETE FROM itinerary_items WHERE user_id = ?", [userId]);

		res.json({ msg: "Itinerary cleared successfully" });
	} catch (err) {
		console.error("Error clearing itinerary:", err);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

