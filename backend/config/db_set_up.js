const express = require("express");
require("dotenv").config();
const mysql = require("mysql2/promise");
// const bodyParser = require("body-parser");
const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// console.log(process.env.DB_PASSWORD);

//MySQL Connection Set Up:
let connection;

async function connect_query() {
	if (!connection) {
		try {
			connection = await mysql.createConnection({
				host: "localhost",
				user: "root",
				password: process.env.DB_PASSWORD,
				database: "dreamdb",
			});
			console.log("Connected to database!");
			// const [rows, fields] = await connection.execute("SELECT * FROM users");
			// console.log("Query results: ", rows);
		} catch (err) {
			console.error("Error: ", err);
		}
	}
	return connection;
}
connect_query();
//-----------------------------------------------
//Fetch users from users table:
//-----------------------------------------------
// app.get("/api/users", (req, res) => {
// 	const sql = "SELECT * FROM users";
// 	db.query(sql, (err, results) => {
// 		if (err) {
// 			console.error("Error fetching users:", err);
// 			res.status(500).send("Error fetching data");
// 			return;
// 		}
// 		res.json(results);
// 	});
// });

// app.listen(3306, () => {
// 	console.log(`Database server running on port 3306`);
// });
module.exports = connect_query;
