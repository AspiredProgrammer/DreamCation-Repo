const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const connectQuery = require("../config/db");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const connection = await connectQuery();

		// Check if user already exists
		const [rows] = await connection.execute("SELECT * from users WHERE email = ?", [
			req.body.email,
		]);

		if (rows.length > 0) {
			return res.status(400).json({ msg: "This User already exists" });
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		// Insert new user
		await connection.execute(
			"INSERT into users (firstName, lastName, username, password, email, phoneNum, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				req.body.firstName,
				req.body.lastName,
				req.body.username,
				hashedPassword,
				req.body.email,
				req.body.phoneNum,
				req.body.role || "CUSTOMER",
			]
		);

		res.status(201).json({ msg: "User created successfully" });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.login = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const connection = await connectQuery();

		// Check if user exists
		const [rows] = await connection.execute("SELECT * from users WHERE username = ?", [
			req.body.username,
		]);

		if (rows.length === 0) {
			return res.status(401).json({ msg: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(req.body.password, rows[0].password);
		if (!isMatch) {
			return res.status(401).json({ msg: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ id: rows[0].id, username: rows[0].username, scope: rows[0].role },
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			}
		);

		return res.status(200).json({ token });
	} catch (err) {
		console.log(err.message);
		res.status(500).json({ error: "Server Error", details: err.message });
	}
};

exports.logout = (req, res) => {
	res.status(200).json({ msg: "Logout successful" });
};

