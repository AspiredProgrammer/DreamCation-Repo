const db = require("../database");

module.exports = class User {
	constructor(firstName, lastName, username, email, password, phoneNum) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.username = username;
		this.email = email;
		this.password = password;
		this.phoneNum = phoneNum;
	}

	// save() {
	// 	return db.execute(
	// 		"INSERT INTO users (firstName, lastName, username, email, password, phoneNum) VALUES (?, ?, ?, ?, ?, ?)",
	// 		[
	// 			this.firstName,
	// 			this.lastName,
	// 			this.username,
	// 			this.email,
	// 			this.password,
	// 			this.phoneNum,
	// 		]
	// 	);
	// }

	// static fetchAll() {
	// 	return db.execute("SELECT * FROM users");
	// }
};
