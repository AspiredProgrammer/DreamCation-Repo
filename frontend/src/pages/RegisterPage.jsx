import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const RegisterPage = () => {
	const [errors, setErrors] = useState([]);
	const [message, setMessage] = useState("");

	const isLoggedIn = localStorage.getItem("token") !== null;
	const token = isLoggedIn ? localStorage.getItem("token") : null;
	const decodedToken = token ? jwtDecode(token) : null;
	const scope = decodedToken ? decodedToken.scope : "";
	const isAuthorized = isLoggedIn && scope === "ADMIN";

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		phoneNum: "",
		password: "",
		confirm_password: "",
	});

	const handleSubmit = async (e) => {
		console.log("ENDPOINT is:", process.env.ENDPOINT);

		e.preventDefault();

		const fieldErrors = [];
		if (!formData.firstName) {
			fieldErrors.push("First name is required");
		}
		if (!formData.lastName) {
			fieldErrors.push("Last name is required");
		}
		if (!formData.username) {
			fieldErrors.push("Username is required");
		}
		if (!formData.email) {
			fieldErrors.push("Email is required");
		}
		if (!formData.phoneNum) {
			fieldErrors.push("Phone number is required");
		}
		if (!formData.password) {
			fieldErrors.push("Password is required");
		}
		if (!formData.confirm_password) {
			console.log(formData.password);
			console.log(formData.confirm_password);
			fieldErrors.push("Confirm password is required");
		}
		if (formData.password !== formData.confirm_password) {
			console.log(formData.password);
			console.log(formData.confirm_password);
			fieldErrors.push("Password and Confirm password must be the same");
		}

		if (fieldErrors.length > 0) {
			setErrors(
				fieldErrors.map((text, i) => ({
					id: i,
					text,
				}))
			);
			return;
		}

		try {
			console.log(process.env);
			const response = await fetch(`http://localhost:8000/user/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// ...(isAuthorized && token
					// 	? { Authorization: `Bearer ${token}` }
					// 	: {}),
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();
			if (!response.ok) {
				setErrors([{ id: 0, msg: data }]);
			} else {
				console.log("User registered successfully");
				setMessage("Registration successful!");
				// window;
				setErrors([]);
				setFormData({
					firstName: "",
					lastName: "",
					username: "",
					email: "",
					phoneNum: "",
					password: "",
					confirm_password: "",
				});
			}
		} catch (error) {
			console.error("Error registering user:", error);
			setErrors([{ id: 0, msg: "Something went wrong." }]);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
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
								<div style={{ marginBottom: "1px", width: "70%" }}>
									{errors.map((error) => (
										<div key={error.id} class="alert alert-danger" role="alert">
											{error.text}
										</div>
									))}
								</div>
							)}
							{message && (
								<div
									style={{
										marginBottom: "1px",
									}}
								>
									<div class="alert alert-success" role="alert">
										{message}
									</div>
								</div>
							)}

							<form onSubmit={handleSubmit}>
								<div>
									<label>First name: </label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Last name: </label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Username: </label>
									<input
										type="text"
										id="username"
										name="username"
										value={formData.username}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Email: </label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Phone number: </label>
									<input
										type="tel"
										id="phoneNum"
										name="phoneNum"
										value={formData.phoneNum}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Password: </label>
									<input
										type="password"
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
									/>
								</div>
								<div>
									<label>Confirm your password: </label>
									<input
										type="password"
										id="confirm_password"
										name="confirm_password"
										value={formData.confirm_password}
										onChange={handleChange}
									/>
								</div>
								{isAuthorized && (
									<div>
										<label htmlFor="role">Select role</label>
										<select
											id="role"
											name="role"
											value={formData.role}
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
