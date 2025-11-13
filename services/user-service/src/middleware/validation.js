const { check } = require("express-validator");

exports.registerValidation = [
	check("firstName", "First Name is required").notEmpty(),
	check("lastName", "Last Name is required").notEmpty(),
	check("username", "Username is required").notEmpty(),
	check("email", "Email is required").notEmpty(),
	check("email", "Email is invalid").isEmail(),
	check("password", "Password is required").notEmpty(),
	check("phoneNum", "Phone number is required").notEmpty(),
	check("confirm_password", "Confirm password is required").notEmpty(),
	check("confirm_password", "Password and confirm password do not match").custom(
		(value, { req }) => value === req.body.password
	),
];

exports.loginValidation = [
	check("username", "Username is required").notEmpty(),
	check("password", "Password is required").notEmpty(),
];

