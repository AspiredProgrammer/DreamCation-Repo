import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

	const navigate = useNavigate();

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
		<div className="accountpage">
			<NavBar />
			<section className="main-box">
				<div className="inner-box">
					<div>
						<h1 className="main-title">My Account</h1>
						{isLoggedIn && (
							<p className="sub-title">
								Welcome to your account page, {username}
							</p>
						)}
					</div>
					<div>
						{isAuthorized && (
							<div>
								<p className="box-one">
									As an administrator, you may register any new users, right
									here:
								</p>
								<button
									className="navigate-btn"
									onClick={() => navigate("/register")}
								>
									Register
								</button>
							</div>
						)}
						<div className="box-two">
							<span className="box-one">
								Would you like to see your itinerary? Click below!
							</span>
							<button
								className="navigate-btn"
								onClick={() => navigate("/itinerary")}
							>
								Go to Itinerary
							</button>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
};

export default AccountPage;
