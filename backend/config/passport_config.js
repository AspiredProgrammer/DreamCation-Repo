const LocalStrategy = require("passport-local").Strategy;
const connect_query = require("./db_set_up");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					const connection = await connect_query();

					let userResults = await connection.execute(
						"SELECT * from users WHERE email = ?",
						[email]
					);
					if (userResults.length === 0) {
						return done(null, false, { message: "User not found" });
					}

					let isaMatch = await bcrypt.compare(
						password,
						userResults[0].password
					);
					if (isaMatch) {
						return done(null, userResults[0]);
					} else {
						return done(null, false, { message: "Invalid credentials" });
					}
				} catch (error) {
					console.error(error);
					return done(error);
				}
			}
		)
	);

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(async function (id, done) {
		try {
			const connection = await connect_query();

			let userResults = await connection.execute(
				"SELECT * from users WHERE id = ?",
				[id]
			);
			if (userResults.length === 0) {
				return done(null, false, {
					message: "User not found during deserialization",
				});
			}
			const user = userResults[0];
			done(null, user);
		} catch (error) {
			console.error("Error in deserializing user: ", error);
			done(error, null);
		}
	});
};
