const db = require("../config/db_set_up");

module.exports = class Itinerary {
	constructor(userId, itemType, itemId, itemData, date = null, time = null, notes = "") {
		this.userId = userId;
		this.itemType = itemType; // 'flight', 'hotel', or 'attraction'
		this.itemId = itemId; // unique identifier for the item
		this.itemData = itemData; // JSON object containing item details
		this.date = date; // specific date for this item
		this.time = time; // specific time for this item
		this.notes = notes; // user notes for this item
		this.createdAt = new Date();
	}

	async save() {
		try {
			const connection = await db();
			const result = await connection.execute(
				"INSERT INTO itinerary (user_id, item_type, item_id, item_data, date, time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					this.userId,
					this.itemType,
					this.itemId,
					JSON.stringify(this.itemData),
					this.date,
					this.time,
					this.notes,
					this.createdAt
				]
			);
			return result[0].insertId;
		} catch (error) {
			throw error;
		}
	}

	static async findByUserId(userId) {
		try {
			const connection = await db();
			const [rows] = await connection.execute(
				"SELECT * FROM itinerary WHERE user_id = ? ORDER BY date ASC, time ASC, created_at ASC",
				[userId]
			);
			return rows.map(row => ({
				...row,
				item_data: JSON.parse(row.item_data)
			}));
		} catch (error) {
			throw error;
		}
	}

	static async findById(itineraryId) {
		try {
			const connection = await db();
			const [rows] = await connection.execute(
				"SELECT * FROM itinerary WHERE id = ?",
				[itineraryId]
			);
			if (rows.length === 0) return null;
			const row = rows[0];
			return {
				...row,
				item_data: JSON.parse(row.item_data)
			};
		} catch (error) {
			throw error;
		}
	}

	static async updateItem(itineraryId, updates) {
		try {
			const connection = await db();
			const allowedUpdates = ['date', 'time', 'notes'];
			const updateFields = [];
			const updateValues = [];

			Object.keys(updates).forEach(key => {
				if (allowedUpdates.includes(key) && updates[key] !== undefined) {
					updateFields.push(`${key} = ?`);
					updateValues.push(updates[key]);
				}
			});

			if (updateFields.length === 0) {
				throw new Error('No valid fields to update');
			}

			updateValues.push(itineraryId);
			await connection.execute(
				`UPDATE itinerary SET ${updateFields.join(', ')} WHERE id = ?`,
				updateValues
			);
			return true;
		} catch (error) {
			throw error;
		}
	}

	static async deleteById(itineraryId) {
		try {
			const connection = await db();
			const result = await connection.execute(
				"DELETE FROM itinerary WHERE id = ?",
				[itineraryId]
			);
			return result[0].affectedRows > 0;
		} catch (error) {
			throw error;
		}
	}

	static async deleteByUserId(userId) {
		try {
			const connection = await db();
			await connection.execute(
				"DELETE FROM itinerary WHERE user_id = ?",
				[userId]
			);
			return true;
		} catch (error) {
			throw error;
		}
	}

	static async checkItemExists(userId, itemType, itemId) {
		try {
			const connection = await db();
			const [rows] = await connection.execute(
				"SELECT * FROM itinerary WHERE user_id = ? AND item_type = ? AND item_id = ?",
				[userId, itemType, itemId]
			);
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw error;
		}
	}

	static async getItineraryStats(userId) {
		try {
			const connection = await db();
			const [rows] = await connection.execute(
				"SELECT item_type, COUNT(*) as count FROM itinerary WHERE user_id = ? GROUP BY item_type",
				[userId]
			);
			
			const stats = {
				flights: 0,
				hotels: 0,
				attractions: 0,
				total: 0
			};

			rows.forEach(row => {
				stats[row.item_type] = row.count;
				stats.total += row.count;
			});

			return stats;
		} catch (error) {
			throw error;
		}
	}
};
