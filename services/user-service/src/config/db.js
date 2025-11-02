require("dotenv").config({ path: require("path").join(__dirname, "../../../../.env") });
const mysql = require("mysql2/promise");

let connection;

async function connectQuery() {
	if (!connection) {
		try {
			connection = await mysql.createConnection({
				host: process.env.DB_HOST || "localhost",
				user: process.env.DB_USER || "root",
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME || "dreamdb",
			});
			console.log("✅ User Service: Connected to database!");
		} catch (err) {
			console.error("❌ User Service: Database connection error", err);
			throw err;
		}
	}
	return connection;
}

// Initialize connection
connectQuery();

module.exports = connectQuery;

