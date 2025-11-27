import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/Login.css";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate;
	// const [error, setError] = useState("");

	const handleLogin = async (e, type) => {
		e.preventDefault();
		if (!username || !password) {
			toast.error("Username and password is required!", {
				position: "bottom-right",
			});
			return;
		}
		try {
			console.log(process.env);
			// http://localhost:8001/user/login
			const response = await fetch(process.env.USER_ENDPOINT + `user/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					// setError("Invalid credentials");
					toast.error("Invalid credentials", { position: "bottom-right" });
				} else {
					throw new Error(response.statusText || "An error occurred");
				}
				return;
			}
			const data = await response.json();
			const token = data.token;
			localStorage.setItem("token", token);

			console.log("Login successful");
			toast.success("Login successful!", { position: "top-right" });
			window.location.href = "/";
			// window.location.href = "/"; // Redirect to the  home page
		} catch (error) {
			console.log(error.message);
			// setError(error.message);
		}
	};

	return (
		<div className="loginpage">
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
			<section className="main-box">
				<div className="content">
					<div>
						<h1 className="big-title">Login</h1>

						<ToastContainer />

						<form onSubmit={handleLogin} className="search-form">
							<div className="form-group">
								<label>Username:</label>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</div>

							<div className="form-group">
								<label>Password: </label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<button type="submit" className="search-button">
								Login
							</button>
						</form>
						<div>
							<Link
								className="search-button"
								to="/register"
								style={{
									textDecoration: "none",
									fontWeight: "bold",
									fontSize: "16px",
								}}
							>
								Not registered? Click here to register!
							</Link>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default LoginPage;
