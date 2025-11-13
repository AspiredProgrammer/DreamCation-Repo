import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const RegisterPage = () => {
	const [errors, setErrors] = useState([]);
	const [message, setMessage] = useState("");
	const navigate = useNavigate;
	const token = localStorage.getItem("token");
	let decodedToken = null;
	let isAuthorized = false;

	if (token && token.split(".").length === 3) {
		try {
			decodedToken = jwtDecode(token);
			isAuthorized = decodedToken?.scope === "ADMIN";
		} catch (err) {
			console.error("Invalid token:", err.message);
			localStorage.removeItem("token"); // Remove invalid token
		}
	}
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		phoneNum: "",
		password: "",
		confirm_password: "",
		role: "",
	});

	const handleSubmit = async (e) => {
		console.log("ENDPOINT is:", process.env.REACT_APP_ENDPOINT);

		e.preventDefault();
		//WORK IN PROGRESS, DON'T DELETE-->
		// formData.forEach((i) => {
		// 	if (
		// 		i === formData.firstName ||
		// 		i === formData.lastName ||
		// 		i === formData.username ||
		// 		i === formData.email
		// 	) {
		// 		toast.error(`${i} is required!`, { position: "bottom-right" });
		// 	}
		// 	if (i === formData.phoneNum) {
		// 		if (!i || i.length !== 10) {
		// 			toast.error(
		// 				"Phone number is required! Please enter a ten-digit number!",
		// 				{
		// 					position: "bottom-right",
		// 				}
		// 			);
		// 		}
		// 	}
		// 	if (i === formData.password || i === formData.confirm_password) {
		// 		if (!i || i.length < 10) {
		// 			toast.error(`${i} is required! At least 10 characters!`, {
		// 				position: "bottom-right",
		// 			});
		// 		}
		// 	}
		// 	if (formData.password !== formData.confirm_password) {
		// 		toast.error("Password and Confirm password must match", {
		// 			position: "bottom-right",
		// 		});
		// 	}
		// });
		// const fieldErrors = [];
		if (!formData.firstName) {
			toast.error("First name is required!", { position: "bottom-right" });
		}
		if (!formData.lastName) {
			toast.error("Last name is required", { position: "bottom-right" });
		}
		if (!formData.username) {
			toast.error("Username is required", { position: "bottom-right" });
		}
		if (!formData.email) {
			toast.error("Email is required", { position: "bottom-right" });
		}
		if (!formData.phoneNum) {
			toast.error("Phone number is required", { position: "bottom-right" });
		}
		if (!formData.password) {
			toast.error("Password is required", { position: "bottom-right" });
		}
		if (!formData.confirm_password) {
			toast.error("Confirm password is required", { position: "bottom-right" });
		}
		if (formData.password !== formData.confirm_password) {
			toast.error("Password and Confirm password must match", {
				position: "bottom-right",
			});
		}

		try {
			console.log(process.env);
			const response = await fetch(`/user/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(isAuthorized && token
						? { Authorization: `Bearer ${token}` }
						: {}),
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();
			if (!response.ok) {
				setErrors([{ id: 0, msg: data }]);
			} else if (response === 400) {
				console.log("User already exists!");

				toast.info("User already exists!", { position: "top-right" });

				// setErrors([{ id: 0, msg: data }]);
			} else {
				console.log("User registered successfully");
				// setMessage("Registration successful!");

				toast.success("Registration successful!", { position: "top-right" });

				navigate("/");

				setErrors([]);
				setFormData({
					firstName: "",
					lastName: "",
					username: "",
					email: "",
					phoneNum: "",
					password: "",
					confirm_password: "",
					role: "",
				});
			}
		} catch (error) {
			console.error("Error registering user:", error);
			toast.error("Error registering user!", { position: "top-right" });
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
		<div className="homepage">
			{/* <Navbar /> */}
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
							<ToastContainer />

							<form onSubmit={handleSubmit} className="search-form">
								<div className="form-group">
									<label>First name: </label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										value={formData.firstName}
										placeholder="e.g. Jane"
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Last name: </label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										value={formData.lastName}
										placeholder="e.g. Doe"
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Username: </label>
									<input
										type="text"
										id="username"
										name="username"
										value={formData.username}
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Email: </label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Phone number (excluding "-/"): </label>
									<input
										type="tel"
										id="phoneNum"
										name="phoneNum"
										value={formData.phoneNum}
										placeholder="e.g. 1234567890"
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Password: </label>
									<input
										type="password"
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
									/>
								</div>
								<div className="form-group">
									<label>Confirm your password: </label>
									<input
										type="password"
										id="confirm_password"
										name="confirm_password"
										value={formData.confirm_password}
										onChange={handleChange}
									/>
								</div>
								{/* {isAuthorized && ( */}
								<div className="form-group">
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
								{/* )} */}
								<button type="submit" className="search-button">
									Complete registration
								</button>
							</form>
						</div>
						<Link
							className="search-button"
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
