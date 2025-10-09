import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

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
			const response = await fetch(`http://localhost:8000/user/login`, {
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
			navigate("/");
			// window.location.href = "/"; // Redirect to the  home page
		} catch (error) {
			console.log(error.message);
			// setError(error.message);
		}
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
						<h1 className="main-title">Login</h1>

						<ToastContainer />

						<form onSubmit={handleLogin}>
							<div>
								<label>Username:</label>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</div>

							<div>
								<label>Password: </label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<div>
								<button type="submit" className="btn-primary">
									Login
								</button>
								<Link
									className="btn-secondary"
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
						</form>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default LoginPage;
