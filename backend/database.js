const express = require("express");
require("dotenv").config();
const mysql2 = require("mysql2");
// const bodyParser = require("body-parser");
const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// console.log(process.env.DB_PASSWORD);

//MySQL Connection Set Up:
const db = mysql2.createConnection({
	host: "localhost",
	user: "root",
	password: process.env.DB_PASSWORD,
	database: "dreamdb",
});

// module.exports = pool.promise();

db.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL:", err);
		return;
	}
	console.log("Connected to MySQL database");
});

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

app.listen(3306, () => {
	console.log(`Database server running on port 3306`);
});

module.exports = db;
