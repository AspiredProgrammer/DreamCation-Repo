import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const RegisterPage = () => {
	const [errors, setErrors] = useState([]);
	const [msg, setMsg] = useState("");

	const isLoggedIn = localStorage.getItem("token") !== null;
	const token = isLoggedIn ? localStorage.getItem("token") : null;
	const decodedToken = token ? jwtDecode(token) : null;
	const scope = decodedToken ? decodedToken.scope : "";
	const isAuthorized = isLoggedIn && scope === "ADMIN";

	const [form, setForm] = useState({
		f_name: "",
		l_name: "",
		username: "",
		password: "",
		email: "",
		phoneNum: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		const fieldErrors = [];
		if (!form.f_name) {
			fieldErrors.push("First name is required");
		}
		if (!form.l_name) {
			fieldErrors.push("Last name is required");
		}
		if (!form.username) {
			fieldErrors.push("Username is required");
		}
		if (!form.password) {
			fieldErrors.push("Password is required");
		}
		if (!form.email) {
			fieldErrors.push("Email is required");
		}
		if (!form.phoneNum) {
			fieldErrors.push("Phone number is required");
		}
		if (!form.confirm_password) {
			fieldErrors.push("Confirm password is required");
		}
		if (form.password !== form.confirm_password) {
			fieldErrors.push("Password and Confirm password must be the same");
		}

		if (fieldErrors.length > 0) {
			setErrors(fieldErrors.map((text, i) => ({ id: i, text })));
			return;
		}

		try {
			const response = await fetch(`${process.env.ENDPOINT}/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(form),
			});

			const data = await response.json();
			if (!response.ok) {
				setErrors([{ id: 0, msg: data }]);
			} else {
				console.log("User registered successfully");
				setMsg("Registration successful!");

				setErrors([]);
				setForm({
					f_name: "",
					l_name: "",
					username: "",
					password: "",
					email: "",
					phoneNum: "",
				});
			}
		} catch (error) {
			console.error("Error registering user:", error);
			setErrors([{ id: 0, msg: "Something went wrong." }]);
		}
	};

	const handleChange = (e) => {
		setForm({
			...form,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="base">
			{/* <NavBar /> */}
			<div style={{ margin: "20px" }}>
				<Link
					to="/"
					style={{
						textDecoration: "none",
						color: "#667eea",
						fontWeight: "bold",
						fontSize: "16px",
					}}
				>
					← Back to Home
				</Link>
			</div>
			<section id="home" className="main-box">
				<div className="content">
					<div>
						<h1 className="main-title">Registration</h1>
						<div>
							{errors.length > 0 && (
								<div style={{ marginBottom: "1rem" }}>
									{errors.map((error) => (
										<p>
											<div
												key={error.id}
												class="alert alert-danger"
												role="alert"
											>
												{error.msg}
											</div>
										</p>
									))}
								</div>
							)}
							{msg && (
								<div
									style={{
										marginBottom: "1rem",
									}}
								>
									<p>
										<div class="alert alert-success" role="alert">
											{msg}
										</div>
									</p>
								</div>
							)}

							<form onSubmit={handleSubmit}>
								<div>
									<label>First name: </label>
									<input
										type="text"
										id="f_name"
										name="f_name"
										value={form.f_name}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Last name: </label>
									<input
										type="text"
										id="l_name"
										name="l_name"
										value={form.l_name}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Username: </label>
									<input
										type="text"
										id="username"
										name="username"
										value={form.username}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Email: </label>
									<input
										type="email"
										id="email"
										name="email"
										value={form.email}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Phone number: </label>
									<input
										type="tel"
										id="phoneNum"
										name="phoneNum"
										value={form.phoneNum}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Password: </label>
									<input
										type="password"
										id="password"
										name="password"
										value={form.password}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Confirm your password: </label>
									<input
										type="password"
										id="c_password"
										name="c_password"
										value={form.confirm_password}
										onChange={handleChange}
									/>
								</div>
								{isAuthorized && (
									<div>
										<label htmlFor="role">Select role</label>
										<select
											id="role"
											name="role"
											value={form.role}
											onChange={handleChange}
										>
											<option value="" disabled>
												Choose...
											</option>
											<option value="ADMIN">ADMIN</option>
											<option value="CUSTOMER">CUSTOMER</option>
										</select>
									</div>
								)}
								<button type="submit">Complete registration</button>
							</form>
						</div>
						<Link
							className="btn-secondary"
							to="/login"
							style={{
								textDecoration: "none",
								fontWeight: "bold",
								fontSize: "16px",
							}}
						>
							Already registered? Click here to log in!
						</Link>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default RegisterPage;
