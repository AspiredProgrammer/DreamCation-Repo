import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Styles/Account.css";

const AccountPage = () => {
	const [username, setUsername] = useState("");
	const isLoggedIn = localStorage.getItem("token") !== null;

	const token = isLoggedIn ? localStorage.getItem("token") : null;
	const decodedToken = token ? jwtDecode(token) : null;
	const scope = decodedToken ? decodedToken.scope : "";

	const isAuthorized = isLoggedIn && scope === "ADMIN";

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlToken = params.get("token");
		if (urlToken) {
			localStorage.setItem("token", urlToken);
		}
		const token = localStorage.getItem("token");
		if (token) {
			const decoded = jwtDecode(token);

			setUsername(decoded.username);
		} else {
			window.location.href = "/404";
		}
	}, []);
	return (
		<div className="homepage mainbox">
			<NavBar />
			{/* <div style={{ margin: "20px" }}>
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
			</div> */}
			<section className="main-box">
				<div className="content">
					<div>
						<h1 className="main-title">My Account</h1>
						{isLoggedIn && (
							<p className="subtitle">
								Welcome to your account page, {username}
							</p>
						)}
					</div>

					{isAuthorized && (
						<>
							<div style={{ backgroundColor: "red" }}>
								<p>
									As an administrator, you may register any new users, right
									here:
								</p>
								<Link to="/register">Register</Link>
							</div>
						</>
					)}
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default AccountPage;
